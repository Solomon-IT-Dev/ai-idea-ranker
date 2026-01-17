import type { IdeaRow } from './ideas.types.js'
import type { SupabaseClient } from '@supabase/supabase-js'

export async function insertIdeas(
  db: SupabaseClient,
  rows: Array<{
    project_id: string
    owner_id: string
    title: string
    raw_text: string
    meta: Record<string, unknown>
  }>
): Promise<IdeaRow[]> {
  const { data, error } = await db.from('ideas').insert(rows).select('*')

  if (error) throw error
  return (data ?? []) as IdeaRow[]
}

export async function selectIdeasByProjectId(
  db: SupabaseClient,
  projectId: string,
  options: { limit: number; offset: number }
): Promise<IdeaRow[]> {
  const { data, error } = await db
    .from('ideas')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })
    .range(options.offset, options.offset + options.limit - 1)

  if (error) throw error
  return (data ?? []) as IdeaRow[]
}

export async function selectIdeaById(db: SupabaseClient, id: string): Promise<IdeaRow> {
  const { data, error } = await db.from('ideas').select('*').eq('id', id).single()

  if (error) throw error
  return data as IdeaRow
}

export async function updateIdeaById(
  db: SupabaseClient,
  id: string,
  patch: Partial<Pick<IdeaRow, 'title' | 'raw_text' | 'meta'>>
): Promise<IdeaRow> {
  const { data, error } = await db.from('ideas').update(patch).eq('id', id).select('*').single()

  if (error) throw error
  return data as IdeaRow
}

export async function deleteIdeaById(db: SupabaseClient, id: string): Promise<void> {
  const { error } = await db.from('ideas').delete().eq('id', id)

  if (error) throw error
}
