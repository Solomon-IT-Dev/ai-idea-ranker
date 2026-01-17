import { Router } from 'express'

import { controller } from '../../lib/controller.lib.js'
import { requireAuthMiddleware } from '../../middlewares/requireAuth.middleware.js'

import { getPlaybookController, upsertPlaybookController } from './playbook.controller.js'

export const playbookRouter = Router()

playbookRouter.post(
  '/:projectId/playbook',
  requireAuthMiddleware,
  controller(upsertPlaybookController)
)

playbookRouter.get('/:projectId/playbook', requireAuthMiddleware, controller(getPlaybookController))
