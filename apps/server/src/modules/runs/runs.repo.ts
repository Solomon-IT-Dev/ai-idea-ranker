/* eslint-disable @typescript-eslint/no-explicit-any */
import type { RunRow } from './runs.types.js'
import type { SupabaseClient } from '@supabase/supabase-js'

export async function insertRun(
  db: SupabaseClient,
  input: {
    project_id: string
    owner_id: string
    model: string
    weights: any
    top_n: number
    prompt_version: string
    input_snapshot: any
  }
): Promise<RunRow> {
  const { data, error } = await db
    .from('runs')
    .insert({
      project_id: input.project_id,
      owner_id: input.owner_id,
      status: 'running',
      model: input.model,
      weights: input.weights,
      top_n: input.top_n,
      prompt_version: input.prompt_version,
      input_snapshot: input.input_snapshot,
      sources_used: [],
    })
    .select('*')
    .single()

  if (error) throw error
  return data as RunRow
}

export async function insertIdeaScores(
  db: SupabaseClient,
  rows: Array<{
    run_id: string
    project_id: string
    owner_id: string
    idea_id: string
    impact: number
    effort: number
    risk: number
    data_readiness: number
    overall: number
    rationale: string
    citations: any[]
    cost_estimate_usd?: number
    resource_estimate: any
  }>
) {
  const { data, error } = await db.from('idea_scores').insert(rows).select('*')
  if (error) throw error
  return data ?? []
}

export async function selectIdeasByProjectId(db: SupabaseClient, projectId: string) {
  const { data, error } = await db
    .from('ideas')
    .select('id,title,raw_text')
    .eq('project_id', projectId)
    .order('created_at', { ascending: true })

  if (error) throw error
  return data ?? []
}

export async function selectPlaybookChunksForProject(
  db: SupabaseClient,
  projectId: string,
  topK: number,
  query: string
) {
  // This calls your existing retrieval endpoint logic at service level:
  // We will use match_playbook_chunks RPC directly from playbook repo/service in the next iteration.
  // For now: retrieve via RPC in playbook module (recommended reuse).
  return { topK, query }
}

export async function selectProjectById(db: SupabaseClient, projectId: string) {
  const { data, error } = await db
    .from('projects')
    .select('id,name,constraints')
    .eq('id', projectId)
    .single()

  if (error) throw error
  return data as { id: string; name: string; constraints: any }
}

export async function updateRun(
  db: SupabaseClient,
  runId: string,
  patch: Partial<{
    status: string
    model: string
    sources_used: any
    input_snapshot: any
    raw_ai_response: any
    error_type: string | null
    error_message: string | null
  }>
) {
  const { data, error } = await db.from('runs').update(patch).eq('id', runId).select('*').single()

  if (error) throw error
  return data as any
}

export async function selectRunById(db: SupabaseClient, runId: string) {
  const { data, error } = await db.from('runs').select('*').eq('id', runId).single()
  if (error) throw error
  return data as any
}

export async function selectIdeaScoresByRunId(db: SupabaseClient, runId: string) {
  const { data, error } = await db
    .from('idea_scores')
    .select('*, ideas(id,title)')
    .eq('run_id', runId)
    .order('overall', { ascending: false })

  if (error) throw error
  return data ?? []
}
