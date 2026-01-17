export type ErrorResponseBody = {
  status: 'fail' | 'error'
  errorType: string
  message: string
  requestId?: string
  stack?: string
}

export type OpenAIErrorResponse = {
  error?: {
    message?: string
    type?: string
    code?: string
  }
}
