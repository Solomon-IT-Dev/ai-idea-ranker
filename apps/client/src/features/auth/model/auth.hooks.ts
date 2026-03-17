import { useContext, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { AuthContext } from '@/features/auth/model/auth.context'
import { getLastProjectId } from '@/shared/lib/storage'

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return ctx
}

type AuthLocationState = {
  from?: string
}

export function useAuthRedirect() {
  const { isReady, accessToken } = useAuth()
  const navigate = useNavigate()
  const location = useLocation() as { state?: AuthLocationState }

  useEffect(() => {
    if (!isReady || !accessToken) return

    const from = location.state?.from
    if (from) {
      navigate(from, { replace: true })
      return
    }

    const lastProjectId = getLastProjectId()
    if (lastProjectId) {
      navigate(`/projects/${lastProjectId}`, { replace: true })
      return
    }

    navigate('/projects', { replace: true })
  }, [accessToken, isReady, location.state, navigate])
}
