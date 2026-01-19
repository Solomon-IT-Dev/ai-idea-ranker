import { AppError } from './appError.lib.js'

import type { RetryOptions } from '../types/fetch.types.js'

function sleep(ms: number) {
  return new Promise<void>(resolve => setTimeout(resolve, ms))
}

function parseRetryAfterMs(value: string | null): number | null {
  if (!value) return null

  const seconds = Number(value)
  if (Number.isFinite(seconds) && seconds >= 0) {
    return Math.min(10_000, Math.round(seconds * 1000))
  }

  const dateMs = Date.parse(value)
  if (!Number.isNaN(dateMs)) {
    return Math.min(10_000, Math.max(0, dateMs - Date.now()))
  }

  return null
}

function isRetryableStatus(status: number) {
  return status === 429 || (status >= 500 && status <= 599)
}

function jitterMs(maxJitter: number) {
  return Math.floor(Math.random() * maxJitter)
}

export async function fetchWithRetry(
  url: string,
  init: RequestInit,
  options: RetryOptions
): Promise<Response> {
  const maxAttempts = Math.max(1, 1 + options.retries)

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), options.timeoutMs)

    const externalSignal = init.signal
    if (externalSignal) {
      if (externalSignal.aborted) controller.abort()
      else externalSignal.addEventListener('abort', () => controller.abort(), { once: true })
    }

    try {
      const res = await fetch(url, { ...init, signal: controller.signal })
      clearTimeout(timeout)

      if (res.ok) return res

      if (attempt >= maxAttempts || !isRetryableStatus(res.status)) {
        return res
      }

      const retryAfterMs = parseRetryAfterMs(res.headers.get('retry-after'))
      const baseDelay = retryAfterMs ?? options.retryDelayMs * 2 ** (attempt - 1)
      const delay = Math.min(options.maxRetryDelayMs, baseDelay) + jitterMs(200)
      await sleep(delay)
    } catch (err) {
      clearTimeout(timeout)

      const isAbort =
        err instanceof Error &&
        (err.name === 'AbortError' || err.message.toLowerCase().includes('aborted'))

      if (attempt >= maxAttempts) {
        throw new AppError({
          statusCode: 503,
          errorType: isAbort ? 'openai_timeout' : 'openai_unavailable',
          message: isAbort
            ? 'OpenAI request timed out. Please retry later.'
            : 'OpenAI is temporarily unavailable. Please retry later.',
        })
      }

      // Retry on network errors and timeouts.
      const delay = Math.min(options.maxRetryDelayMs, options.retryDelayMs * 2 ** (attempt - 1))
      await sleep(delay + jitterMs(200))
    }
  }

  throw new AppError({
    statusCode: 503,
    errorType: 'openai_unavailable',
    message: 'OpenAI is temporarily unavailable. Please retry later.',
  })
}
