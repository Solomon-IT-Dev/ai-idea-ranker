import { AppError } from '../../lib/appError.lib.js'
import { assertProjectAccess } from '../projects/projects.guard.js'

import { parseIdeasFromText } from './ideas.parser.js'
import {
  deleteIdeaById,
  insertIdeas,
  selectIdeaById,
  selectIdeasByProjectId,
  updateIdeaById,
} from './ideas.repo.js'

import type { SupabaseClient } from '@supabase/supabase-js'

export async function importIdeas(
  db: SupabaseClient,
  input: { ownerId: string; projectId: string; text: string }
) {
  await assertProjectAccess(db, input.projectId)

  const parsed = parseIdeasFromText(input.text)

  if (parsed.length === 0) {
    throw new AppError({
      statusCode: 400,
      errorType: 'ideas_empty',
      message: 'No ideas were found in the provided text.',
    })
  }

  // Safety cap for MVP to avoid accidental huge inserts
  const maxIdeas = 200
  const limited = parsed.slice(0, maxIdeas)

  const rows = limited.map(i => ({
    project_id: input.projectId,
    owner_id: input.ownerId,
    title: i.title,
    raw_text: i.rawText,
    meta: {},
  }))

  const inserted = await insertIdeas(db, rows)

  return {
    insertedCount: inserted.length,
    ideas: inserted,
    truncated: parsed.length > maxIdeas,
  }
}

export async function listIdeas(
  db: SupabaseClient,
  input: { projectId: string; limit: number; offset: number }
) {
  await assertProjectAccess(db, input.projectId)

  return selectIdeasByProjectId(db, input.projectId, {
    limit: input.limit,
    offset: input.offset,
  })
}

export async function updateIdea(
  db: SupabaseClient,
  input: {
    ideaId: string
    patch: { title?: string; rawText?: string; meta?: Record<string, unknown> }
  }
) {
  try {
    await selectIdeaById(db, input.ideaId)
  } catch {
    throw new AppError({
      statusCode: 404,
      errorType: 'idea_not_found',
      message: 'Idea not found.',
    })
  }

  const patchDb: Record<string, unknown> = {}
  if (input.patch.title) patchDb.title = input.patch.title
  if (input.patch.rawText) patchDb.raw_text = input.patch.rawText
  if (input.patch.meta) patchDb.meta = input.patch.meta

  try {
    return await updateIdeaById(db, input.ideaId, patchDb)
  } catch {
    throw new AppError({
      statusCode: 400,
      errorType: 'idea_update_failed',
      message: 'Failed to update idea.',
    })
  }
}

export async function deleteIdea(db: SupabaseClient, ideaId: string) {
  try {
    await selectIdeaById(db, ideaId)
  } catch {
    throw new AppError({
      statusCode: 404,
      errorType: 'idea_not_found',
      message: 'Idea not found.',
    })
  }

  await deleteIdeaById(db, ideaId)
}
