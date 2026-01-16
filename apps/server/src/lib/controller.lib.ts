import type { Controller } from '../types/controller.types.js'
import type { RequestHandler } from 'express'

/**
 * Wraps a controller to forward async errors to Express error middleware.
 * Keeps routes thin and avoids repeating try/catch.
 */
export function controller(handler: Controller): RequestHandler {
  return (req, res, next) => {
    try {
      const result = handler(req, res, next)
      if (result && typeof (result as Promise<void>).catch === 'function') {
        void (result as Promise<void>).catch(next)
      }
    } catch (err) {
      next(err)
    }
  }
}
