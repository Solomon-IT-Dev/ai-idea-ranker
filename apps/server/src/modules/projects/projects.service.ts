import { AppError } from '../../lib/appError.lib.js'

import { insertProject, selectProjectById } from './projects.repo.js'

import type { SupabaseClient } from '@supabase/supabase-js'

export async function createProject(
  db: SupabaseClient,
  input: { ownerId: string; name: string; constraints: Record<string, unknown> }
) {
  return insertProject(db, {
    owner_id: input.ownerId,
    name: input.name,
    constraints: input.constraints,
  })
}

export async function getProjectById(db: SupabaseClient, id: string) {
  try {
    return await selectProjectById(db, id)
  } catch {
    throw new AppError({
      statusCode: 404,
      errorType: 'project_not_found',
      message: 'Project not found.',
    })
  }
}
