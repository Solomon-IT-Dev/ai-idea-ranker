import { createSupabaseForRequest } from '../../db/supabase.request.js'

import { generateArtifacts, getLatestArtifacts, listArtifacts } from './artifacts.service.js'
import {
  generateArtifactsBodySchema,
  generateArtifactsParamsSchema,
  getLatestArtifactsParamsSchema,
  listArtifactsParamsSchema,
} from './artifacts.validators.js'

import type { Controller } from '../../types/controller.types.js'

export const generateArtifactsController: Controller = async (req, res) => {
  const { projectId, runId } = generateArtifactsParamsSchema.parse(req.params)
  const body = generateArtifactsBodySchema.parse(req.body)

  const db = createSupabaseForRequest(req)

  const result = await generateArtifacts(db, {
    projectId,
    runId,
    topN: body.topN,
  })

  res.status(201).json(result)
}

export const getLatestArtifactsController: Controller = async (req, res) => {
  const { projectId, runId } = getLatestArtifactsParamsSchema.parse(req.params)

  const db = createSupabaseForRequest(req)

  const result = await getLatestArtifacts(db, { projectId, runId })

  res.json(result)
}

export const listArtifactsController: Controller = async (req, res) => {
  const { projectId, runId } = listArtifactsParamsSchema.parse(req.params)

  const db = createSupabaseForRequest(req)

  const result = await listArtifacts(db, { projectId, runId })

  res.json(result)
}
