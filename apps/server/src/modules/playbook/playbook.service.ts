import { AppError } from '../../lib/appError.lib.js'
import { createEmbeddings, toPgvectorString } from '../../lib/openaiEmbeddings.lib.js'
import { assertProjectAccess } from '../projects/projects.guard.js'

import { chunkPlaybookMarkdown } from './playbook.chunker.js'
import {
  deleteChunksByPlaybookId,
  hasChunksForProject,
  insertChunks,
  matchPlaybookChunks,
  selectChunksByProjectId,
  selectPlaybookByProjectId,
  updateChunkEmbedding,
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

  // Generate embeddings for chunks (sync for MVP)
  let embeddingsStatus: 'ok' | 'failed' = 'ok'
  let embeddingsErrorType: string | undefined

  try {
    const chunkTexts = insertedChunks.map(c => c.chunk_text)
    const vectors = await createEmbeddings(chunkTexts)

    for (let i = 0; i < insertedChunks.length; i += 1) {
      const chunk = insertedChunks[i]
      const vec = vectors[i]
      await updateChunkEmbedding(db, chunk.id, toPgvectorString(vec))
    }
  } catch (err) {
    embeddingsStatus = 'failed'
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    embeddingsErrorType = err instanceof Error ? (err as any).errorType : 'unknown'

    // Log and continue (playbook is still saved)
  }

  return {
    playbook,
    chunksInserted: insertedChunks.length,
    embeddings: {
      status: embeddingsStatus,
      errorType: embeddingsErrorType,
    },
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

export async function searchPlaybook(
  db: SupabaseClient,
  input: { projectId: string; query: string; topK: number }
) {
  await assertProjectAccess(db, input.projectId)

  const [queryVec] = await createEmbeddings([input.query])
  const queryEmbedding = toPgvectorString(queryVec)

  const results = await matchPlaybookChunks(db, {
    projectId: input.projectId,
    queryEmbedding,
    matchCount: input.topK,
  })

  if (results.length === 0) {
    const hasChunks = await hasChunksForProject(db, input.projectId)

    if (!hasChunks) {
      throw new AppError({
        statusCode: 404,
        errorType: 'playbook_not_found',
        message: 'Playbook is not uploaded for this project.',
      })
    }

    // Either embeddings are not generated yet, or the playbook is empty,
    // or the query truly has no semantic matches. For MVP we treat this as
    // "embeddings not ready" to make the system state explicit.
    throw new AppError({
      statusCode: 409,
      errorType: 'embeddings_not_ready',
      message:
        'Playbook embeddings are not available yet. Please re-upload the playbook or retry later.',
    })
  }

  return results
}
