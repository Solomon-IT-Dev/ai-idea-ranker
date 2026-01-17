import { ZodError } from 'zod'

import { envConfig } from '../config/env.config.js'
import { AppError } from '../lib/appError.lib.js'
import { logger } from '../lib/logger.lib.js'

import type { ErrorResponseBody } from '../types/error.types.js'
import type { ErrorRequestHandler } from 'express'

/**
 * Checks if the given error is a Postgres error object.
 * A Postgres error object must be an object with at least one of the following properties:
 * - code (string)
 * - details (string)
 * - hint (string)
 * Additionally, the object must have a 'message' property.
 * @param err The error to check
 * @returns {boolean} True if the error is a Postgres error object, false otherwise
 */
function isPostgrestError(err: unknown): err is {
  code?: string
  message?: string
  details?: string
  hint?: string
} {
  return (
    typeof err === 'object' &&
    err !== null &&
    ('code' in err || 'details' in err || 'hint' in err) &&
    'message' in err
  )
}

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

  // Postgres errors (from Supabase/PostgREST)
  if (isPostgrestError(err)) {
    // Common cases we want to expose as operational errors
    if (err.code === '42501') {
      return {
        safeError: new AppError({
          statusCode: 403,
          errorType: 'db_rls_violation',
          message: 'Access denied by row-level security policy.',
        }),
        original: err,
      }
    }

    if (err.code === '42P01') {
      return {
        safeError: new AppError({
          statusCode: 500,
          errorType: 'db_table_missing',
          message: 'Database table is missing. Did you run migrations?',
        }),
        original: err,
      }
    }

    // Default: treat as bad request (often schema/constraint issues)
    return {
      safeError: new AppError({
        statusCode: 400,
        errorType: 'db_error',
        message: err.message ?? 'Database request failed.',
      }),
      original: err,
    }
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
export const errorHandlerMiddleware: ErrorRequestHandler = (err, req, res, _next) => {
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
  if (showStack) {
    // Attach extra debug info for quicker local troubleshooting
    if (typeof original === 'object' && original !== null) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(body as any).debug = original
    }
  }

  res.status(safeError.statusCode).json(body)
}
