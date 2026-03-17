import type { SetURLSearchParams } from 'react-router-dom'

export function setSearchParam(
  setSearchParams: SetURLSearchParams,
  key: string,
  value: string,
  replace = true
) {
  setSearchParams(
    prev => {
      const next = new URLSearchParams(prev)
      next.set(key, value)
      return next
    },
    { replace }
  )
}

export function deleteSearchParam(
  setSearchParams: SetURLSearchParams,
  key: string,
  replace = true
) {
  setSearchParams(
    prev => {
      const next = new URLSearchParams(prev)
      next.delete(key)
      return next
    },
    { replace }
  )
}
