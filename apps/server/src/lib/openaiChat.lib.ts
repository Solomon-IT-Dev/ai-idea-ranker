import { envConfig } from '../config/env.config.js'
import { OPENAI_CHAT_MODEL_DEFAULT, OPENAI_CHAT_URL } from '../constants/chat.constants.js'

import { AppError } from './appError.lib.js'
import { logger } from './logger.lib.js'

type ChatResponse = {
  choices: Array<{ message: { content: string } }>
}

export async function chatJson(system: string, user: string, options?: { model?: string }) {
  const apiKey = envConfig.OPENAI_API_KEY
  if (!apiKey) {
    throw new AppError({
      statusCode: 500,
      errorType: 'config_error',
      message: 'OPENAI_API_KEY is not configured.',
    })
  }

  const model = options?.model ?? OPENAI_CHAT_MODEL_DEFAULT
  const res = await fetch(OPENAI_CHAT_URL, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${apiKey}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
    }),
  })

  if (!res.ok) {
    const bodyText = await res.text().catch(() => '')

    logger.error(
      { status: res.status, body: bodyText.slice(0, 2000) },
      'OpenAI chat request failed.'
    )

    throw new AppError({
      statusCode: 502,
      errorType: 'openai_error',
      message: `OpenAI chat request failed (${res.status}).`,
    })
  }

  const json = (await res.json()) as ChatResponse
  const content = json.choices?.[0]?.message?.content

  if (!content) {
    throw new AppError({
      statusCode: 502,
      errorType: 'openai_error',
      message: 'OpenAI returned empty response.',
    })
  }

  return { model, content }
}
