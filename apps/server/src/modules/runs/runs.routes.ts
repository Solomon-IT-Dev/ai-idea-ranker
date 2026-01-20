import { Router } from 'express'

import { controller } from '../../lib/controller.lib.js'
import { requireAuthMiddleware } from '../../middlewares/requireAuth.middleware.js'

import {
  createRunController,
  executeRunController,
  getRunController,
  listRunsController,
  streamRunController,
} from './runs.controller.js'

export const runsRouter = Router()

runsRouter.post('/:projectId/runs', requireAuthMiddleware, controller(createRunController))

runsRouter.post('/:projectId/runs:execute', requireAuthMiddleware, controller(executeRunController))

runsRouter.get('/:projectId/runs', requireAuthMiddleware, controller(listRunsController))

runsRouter.get('/:projectId/runs/:runId', requireAuthMiddleware, controller(getRunController))

runsRouter.get(
  '/:projectId/runs/:runId/stream',
  requireAuthMiddleware,
  controller(streamRunController)
)
