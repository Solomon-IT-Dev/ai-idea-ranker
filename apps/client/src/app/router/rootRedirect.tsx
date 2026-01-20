import { Navigate } from 'react-router-dom'

import { useAuth } from '@/features/auth/model/auth.hooks'
import { getLastProjectId } from '@/shared/lib/storage'
import { FullScreenSpinner } from '@/shared/ui/full-screen-spinner'

export function RootRedirect() {
  const { isReady, accessToken } = useAuth()

  if (!isReady) return <FullScreenSpinner />
  if (!accessToken) return <Navigate to="/auth" replace />

  const last = getLastProjectId()
  if (last) return <Navigate to={`/projects/${last}`} replace />

  return <Navigate to="/projects" replace />
}
