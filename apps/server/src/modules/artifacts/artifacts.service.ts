import { OPENAI_CHAT_MODEL_DEFAULT } from '../../constants/chat.constants.js'
import { AppError } from '../../lib/appError.lib.js'
import { chatJson } from '../../lib/openaiChat.lib.js'
import { selectChunksByIds } from '../playbook/playbook.repo.js'
import { getRun } from '../runs/runs.service.js'

import { insertArtifact, selectLatestArtifactsByRunId } from './artifacts.repo.js'
import { aiArtifactsSchema } from './artifacts.schemas.js'

import type { SupabaseClient } from '@supabase/supabase-js'

function renderPlanMarkdown(plan: {
  title: string
  days30: string[]
  days60: string[]
  days90: string[]
  citations: Array<{ chunkId: string; quote: string }>
}) {
  const citeLines =
    plan.citations.length === 0
      ? ''
      : `\n\n## Sources\n${plan.citations
          .map((c, idx) => `- [C${idx + 1}] ${c.chunkId}: “${c.quote}”`)
          .join('\n')}`

  return `# ${plan.title}

## 0–30 days
${plan.days30.map(x => `- ${x}`).join('\n')}

## 31–60 days
${plan.days60.map(x => `- ${x}`).join('\n')}

## 61–90 days
${plan.days90.map(x => `- ${x}`).join('\n')}${citeLines}
`
}

