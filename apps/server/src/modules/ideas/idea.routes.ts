import { Router } from 'express'

import { controller } from '../../lib/controller.lib.js'
import { requireAuthMiddleware } from '../../middlewares/requireAuth.middleware.js'

import { deleteIdeaController, updateIdeaController } from './ideas.controller.js'

export const ideaRouter = Router()

ideaRouter.patch('/:id', requireAuthMiddleware, controller(updateIdeaController))

ideaRouter.delete('/:id', requireAuthMiddleware, controller(deleteIdeaController))
