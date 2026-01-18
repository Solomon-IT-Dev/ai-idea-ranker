import { Router } from 'express'

import { controller } from '../../lib/controller.lib.js'
import { requireAuthMiddleware } from '../../middlewares/requireAuth.middleware.js'

import { createRunController, getRunController } from './runs.controller.js'

export const runsRouter = Router()

runsRouter.post('/:projectId/runs', requireAuthMiddleware, controller(createRunController))

runsRouter.get('/:projectId/runs/:runId', requireAuthMiddleware, controller(getRunController))
