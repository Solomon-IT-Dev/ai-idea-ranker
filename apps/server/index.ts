import 'dotenv/config'

import { createApp } from './src/app.js'
import { logger } from './src/lib/logger.lib.js'

import type { Server } from 'node:http'

// Handle sync exceptions before the app is even created.
// This is a last-resort handler; we exit because process state may be corrupted.
process.on('uncaughtException', err => {
  logger.fatal({ err }, 'Uncaught exception.')
  process.exit(1)
})

const { app, config } = createApp()

const server: Server | null = null
let isShuttingDown = false

async function shutdown(signalOrReason: string, err?: unknown) {
  if (isShuttingDown) {
    return
  }
  isShuttingDown = true

  // We keep shutdown idempotent. Any subsequent calls are ignored.
  logger.warn({ err, signalOrReason }, 'Shutdown initiated.')

  // Stop accepting new connections.
  await new Promise<void>(resolve => {
    if (!server) {
      return resolve()
    }
    server.close(() => resolve())
  })

  // TODO: close DB pools, flush telemetry, etc. (when added)

  logger.info('Shutdown complete.')
  process.exit(err ? 1 : 0)
}

app.listen(config.port, () => {
  logger.info({ port: config.port, env: config.env.NODE_ENV }, 'API server started.')
})

// Handle async errors (e.g., rejected promises not awaited/handled).
process.on('unhandledRejection', err => {
  logger.error({ err }, 'Unhandled promise rejection.')
  void shutdown('unhandledRejection', err)
})

// Graceful shutdown on termination signals (common in Docker/CI/hosting).
process.on('SIGTERM', () => void shutdown('SIGTERM'))
process.on('SIGINT', () => void shutdown('SIGINT'))
