import type { ProjectRow } from '../../types/project.types.js'
import type { SupabaseClient } from '@supabase/supabase-js'

export async function insertProject(
  db: SupabaseClient,
  data: { owner_id: string; name: string; constraints: Record<string, unknown> }
) {
  const { data: row, error } = await db.from('projects').insert(data).select('*').single()

  if (error) throw error
  return row as ProjectRow
}

export async function selectProjectById(db: SupabaseClient, id: string) {
  const { data: row, error } = await db.from('projects').select('*').eq('id', id).single()

  if (error) throw error
  return row as ProjectRow
}
