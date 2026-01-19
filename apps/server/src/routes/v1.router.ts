import { Router } from 'express'

import { artifactsRouter } from '../modules/artifacts/artifacts.routes.js'
import { authRouter } from '../modules/auth/auth.routes.js'
import { ideaRouter } from '../modules/ideas/idea.routes.js'
import { ideasRouter } from '../modules/ideas/ideas.routes.js'
import { playbookRouter } from '../modules/playbook/playbook.routes.js'
import { projectsRouter } from '../modules/projects/projects.routes.js'
import { runsRouter } from '../modules/runs/runs.routes.js'

export const v1Router = Router()

v1Router.use('/auth', authRouter)
v1Router.use('/projects', projectsRouter)
v1Router.use('/projects', ideasRouter)
v1Router.use('/ideas', ideaRouter)
v1Router.use('/projects', playbookRouter)
v1Router.use('/projects', runsRouter)
v1Router.use('/projects', artifactsRouter)
