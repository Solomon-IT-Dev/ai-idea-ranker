import { Router } from 'express'

import { controller } from '../../lib/controller.lib.js'
import { requireAuthMiddleware } from '../../middlewares/requireAuth.middleware.js'

import {
  createProjectController,
  deleteProjectController,
  getProjectController,
  listProjectsController,
} from './projects.controller.js'

export const projectsRouter = Router()

projectsRouter.get('/', requireAuthMiddleware, controller(listProjectsController))

projectsRouter.post('/', requireAuthMiddleware, controller(createProjectController))

projectsRouter.get('/:id', requireAuthMiddleware, controller(getProjectController))

projectsRouter.delete('/:id', requireAuthMiddleware, controller(deleteProjectController))
