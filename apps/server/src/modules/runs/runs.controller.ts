import { createSupabaseForRequest } from '../../db/supabase.request.js'

import { createRun, getRun } from './runs.service.js'
import { createRunBodySchema, projectIdParamsSchema, runIdParamsSchema } from './runs.validators.js'

import type { Controller } from '../../types/controller.types.js'

export const createRunController: Controller = async (req, res) => {
  const { projectId } = projectIdParamsSchema.parse(req.params)
  const body = createRunBodySchema.parse(req.body)

  const db = createSupabaseForRequest(req)

  const result = await createRun(db, {
    ownerId: req.userId!,
    projectId,
    topN: body.topN,
    weights: body.weights,
  })

  res.status(201).json(result)
}

export const getRunController: Controller = async (req, res) => {
  const { projectId, runId } = runIdParamsSchema.parse(req.params)

  const db = createSupabaseForRequest(req)

  const result = await getRun(db, { projectId, runId })

  res.status(200).json(result)
}
