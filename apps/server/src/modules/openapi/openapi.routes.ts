import { Router } from 'express'

import { controller } from '../../lib/controller.lib.js'

import { getOpenApiJsonController, getSwaggerUiController } from './openapi.controller.js'

export const openapiRouter = Router()

openapiRouter.get('/openapi.json', controller(getOpenApiJsonController))
openapiRouter.get('/docs', controller(getSwaggerUiController))

