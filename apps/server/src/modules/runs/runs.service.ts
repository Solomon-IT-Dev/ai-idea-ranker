import { OPENAI_CHAT_MODEL_DEFAULT, PROMPT_VERSION } from '../../constants/chat.constants.js'
import { AppError } from '../../lib/appError.lib.js'
import { logger } from '../../lib/logger.lib.js'
import { chatJson } from '../../lib/openaiChat.lib.js'
import { closeRunStream, publishRunEvent } from '../../lib/runStream.lib.js'
import { searchPlaybook } from '../playbook/playbook.service.js'
import { assertProjectAccess } from '../projects/projects.guard.js'

import {
  insertIdeaScores,
  insertRun,
  selectIdeasByProjectId,
  selectIdeaScoresByRunId,
  selectProjectById,
  selectRunById,
  selectRunsByProjectId,
  updateRun,
} from './runs.repo.js'
import { aiRunResultSchema } from './runs.schemas.js'

import type { SupabaseClient } from '@supabase/supabase-js'

function computeOverallRaw(
  s: { impact: number; effort: number; risk: number; dataReadiness: number },
  w: { impact: number; effort: number; risk: number; dataReadiness: number }
) {
  // Higher impact is better; higher effort/risk is worse; higher data readiness is better.
  return (
    w.impact * s.impact + w.dataReadiness * s.dataReadiness - w.effort * s.effort - w.risk * s.risk
  )
}

function normalizeOverallTo100(
  raw: number,
  w: { impact: number; effort: number; risk: number; dataReadiness: number }
) {
  // Score ranges when each metric is in [1..10]
  const pos = w.impact + w.dataReadiness
  const neg = w.effort + w.risk

  const maxRaw = pos * 10 - neg * 1
  const minRaw = pos * 1 - neg * 10

  if (maxRaw === minRaw) return 50

  const normalized = ((raw - minRaw) / (maxRaw - minRaw)) * 100
  return Math.max(0, Math.min(100, normalized))
}

function safeJsonParse(input: string) {
  try {
    return JSON.parse(input)
  } catch {
    throw new AppError({
      statusCode: 502,
      errorType: 'openai_invalid_json',
      message: 'AI returned invalid JSON.',
    })
  }
}

