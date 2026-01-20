import { Navigate, Outlet, useLocation } from 'react-router-dom'

import { useAuth } from '@/features/auth/model/auth.hooks'

export function ProtectedRoute() {
  const { isReady, accessToken } = useAuth()
  const location = useLocation()

  if (!isReady) return null
  if (!accessToken) {
    return <Navigate to="/auth" replace state={{ from: location.pathname }} />
  }

  return <Outlet />
}
