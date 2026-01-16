import type { Controller } from '../../types/controller.types.js'

/**
 * Returns basic auth context for the current request.
 * Frontend can use it to validate session and fetch userId.
 */
export const getMeController: Controller = (req, res) => {
  res.json({ userId: req.userId, requestId: req.requestId })
}
