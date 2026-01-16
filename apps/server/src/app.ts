import compression from 'compression'
import cors from 'cors'
import express from 'express'
import { rateLimit } from 'express-rate-limit'
import helmet from 'helmet'
import hpp from 'hpp'

import { envConfig } from './config/env.config.js'
import { securityConstants } from './constants/security.constants.js'
import { AppError } from './lib/appError.lib.js'
import { loggerHttp } from './lib/logger.lib.js'
import { errorHandlerMiddleware } from './middlewares/errorHandler.middleware.js'
import { requestIdMiddleware } from './middlewares/requestId.middleware.js'
import { v1Router } from './routes/v1.router.js'

export function createApp() {
  // Start express app
  const app = express()

  // Set proxy requests to true
  app.set('trust proxy', securityConstants.trustProxy)

  // Security headers (tuned for API use + cross-origin frontend).
  app.use(
    helmet({
      crossOriginResourcePolicy: securityConstants.helmet.crossOriginResourcePolicy,
      crossOriginEmbedderPolicy: securityConstants.helmet.crossOriginEmbedderPolicy,
    })
  )

  // CORS: allow configured frontend origin in production, permissive in dev.
  const corsOrigin =
    envConfig.NODE_ENV === 'production' && envConfig.CLIENT_ORIGIN ? envConfig.CLIENT_ORIGIN : true

  app.use(
    cors({
      origin: corsOrigin,
      credentials: securityConstants.cors.credentials,
    })
  )

  // Parse JSON payloads.
  app.use(express.json({ limit: securityConstants.jsonBodyLimit }))

  // Prevent HTTP parameter pollution (?a=1&a=2).
  app.use(hpp())

  // Compress responses.
  app.use(compression())

  // Attach request ID to each request.
  app.use(requestIdMiddleware)

  // Structured HTTP logs (pino-http).
  app.use(loggerHttp)

  // Keep health endpoint lightweight and unthrottled.
  app.get('/health', (_req, res) => {
    res.status(200).json({ ok: true })
  })

  // Apply rate limiting to API routes (not healthcheck).
  const apiLimiter = rateLimit({
    limit: securityConstants.rateLimit.limit,
    windowMs: securityConstants.rateLimit.windowMs,
    standardHeaders: securityConstants.rateLimit.standardHeaders,
    legacyHeaders: securityConstants.rateLimit.legacyHeaders,
    handler: (_req, _res, next) =>
      next(
        new AppError({
          statusCode: 429,
          errorType: 'too_many_requests',
          message: `Too many requests from this IP, please try again in ${securityConstants.rateLimit.windowMinutes} minutes.`,
        })
      ),
  })

  // Mount API v1 router.
  app.use('/v1', apiLimiter, v1Router)

  // 404 handler for unknown routes.
  app.use((req, _res, next) => {
    next(
      new AppError({
        statusCode: 404,
        errorType: 'not_found',
        message: `${req.method} ${req.originalUrl} not found.`,
      })
    )
  })

  // Global error handler.
  app.use(errorHandlerMiddleware)

  return { app, config: { port: envConfig.PORT, env: envConfig } }
}
