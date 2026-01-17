import { createSupabaseForRequest } from '../../db/supabase.request.js'

import { deleteIdea, importIdeas, listIdeas, updateIdea } from './ideas.service.js'
import {
  ideaIdParamsSchema,
  importIdeasBodySchema,
  listIdeasQuerySchema,
  projectIdParamsSchema,
  updateIdeaBodySchema,
} from './ideas.validators.js'

import type { Controller } from './../../types/controller.types.js'

export const importIdeasController: Controller = async (req, res) => {
  const { projectId } = projectIdParamsSchema.parse(req.params)
  const body = importIdeasBodySchema.parse(req.body)

  const db = createSupabaseForRequest(req)

  const result = await importIdeas(db, {
    ownerId: req.userId!,
    projectId,
    text: body.text,
  })

  res.status(201).json(result)
}

export const listIdeasController: Controller = async (req, res) => {
  const { projectId } = projectIdParamsSchema.parse(req.params)
  const query = listIdeasQuerySchema.parse(req.query)

  const db = createSupabaseForRequest(req)

  const ideas = await listIdeas(db, {
    projectId,
    limit: query.limit,
    offset: query.offset,
  })

  res.status(200).json({ ideas, limit: query.limit, offset: query.offset })
}

export const updateIdeaController: Controller = async (req, res) => {
  const { id } = ideaIdParamsSchema.parse(req.params)
  const body = updateIdeaBodySchema.parse(req.body)

  const db = createSupabaseForRequest(req)

  const idea = await updateIdea(db, {
    ideaId: id,
    patch: {
      title: body.title,
      rawText: body.rawText,
      meta: body.meta,
    },
  })

  res.status(200).json({ idea })
}

export const deleteIdeaController: Controller = async (req, res) => {
  const { id } = ideaIdParamsSchema.parse(req.params)

  const db = createSupabaseForRequest(req)

  await deleteIdea(db, id)

  res.status(204).send()
}
