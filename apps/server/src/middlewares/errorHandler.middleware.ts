import { ZodError } from 'zod'

import { envConfig } from '../config/env.config.js'
import { AppError } from '../lib/appError.lib.js'
import { logger } from '../lib/logger.lib.js'

import type { ErrorResponseBody } from '../types/error.types.js'
import type { ErrorRequestHandler } from 'express'

/**
 * Maps known error types into operational AppError instances.
 * Keep this file small and predictable: do not leak internals to clients.
 */
function normalizeError(err: unknown): { safeError: AppError; original: unknown } {
  // Zod validation errors
  if (err instanceof ZodError) {
    const message = err.issues.map(i => `${i.path.join('.') || 'input'}: ${i.message}`).join('; ')

    return {
      safeError: new AppError({
        statusCode: 400,
        errorType: 'validation_error',
        message,
      }),
      original: err,
    }
  }

  // Our operational errors
  if (err instanceof AppError) {
    return { safeError: err, original: err }
  }

  // Fallback (programming / unknown error)
  return {
    safeError: new AppError({
      statusCode: 500,
      errorType: 'unknown_error',
      message: 'Something went wrong on our side. Please try again later.',
    }),
    original: err,
  }
}

/**
 * Centralized Express error handler.
 */
export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  const { safeError, original } = normalizeError(err)

  const status: ErrorResponseBody['status'] = String(safeError.statusCode).startsWith('4')
    ? 'fail'
    : 'error'

  // Always log full error server-side. Do not leak internals to clients in prod.
  if (!safeError.isOperational) {
    logger.error({ err: original }, 'Unhandled non-operational error')
  } else {
    // Operational errors may be logged at warn level.
    logger.warn({ err: original }, 'Operational error')
  }

  const body: ErrorResponseBody = {
    status,
    errorType: safeError.errorType,
    message: safeError.message,
    requestId: (req as unknown as { requestId: string }).requestId,
  }

  const showStack = envConfig.NODE_ENV !== 'production'
  if (showStack && original instanceof Error) {
    body.stack = original.stack
  }

  res.status(safeError.statusCode).json(body)
}
