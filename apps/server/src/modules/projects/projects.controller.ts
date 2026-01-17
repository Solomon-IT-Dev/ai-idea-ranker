import { createSupabaseForRequest } from '../../db/supabase.request.js'

import { createProject, getProjectById } from './projects.service.js'
import { createProjectBodySchema } from './projects.validators.js'

import type { Controller } from '../../types/controller.types.js'

export const createProjectController: Controller = async (req, res) => {
  const body = createProjectBodySchema.parse(req.body)

  const db = createSupabaseForRequest(req)

  const project = await createProject(db, {
    ownerId: req.userId!,
    name: body.name,
    constraints: body.constraints,
  })

  res.status(201).json({ project })
}

export const getProjectController: Controller = async (req, res) => {
  const db = createSupabaseForRequest(req)
  const project = await getProjectById(
    db,
    Array.isArray(req.params.id) ? req.params.id[0] : req.params.id
  )

  res.json({ project })
}
