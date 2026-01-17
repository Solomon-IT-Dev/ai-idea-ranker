import { createSupabaseForRequest } from '../../db/supabase.request.js'

import { getProjectPlaybook, searchPlaybook, upsertProjectPlaybook } from './playbook.service.js'
import {
  projectIdParamsSchema,
  searchPlaybookBodySchema,
  upsertPlaybookBodySchema,
} from './playbook.validators.js'

import type { Controller } from '../../types/controller.types.js'

export const upsertPlaybookController: Controller = async (req, res) => {
  const { projectId } = projectIdParamsSchema.parse(req.params)
  const body = upsertPlaybookBodySchema.parse(req.body)

  const db = createSupabaseForRequest(req)

  const result = await upsertProjectPlaybook(db, {
    ownerId: req.userId!,
    projectId,
    title: body.title,
    content: body.content,
  })

  res.status(201).json(result)
}

export const getPlaybookController: Controller = async (req, res) => {
  const { projectId } = projectIdParamsSchema.parse(req.params)

  const db = createSupabaseForRequest(req)

  const result = await getProjectPlaybook(db, projectId)

  res.status(200).json(result)
}

export const searchPlaybookController: Controller = async (req, res) => {
  const { projectId } = projectIdParamsSchema.parse(req.params)
  const body = searchPlaybookBodySchema.parse(req.body)

  const db = createSupabaseForRequest(req)

  const rows = await searchPlaybook(db, {
    projectId,
    query: body.query,
    topK: body.topK,
  })

  res.json({
    query: body.query,
    topK: body.topK,
    results: rows.map(r => ({
      chunkId: r.id,
      chunkIndex: r.chunk_index,
      title: r.chunk_title,
      score: r.similarity,
      text: body.includeText ? r.chunk_text : undefined,
    })),
  })
}
