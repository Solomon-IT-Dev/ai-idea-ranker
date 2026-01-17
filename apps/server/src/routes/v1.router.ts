import { Router } from 'express'

import { authRouter } from '../modules/auth/auth.routes.js'
import { projectsRouter } from '../modules/projects/projects.routes.js'

export const v1Router = Router()

v1Router.use('/auth', authRouter)
v1Router.use('/projects', projectsRouter)
