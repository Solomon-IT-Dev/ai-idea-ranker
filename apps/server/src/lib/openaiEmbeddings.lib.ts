import { envConfig } from '../config/env.config.js'
import {
  OPENAI_EMBEDDINGS_MODEL,
  OPENAI_EMBEDDINGS_URL,
} from '../constants/embeddings.constants.js'

import { AppError } from './appError.lib.js'
import { fetchWithRetry } from './fetchWithRetry.lib.js'
import { logger } from './logger.lib.js'

import type { EmbeddingsResponse } from '../types/embeddings.types.js'
import type { OpenAIErrorResponse } from '../types/error.types.js'

/**
 * Calls OpenAI embeddings API and returns embeddings as float arrays.
 * Uses model: text-embedding-3-small (1536 dims by default).
 */
export async function createEmbeddings(input: string[]): Promise<number[][]> {
  const apiKey = envConfig.OPENAI_API_KEY
  if (!apiKey) {
    throw new AppError({
      statusCode: 500,
      errorType: 'config_error',
      message: 'OPENAI_API_KEY is not configured.',
    })
  }

  const res = await fetchWithRetry(
    OPENAI_EMBEDDINGS_URL,
    {
      method: 'POST',
      headers: {
        authorization: `Bearer ${apiKey}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: OPENAI_EMBEDDINGS_MODEL,
        input,
        encoding_format: 'float',
        // dimensions: 1536, // optional; default for this model is 1536
      }),
    },
    { timeoutMs: 60_000, retries: 2, retryDelayMs: 500, maxRetryDelayMs: 5000 }
  )

  if (!res.ok) {
    const bodyText = await res.text().catch(() => '')

    logger.error(
      { status: res.status, body: bodyText.slice(0, 2000) },
      'OpenAI embeddings request failed.'
    )

    let parsed: OpenAIErrorResponse | null = null
    try {
      parsed = JSON.parse(bodyText) as OpenAIErrorResponse
    } catch {
      parsed = null
    }

    const code = parsed?.error?.code
    const type = parsed?.error?.type

    // "insufficient_quota" is not retryable by backoff
    if (code === 'insufficient_quota' || type === 'insufficient_quota') {
      throw new AppError({
        statusCode: 503,
        errorType: 'openai_insufficient_quota',
        message: 'Embeddings provider quota exceeded. Please check billing.',
      })
    }

    // 429 can also be rate_limit_exceeded (retryable)
    if (res.status === 429) {
      throw new AppError({
        statusCode: 503,
        errorType: 'openai_rate_limited',
        message: 'Embeddings provider rate limited. Please retry later.',
      })
    }

    if (res.status >= 500 && res.status <= 599) {
      throw new AppError({
        statusCode: 503,
        errorType: 'openai_unavailable',
        message: 'Embeddings provider temporarily unavailable. Please retry later.',
      })
    }

    throw new AppError({
      statusCode: 502,
      errorType: 'openai_error',
      message: `OpenAI embeddings request failed (${res.status}).`,
    })
  }

  const json = (await res.json()) as EmbeddingsResponse
  const vectors = json.data.sort((a, b) => a.index - b.index).map(d => d.embedding)

  return vectors
}

/**
 * Formats float array for pgvector input via PostgREST.
 * Most setups accept "[1,2,3]" string format.
 */
export function toPgvectorString(vec: number[]): string {
  return `[${vec.join(',')}]`
}
