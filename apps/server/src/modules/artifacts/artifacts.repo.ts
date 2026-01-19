import type { ArtifactRow } from './artifacts.types.js'
import type { SupabaseClient } from '@supabase/supabase-js'

export async function insertArtifact(
  db: SupabaseClient,
  input: {
    run_id: string
    project_id: string
    owner_id: string
    type: ArtifactRow['type']
    content_markdown: string
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    citations: any[]
  }
): Promise<ArtifactRow> {
  const { data, error } = await db
    .from('artifacts')
    .insert({
      run_id: input.run_id,
      project_id: input.project_id,
      owner_id: input.owner_id,
      type: input.type,
      content_markdown: input.content_markdown,
      citations: input.citations,
    })
    .select('*')
    .single()

  if (error) throw error
  return data as ArtifactRow
}

export async function selectLatestArtifactsByRunId(
  db: SupabaseClient,
  runId: string
): Promise<{ plan: ArtifactRow | null; experimentCard: ArtifactRow | null }> {
  const { data, error } = await db
    .from('artifacts')
    .select('*')
    .eq('run_id', runId)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) throw error

  const rows = (data ?? []) as ArtifactRow[]

  const plan = rows.find(r => r.type === 'plan_30_60_90') ?? null
  const experimentCard = rows.find(r => r.type === 'experiment_card') ?? null

  return { plan, experimentCard }
}

export async function selectArtifactsByRunId(
  db: SupabaseClient,
  runId: string
): Promise<ArtifactRow[]> {
  const { data, error } = await db
    .from('artifacts')
    .select('*')
    .eq('run_id', runId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data ?? []) as ArtifactRow[]
}
