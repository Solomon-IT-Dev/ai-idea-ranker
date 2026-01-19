import { createSupabaseForRequest } from '../../db/supabase.request.js'
import { AppError } from '../../lib/appError.lib.js'
import { subscribeToRunStream, writeSseEvent } from '../../lib/runStream.lib.js'
import { assertProjectAccess } from '../projects/projects.guard.js'

import { selectRunById } from './runs.repo.js'
import { createRun, getRun, startRun } from './runs.service.js'
import {
  createRunBodySchema,
  executeRunBodySchema,
  projectIdParamsSchema,
  streamRunParamsSchema,
} from './runs.validators.js'

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
  const { projectId, runId } = streamRunParamsSchema.parse(req.params)

  const db = createSupabaseForRequest(req)

  const result = await getRun(db, { projectId, runId })

  res.status(200).json(result)
}

/**
 * Async run execution. Returns 202 quickly and client can subscribe to SSE.
 */
export const executeRunController: Controller = async (req, res) => {
  const { projectId } = projectIdParamsSchema.parse(req.params)
  const body = executeRunBodySchema.parse(req.body)

  const db = createSupabaseForRequest(req)

  const result = await startRun(db, {
    ownerId: req.userId!,
    projectId,
    topN: body.topN,
    weights: body.weights,
  })

  res.status(202).json(result)
}

export const streamRunController: Controller = async (req, res) => {
  const { projectId, runId } = streamRunParamsSchema.parse(req.params)

  const db = createSupabaseForRequest(req)
  await assertProjectAccess(db, projectId)

  let run: { id: string; project_id: string; status: string } | null = null
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    run = (await selectRunById(db, runId)) as any
  } catch {
    run = null
  }

  if (!run || run.project_id !== projectId) {
    throw new AppError({
      statusCode: 404,
      errorType: 'run_not_found',
      message: 'Run not found.',
    })
  }

  subscribeToRunStream(runId, res)

  // Immediately send snapshot (useful for reconnections)
  writeSseEvent(res, 'run.snapshot', { runId, status: run.status })
}