async function executeRunInternal(
  db: SupabaseClient,
  input: {
    ownerId: string
    projectId: string
    topN: number
    weights: { impact: number; effort: number; risk: number; dataReadiness: number }
    project: { id: string; name: string; constraints: unknown }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ideasCapped: any[]
    inputSnapshot: unknown
  },
  run: { id: string }
) {
  publishRunEvent(run.id, 'run.started', { runId: run.id, projectId: input.projectId })

  try {
    publishRunEvent(run.id, 'plan.progress', {
      runId: run.id,
      stage: 'retrieval',
      message: 'Retrieving playbook sources...',
    })

    const sources = await searchPlaybook(db, {
      projectId: input.projectId,
      query:
        'Best practices for prioritizing R&D ideas by impact, effort, risk, and data readiness. Include guidance on metrics and go/no-go.',
      topK: 6,
    })

    if (sources.length === 0) {
      throw new AppError({
        statusCode: 400,
        errorType: 'playbook_empty',
        message: 'Playbook has no chunks; cannot run RAG scoring.',
      })
    }

    const sourceIds = new Set(sources.map(s => s.id))
    const sourcesUsed = sources.map(s => ({
      chunkId: s.id,
      title: s.chunk_title ?? null,
      similarity: s.similarity ?? null,
    }))

    await updateRun(db, run.id, { sources_used: sourcesUsed })

    publishRunEvent(run.id, 'plan.progress', {
      runId: run.id,
      stage: 'sources_ready',
      message: `Sources ready: ${sourcesUsed.length} chunks.`,
      count: sourcesUsed.length,
    })

    const sourcesText = sources
      .map(s => {
        const title = s.chunk_title ? `Title: ${s.chunk_title}` : 'Title: (none)'
        return `Source chunkId=${s.id}\n${title}\n${s.chunk_text}`
      })
      .join('\n\n---\n\n')

    const ideasText = input.ideasCapped
      .map(i => `ideaId=${i.id}\ntitle=${i.title}\ntext=${i.raw_text}`)
      .join('\n\n---\n\n')

    const system = `
You are an R&D prioritization assistant.
Return ONLY valid JSON that matches the required schema.
Use the provided Sources to justify best-practice tips and include citations.
Citations must reference chunkId values exactly as provided and the quote must be copied from the Source text.
Scores are 1..10.
- Higher impact is better.
- Higher dataReadiness is better.
- Higher effort is worse.
- Higher risk is worse.
Do not invent sources. If a claim requires a best-practice tip, cite it.
`.trim()

    const user = `
PROJECT CONSTRAINTS (use for rough estimates):
${JSON.stringify(input.project.constraints ?? {}, null, 2)}

SOURCES:
${sourcesText}

IDEAS:
${ideasText}

TASK:
For each idea, output:
- ideaId
- impact, effort, risk, dataReadiness (1..10)
- rationale (brief)
- citations: up to 8 items { chunkId, quote } copied from Sources
- costEstimateUsd (optional, rough)
- resourceEstimate: { feDays?, beDays?, dsDays? } (rough)
Return JSON with shape: { "scores": [ ... ] }.
`.trim()

    publishRunEvent(run.id, 'plan.progress', {
      runId: run.id,
      stage: 'scoring',
      message: 'Scoring ideas with AI...',
    })

    const { model, content } = await chatJson(system, user, { model: OPENAI_CHAT_MODEL_DEFAULT })

    const rawJson = safeJsonParse(content)
    const parsed = aiRunResultSchema.parse(rawJson)

    const allowedIdeaIds = new Set(input.ideasCapped.map(i => i.id))
    for (const s of parsed.scores) {
      if (!allowedIdeaIds.has(s.ideaId)) {
        throw new AppError({
          statusCode: 502,
          errorType: 'openai_invalid_idea_id',
          message: 'AI returned an unknown ideaId.',
        })
      }

      for (const c of s.citations ?? []) {
        if (!sourceIds.has(c.chunkId)) {
          throw new AppError({
            statusCode: 502,
            errorType: 'openai_invalid_citation',
            message: 'AI returned a citation to an unknown source chunk.',
          })
        }
      }
    }

    publishRunEvent(run.id, 'plan.progress', {
      runId: run.id,
      stage: 'persist',
      message: 'Saving scores...',
    })

    const rows = parsed.scores.map(s => {
      const rawOverall = computeOverallRaw(
        { impact: s.impact, effort: s.effort, risk: s.risk, dataReadiness: s.dataReadiness },
        input.weights
      )
      const overall = normalizeOverallTo100(rawOverall, input.weights)

      return {
        run_id: run.id,
        project_id: input.projectId,
        owner_id: input.ownerId,
        idea_id: s.ideaId,
        impact: s.impact,
        effort: s.effort,
        risk: s.risk,
        data_readiness: s.dataReadiness,
        overall,
        rationale: s.rationale,
        citations: s.citations ?? [],
        cost_estimate_usd: s.costEstimateUsd,
        resource_estimate: s.resourceEstimate ?? {},
      }
    })

    const savedScores = await insertIdeaScores(db, rows)

    // Publish per-idea progress (MVP: from saved rows; future: stream inside AI loop)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    for (const s of savedScores as any[]) {
      publishRunEvent(run.id, 'idea.scored', {
        runId: run.id,
        ideaId: s.idea_id,
        overall: s.overall,
      })
    }

    const updatedRun = await updateRun(db, run.id, {
      status: 'completed',
      model,
      sources_used: sourcesUsed,
      raw_ai_response: rawJson,
      error_type: null,
      error_message: null,
    })

    publishRunEvent(run.id, 'run.completed', { runId: run.id, status: updatedRun.status })
    closeRunStream(run.id)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sorted = [...savedScores].sort((a: any, b: any) => b.overall - a.overall)
    const top = sorted.slice(0, input.topN)

    return { run: updatedRun, top }
  } catch (err) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const e = err as any

    const failedRun = await updateRun(db, run.id, {
      status: 'failed',
      error_type: e?.errorType ?? 'unknown_error',
      error_message: e?.message ?? 'Run failed.',
    })

    publishRunEvent(run.id, 'run.failed', {
      runId: run.id,
      status: failedRun.status,
      errorType: e?.errorType ?? 'unknown_error',
      message: e?.message ?? 'Run failed.',
    })
    closeRunStream(run.id)

    throw err
  }
}

