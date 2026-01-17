import type { MatchPlaybookChunkRow, PlaybookChunkRow, PlaybookRow } from './playbook.types.js'
import type { SupabaseClient } from '@supabase/supabase-js'

export async function upsertPlaybook(
  db: SupabaseClient,
  input: { project_id: string; owner_id: string; title: string; content_markdown: string }
): Promise<PlaybookRow> {
  // For MVP: one playbook per project. We implement it by selecting first and updating it if exists.
  const { data: existing } = await db
    .from('playbooks')
    .select('*')
    .eq('project_id', input.project_id)
    .order('created_at', { ascending: true })
    .limit(1)

  if (existing && existing.length > 0) {
    const id = existing[0].id as string
    const { data, error } = await db
      .from('playbooks')
      .update({
        title: input.title,
        content_markdown: input.content_markdown,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select('*')
      .single()

    if (error) throw error
    return data as PlaybookRow
  }

  const { data, error } = await db
    .from('playbooks')
    .insert({
      project_id: input.project_id,
      owner_id: input.owner_id,
      title: input.title,
      content_markdown: input.content_markdown,
    })
    .select('*')
    .single()

  if (error) throw error
  return data as PlaybookRow
}

export async function deleteChunksByPlaybookId(
  db: SupabaseClient,
  playbookId: string
): Promise<void> {
  const { error } = await db.from('playbook_chunks').delete().eq('playbook_id', playbookId)
  if (error) throw error
}

export async function insertChunks(
  db: SupabaseClient,
  rows: Array<{
    playbook_id: string
    project_id: string
    owner_id: string
    chunk_index: number
    chunk_title: string | null
    chunk_text: string
  }>
): Promise<PlaybookChunkRow[]> {
  const { data, error } = await db.from('playbook_chunks').insert(rows).select('*')

  if (error) throw error
  return (data ?? []) as PlaybookChunkRow[]
}

export async function selectPlaybookByProjectId(
  db: SupabaseClient,
  projectId: string
): Promise<PlaybookRow | null> {
  const { data, error } = await db
    .from('playbooks')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: true })
    .limit(1)

  if (error) throw error
  return data && data.length > 0 ? (data[0] as PlaybookRow) : null
}

export async function selectChunksByProjectId(
  db: SupabaseClient,
  projectId: string
): Promise<PlaybookChunkRow[]> {
  const { data, error } = await db
    .from('playbook_chunks')
    .select('*')
    .eq('project_id', projectId)
    .order('chunk_index', { ascending: true })

  if (error) throw error
  return (data ?? []) as PlaybookChunkRow[]
}

export async function selectChunksByPlaybookId(
  db: SupabaseClient,
  playbookId: string
): Promise<PlaybookChunkRow[]> {
  const { data, error } = await db
    .from('playbook_chunks')
    .select('*')
    .eq('playbook_id', playbookId)
    .order('chunk_index', { ascending: true })

  if (error) throw error
  return (data ?? []) as PlaybookChunkRow[]
}

export async function updateChunkEmbedding(
  db: SupabaseClient,
  chunkId: string,
  embedding: string
): Promise<void> {
  const { error } = await db.from('playbook_chunks').update({ embedding }).eq('id', chunkId)

  if (error) throw error
}

export async function matchPlaybookChunks(
  db: SupabaseClient,
  input: { projectId: string; queryEmbedding: string; matchCount: number }
): Promise<MatchPlaybookChunkRow[]> {
  const { data, error } = await db.rpc('match_playbook_chunks', {
    p_project_id: input.projectId,
    p_query_embedding: input.queryEmbedding,
    p_match_count: input.matchCount,
  })

  if (error) throw error
  return (data ?? []) as MatchPlaybookChunkRow[]
}

export async function hasChunksForProject(db: SupabaseClient, projectId: string): Promise<boolean> {
  const { data, error } = await db
    .from('playbook_chunks')
    .select('id')
    .eq('project_id', projectId)
    .limit(1)

  if (error) throw error
  return (data ?? []).length > 0
}
