import { AppError } from '../../lib/appError.lib.js'

import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * Ensures the current user has access to the given project.
 *
 * We intentionally return 404 if the project is not accessible to avoid leaking
 * the existence of other users' projects.
 */
export async function assertProjectAccess(db: SupabaseClient, projectId: string) {
  const { data, error } = await db.from('projects').select('id').eq('id', projectId).single()

  if (error || !data) {
    throw new AppError({
      statusCode: 404,
      errorType: 'project_not_found',
      message: 'Project not found.',
    })
  }
}
