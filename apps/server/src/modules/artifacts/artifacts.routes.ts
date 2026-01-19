import { Router } from 'express'

import { controller } from '../../lib/controller.lib.js'
import { requireAuthMiddleware } from '../../middlewares/requireAuth.middleware.js'

import {
  generateArtifactsController,
  getLatestArtifactsController,
  listArtifactsController,
} from './artifacts.controller.js'

export const artifactsRouter = Router()

artifactsRouter.post(
  '/:projectId/runs/:runId/artifacts:generate',
  requireAuthMiddleware,
  controller(generateArtifactsController)
)

artifactsRouter.get(
  '/:projectId/runs/:runId/artifacts:latest',
  requireAuthMiddleware,
  controller(getLatestArtifactsController)
)

artifactsRouter.get(
  '/:projectId/runs/:runId/artifacts',
  requireAuthMiddleware,
  controller(listArtifactsController)
)