export async function createRun(
  db: SupabaseClient,
  input: {
    ownerId: string
    projectId: string
    topN: number
    weights: { impact: number; effort: number; risk: number; dataReadiness: number }
  }
) {
  await assertProjectAccess(db, input.projectId)

  const project = await selectProjectById(db, input.projectId)

  const ideas = await selectIdeasByProjectId(db, input.projectId)
  if (ideas.length === 0) {
    throw new AppError({
      statusCode: 400,
      errorType: 'ideas_empty',
      message: 'No ideas found for this project.',
    })
  }

  const maxIdeas = 40
  const ideasCapped = ideas.slice(0, maxIdeas)

  const inputSnapshot = {
    project: { id: project.id, name: project.name, constraints: project.constraints },
    ideas: ideasCapped.map(i => ({ id: i.id, title: i.title, text: i.raw_text })),
    weights: input.weights,
    topN: input.topN,
    promptVersion: PROMPT_VERSION,
  }

  const run = await insertRun(db, {
    project_id: input.projectId,
    owner_id: input.ownerId,
    model: OPENAI_CHAT_MODEL_DEFAULT,
    weights: input.weights,
    top_n: input.topN,
    prompt_version: PROMPT_VERSION,
    input_snapshot: inputSnapshot,
  })

  return executeRunInternal(db, { ...input, project, ideasCapped, inputSnapshot }, run)
}

export async function startRun(
  db: SupabaseClient,
  input: {
    ownerId: string
    projectId: string
    topN: number
    weights: { impact: number; effort: number; risk: number; dataReadiness: number }
  }
) {
  await assertProjectAccess(db, input.projectId)

  const project = await selectProjectById(db, input.projectId)

  const ideas = await selectIdeasByProjectId(db, input.projectId)
  if (ideas.length === 0) {
    throw new AppError({
      statusCode: 400,
      errorType: 'ideas_empty',
      message: 'No ideas found for this project.',
    })
  }

  const maxIdeas = 40
  const ideasCapped = ideas.slice(0, maxIdeas)

  const inputSnapshot = {
    project: { id: project.id, name: project.name, constraints: project.constraints },
    ideas: ideasCapped.map(i => ({ id: i.id, title: i.title, text: i.raw_text })),
    weights: input.weights,
    topN: input.topN,
    promptVersion: PROMPT_VERSION,
  }

  const run = await insertRun(db, {
    project_id: input.projectId,
    owner_id: input.ownerId,
    model: OPENAI_CHAT_MODEL_DEFAULT,
    weights: input.weights,
    top_n: input.topN,
    prompt_version: PROMPT_VERSION,
    input_snapshot: inputSnapshot,
  })

  void executeRunInternal(db, { ...input, project, ideasCapped, inputSnapshot }, run).catch(err => {
    logger.error({ err, runId: run.id }, 'Async run execution failed.')
  })

  return { run }
}

export async function getRun(db: SupabaseClient, input: { projectId: string; runId: string }) {
  await assertProjectAccess(db, input.projectId)

  const run = await selectRunById(db, input.runId)

  if (run.project_id !== input.projectId) {
    throw new AppError({
      statusCode: 404,
      errorType: 'run_not_found',
      message: 'Run not found.',
    })
  }

  const scores = await selectIdeaScoresByRunId(db, input.runId)

  return { run, scores }
}

export async function listRuns(db: SupabaseClient, input: { projectId: string }) {
  await assertProjectAccess(db, input.projectId)

  return selectRunsByProjectId(db, input.projectId)
}
