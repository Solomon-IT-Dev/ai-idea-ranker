export type ErrorResponseBody = {
  status: 'fail' | 'error'
  errorType: string
  message: string
  requestId?: string
  stack?: string
}