function renderExperimentCardMarkdown(card: {
  title: string
  problem: string
  hypothesis: string
  dataset: string
  metrics: string[]
  goNoGo: string[]
  citations: Array<{ chunkId: string; quote: string }>
}) {
  const citeLines =
    card.citations.length === 0
      ? ''
      : `\n\n## Sources\n${card.citations
          .map((c, idx) => `- [C${idx + 1}] ${c.chunkId}: “${c.quote}”`)
          .join('\n')}`

  return `# Experiment Card — ${card.title}

## Problem
${card.problem}

## Hypothesis
${card.hypothesis}

## Dataset
${card.dataset}

## Metrics
${card.metrics.map(x => `- ${x}`).join('\n')}

## Go / No-go criteria
${card.goNoGo.map(x => `- ${x}`).join('\n')}${citeLines}
`
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

export async function generateArtifacts(
  db: SupabaseClient,
  input: { projectId: string; runId: string; topN: number }
) {
  // Reuse run loading and project access checks (RLS + guard already in runs service)
  const { run, scores } = await getRun(db, {
    projectId: input.projectId,
    runId: input.runId,
  })

  if (run.status !== 'completed') {
    throw new AppError({
      statusCode: 409,
      errorType: 'run_not_completed',
      message: 'Run is not completed yet.',
    })
  }

  if (!scores || scores.length === 0) {
    throw new AppError({
      statusCode: 400,
      errorType: 'run_has_no_scores',
      message: 'Run has no scores.',
    })
  }

  const topScores = scores.slice(0, input.topN)
  const topIdeaId = topScores[0]?.idea_id
  if (!topIdeaId) {
    throw new AppError({
      statusCode: 400,
      errorType: 'top_idea_missing',
      message: 'Top idea is missing for this run.',
    })
  }

  // Sources must come from the run to keep evidence consistent with scoring
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sourceIds: string[] = (run.sources_used ?? []).map((s: any) => s?.chunkId).filter(Boolean)

  if (sourceIds.length === 0) {
    throw new AppError({
      statusCode: 400,
      errorType: 'sources_missing',
      message: 'No playbook sources are associated with this run.',
    })
  }

  const sourceIdSet = new Set(sourceIds)

  // Fetch full chunk texts (stable sources)
  const sourceChunks = await selectChunksByIds(db, sourceIds)

  const sourcesText = sourceChunks
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((s: any) => {
      const title = s.chunk_title ? `Title: ${s.chunk_title}` : 'Title: (none)'
      return `Source chunkId=${s.id}\n${title}\n${s.chunk_text}`
    })
    .join('\n\n---\n\n')

  const ideasText = topScores
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((s: any, idx: number) => {
      const title = s.ideas?.title ?? '(no title)'
      const text = s.ideas?.raw_text ?? ''
      return `RANK=${idx + 1}
ideaId=${s.idea_id}
title=${title}
text=${text}
impact=${s.impact}
effort=${s.effort}
risk=${s.risk}
dataReadiness=${s.data_readiness}
overall=${s.overall}
rationale=${s.rationale}
resourceEstimate=${JSON.stringify(s.resource_estimate ?? {})}
costEstimateUsd=${s.cost_estimate_usd ?? ''}`
    })
    .join('\n\n---\n\n')

  const constraints = run.input_snapshot?.project?.constraints ?? {}

  const system = `
You are an R&D planning assistant.
Return ONLY valid JSON matching the required schema.
Use SOURCES for best-practice recommendations and include citations with exact chunkId values.
Quotes must be copied verbatim from SOURCES.
Do not invent sources.
Do not return citations as strings; citations must be objects: { "chunkId": "...", "quote": "..." }.
`.trim()

  const user = `
PROJECT CONSTRAINTS:
${JSON.stringify(constraints, null, 2)}

TOP IDEAS (ranked):
${ideasText}

SOURCES:
${sourcesText}

TASK:
1) Create a practical 30-60-90 day plan for executing the top ideas. Keep actions concrete.
   - Each list item must be an actionable step.
   - Respect constraints (budget/team) when proposing scope.
2) Create ONE Experiment Card for the #1 ranked idea (ideaId=${topIdeaId}).
   - The experimentCard.ideaId MUST equal ${topIdeaId}.
   - Include: problem, hypothesis, dataset, metrics, go/no-go.
3) Add citations for best-practice tips using chunkId values from SOURCES.
   - Quotes must be copied verbatim from SOURCES.
   - Keep citations concise and relevant.
   - citations must be objects: { "chunkId": "...", "quote": "..." }.

Return JSON:
{
  "plan": { "title", "days30": [...], "days60": [...], "days90": [...], "citations": [...] },
  "experimentCard": { "ideaId", "title", "problem", "hypothesis", "dataset", "metrics": [...], "goNoGo": [...], "citations": [...] }
}
`.trim()

  const { model, content } = await chatJson(system, user, {
    model: run.model ?? OPENAI_CHAT_MODEL_DEFAULT,
  })

  const raw = safeJsonParse(content)
  const parsed = aiArtifactsSchema.parse(raw)

  // Hard guarantee: experiment card is for #1 idea
  if (parsed.experimentCard.ideaId !== topIdeaId) {
    throw new AppError({
      statusCode: 502,
      errorType: 'openai_wrong_experiment_idea',
      message: 'AI generated experiment card for a non-top idea.',
    })
  }

  // Validate citations are only from allowed sources
  for (const c of parsed.plan.citations ?? []) {
    if (!sourceIdSet.has(c.chunkId)) {
      throw new AppError({
        statusCode: 502,
        errorType: 'openai_invalid_citation',
        message: 'AI returned a citation to an unknown source chunk.',
      })
    }
  }
  for (const c of parsed.experimentCard.citations ?? []) {
    if (!sourceIdSet.has(c.chunkId)) {
      throw new AppError({
        statusCode: 502,
        errorType: 'openai_invalid_citation',
        message: 'AI returned a citation to an unknown source chunk.',
      })
    }
  }

  const planMd = renderPlanMarkdown(parsed.plan)
  const cardMd = renderExperimentCardMarkdown(parsed.experimentCard)

  const planArtifact = await insertArtifact(db, {
    run_id: run.id,
    project_id: run.project_id,
    owner_id: run.owner_id,
    type: 'plan_30_60_90',
    content_markdown: planMd,
    citations: parsed.plan.citations ?? [],
  })

  const cardArtifact = await insertArtifact(db, {
    run_id: run.id,
    project_id: run.project_id,
    owner_id: run.owner_id,
    type: 'experiment_card',
    content_markdown: cardMd,
    citations: parsed.experimentCard.citations ?? [],
  })

  return {
    runId: run.id,
    model,
    artifacts: {
      plan: planArtifact,
      experimentCard: cardArtifact,
    },
  }
}

export async function getLatestArtifacts(
  db: SupabaseClient,
  input: { projectId: string; runId: string }
) {
  // Reuse run loading (ensures project access)
  await getRun(db, { projectId: input.projectId, runId: input.runId })

  const artifacts = await selectLatestArtifactsByRunId(db, input.runId)

  return {
    runId: input.runId,
    artifacts,
  }
}
