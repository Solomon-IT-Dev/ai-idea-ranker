import { Router } from 'express'

import { controller } from '../../lib/controller.lib.js'
import { requireAuthMiddleware } from '../../middlewares/requireAuth.middleware.js'

import { importIdeasController, listIdeasController } from './ideas.controller.js'

export const ideasRouter = Router()

ideasRouter.post(
  '/:projectId/ideas:import',
  requireAuthMiddleware,
  controller(importIdeasController)
)

ideasRouter.get('/:projectId/ideas', requireAuthMiddleware, controller(listIdeasController))
