import type { SseClient } from '../types/stream.types.js'
import type { Response } from 'express'

const clientsByRunId = new Map<string, Map<string, SseClient>>()

function nowId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function writeSse(res: Response, event: string, data: unknown) {
  res.write(`event: ${event}\n`)
  res.write(`data: ${JSON.stringify(data)}\n\n`)
}

export function writeSseEvent(res: Response, event: string, data: unknown) {
  writeSse(res, event, data)
}

/**
 * Subscribe client connection to a given runId SSE stream.
 * Keeps the connection alive and cleans up on disconnect.
 */
export function subscribeToRunStream(runId: string, res: Response) {
  const clientId = nowId()

  res.status(200)
  res.setHeader('content-type', 'text/event-stream; charset=utf-8')
  res.setHeader('cache-control', 'no-cache, no-transform')
  res.setHeader('connection', 'keep-alive')
  res.setHeader('x-accel-buffering', 'no')
  res.flushHeaders?.()

  const keepAlive = setInterval(() => {
    // Comment line to keep connection alive through proxies.
    res.write(`: ping ${Date.now()}\n\n`)
  }, 25_000)

  if (!clientsByRunId.has(runId)) {
    clientsByRunId.set(runId, new Map())
  }

  clientsByRunId.get(runId)!.set(clientId, { res, keepAlive })

  writeSse(res, 'stream.open', { runId })

  res.on('close', () => {
    clearInterval(keepAlive)

    const clients = clientsByRunId.get(runId)
    if (!clients) return

    clients.delete(clientId)
    if (clients.size === 0) clientsByRunId.delete(runId)
  })
}

/**
 * Publish an event to all SSE clients subscribed for a runId.
 * No persistence (in-memory only) — enough for MVP.
 */
export function publishRunEvent(runId: string, event: string, data: unknown) {
  const clients = clientsByRunId.get(runId)
  if (!clients) return

  for (const { res } of clients.values()) {
    writeSse(res, event, data)
  }
}

/**
 * Force-close stream for a runId (e.g., on completion/failure).
 */
export function closeRunStream(runId: string) {
  const clients = clientsByRunId.get(runId)
  if (!clients) return

  for (const { res, keepAlive } of clients.values()) {
    clearInterval(keepAlive)
    res.end()
  }

  clientsByRunId.delete(runId)
}
