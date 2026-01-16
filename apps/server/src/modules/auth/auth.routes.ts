import { Router } from 'express'

import { controller } from '../../lib/controller.lib.js'
import { requireAuthMiddleware } from '../../middlewares/requireAuth.middleware.js'

import { getMeController } from './auth.controller.js'

export const authRouter = Router()

authRouter.get('/me', requireAuthMiddleware, controller(getMeController))
