import { AppError } from '../../lib/appError.lib.js'

import { deleteProject, insertProject, selectProjectById, selectProjectsByOwnerId } from './projects.repo.js'
import { assertProjectAccess } from './projects.guard.js'

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

export async function listProjectsByOwner(db: SupabaseClient, ownerId: string) {
  return selectProjectsByOwnerId(db, ownerId)
}

export async function deleteProjectById(db: SupabaseClient, input: { projectId: string }) {
  // First, verify the project exists and is accessible to this user (RLS-safe 404).
  await assertProjectAccess(db, input.projectId)

  const deleted = await deleteProject(db, input.projectId)
  if (!deleted) {
    // If the user can read the project but can't delete it, this is almost always
    // a missing RLS DELETE policy.
    throw new AppError({
      statusCode: 403,
      errorType: 'project_delete_forbidden',
      message:
        'Project exists but cannot be deleted (RLS DELETE policy may be missing). See database SQL migrations.',
    })
  }
}
