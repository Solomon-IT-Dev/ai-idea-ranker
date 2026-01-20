export type ApiErrorPayload = {
  status?: 'fail' | 'error'
  errorType?: string
  message?: string
  requestId?: string
  debug?: unknown
}
