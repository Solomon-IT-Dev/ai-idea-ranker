/**
 * Represents an operational (trusted) application error.
 * Operational errors are safe to send to clients (with sanitized messages).
 */
export class AppError extends Error {
  public readonly statusCode: number
  public readonly errorType: string
  public readonly isOperational: boolean

  constructor(options: { statusCode?: number; errorType?: string; message?: string }) {
    super(options.message ?? 'Something went wrong.')

    this.statusCode = options.statusCode ?? 500
    this.errorType = options.errorType ?? 'unknown_error'
    this.isOperational = true

    Error.captureStackTrace(this, this.constructor)
  }
}
