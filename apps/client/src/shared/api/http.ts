import { getAccessToken } from '@/shared/api/token'
import { env } from '@/shared/lib/env'
import type { ApiErrorPayload } from '@/shared/types/http'
import type { Json } from '@/shared/types/json'

export class ApiError extends Error {
  public status: number
  public errorType?: string
  public requestId?: string
  public debug?: unknown

  constructor(status: number, payload?: ApiErrorPayload) {
    super(payload?.message || `API request failed with status ${status}`)
    this.status = status
    this.errorType = payload?.errorType
    this.requestId = payload?.requestId
    this.debug = payload?.debug
  }
}

function safeJson(text: string) {
  try {
    return JSON.parse(text)
  } catch {
    return { message: text }
  }
}

export async function apiFetch<T>(
  path: string,
  init: RequestInit & { json?: Json } = {}
): Promise<T> {
  const url = `${env.apiBaseUrl}${path}`
  const token = getAccessToken()

  const headers = new Headers(init.headers)
  headers.set('accept', 'application/json')

  if (init.json !== undefined) {
    headers.set('content-type', 'application/json')
  }

  if (token) {
    headers.set('authorization', `Bearer ${token}`)
  }

  const res = await fetch(url, {
    ...init,
    headers,
    body: init.json !== undefined ? JSON.stringify(init.json) : init.body,
  })

  const text = await res.text().catch(() => '')
  const payload = text ? (safeJson(text) as unknown) : null

  if (!res.ok) {
    throw new ApiError(res.status, (payload as ApiErrorPayload) ?? undefined)
  }

  return (payload as T) ?? (null as T)
}
