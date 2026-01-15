import type { NextFunction, Request, RequestHandler, Response } from 'express'

/**
 * Wraps an async controller to forward errors to Express error middleware.
 */
export function asyncHandler(
  handler: (req: Request, res: Response, next: NextFunction) => Promise<void>
): RequestHandler {
  return (req, res, next) => {
    void handler(req, res, next).catch(next)
  }
}
