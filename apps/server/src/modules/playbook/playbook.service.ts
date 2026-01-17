import { AppError } from '../../lib/appError.lib.js'
import { assertProjectAccess } from '../projects/projects.guard.js'

import { chunkPlaybookMarkdown } from './playbook.chunker.js'
import {
  deleteChunksByPlaybookId,
  insertChunks,
  selectChunksByProjectId,
  selectPlaybookByProjectId,
  upsertPlaybook,
} from './playbook.repo.js'

import type { SupabaseClient } from '@supabase/supabase-js'

export async function upsertProjectPlaybook(
  db: SupabaseClient,
  input: { ownerId: string; projectId: string; title: string; content: string }
) {
  await assertProjectAccess(db, input.projectId)

  const playbook = await upsertPlaybook(db, {
    project_id: input.projectId,
    owner_id: input.ownerId,
    title: input.title,
    content_markdown: input.content,
  })

  // Rebuild chunks deterministically
  const chunks = chunkPlaybookMarkdown(input.content, { maxChars: 1400 })

  if (chunks.length === 0) {
    throw new AppError({
      statusCode: 400,
      errorType: 'playbook_empty',
      message: 'Playbook content produced no chunks.',
    })
  }

  await deleteChunksByPlaybookId(db, playbook.id)

  const rows = chunks.map((c, idx) => ({
    playbook_id: playbook.id,
    project_id: input.projectId,
    owner_id: input.ownerId,
    chunk_index: idx,
    chunk_title: c.title,
    chunk_text: c.text,
  }))

  const insertedChunks = await insertChunks(db, rows)

  return {
    playbook,
    chunksInserted: insertedChunks.length,
  }
}

export async function getProjectPlaybook(db: SupabaseClient, projectId: string) {
  await assertProjectAccess(db, projectId)

  const playbook = await selectPlaybookByProjectId(db, projectId)
  if (!playbook) {
    return { playbook: null, chunks: [] }
  }

  const chunks = await selectChunksByProjectId(db, projectId)
  return { playbook, chunks }
}
