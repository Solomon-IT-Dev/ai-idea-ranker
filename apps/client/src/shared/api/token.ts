let getTokenFn: (() => string | null) | null = null

export function setTokenProvider(fn: () => string | null) {
  getTokenFn = fn
}

export function getAccessToken(): string | null {
  return getTokenFn ? getTokenFn() : null
}
