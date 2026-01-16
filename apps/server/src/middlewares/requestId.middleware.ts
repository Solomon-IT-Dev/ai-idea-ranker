import { randomUUID } from 'node:crypto'

import type { RequestHandler } from 'express'

/**
 * Attaches a correlation id to every request.
 * This id is also returned to clients for easier debugging.
 */
export const requestIdMiddleware: RequestHandler = (req, res, next) => {
  const id = randomUUID()
  req.requestId = id
  res.setHeader('x-request-id', id)
  next()
}
