import { createBrowserRouter, Navigate } from 'react-router-dom'

import { AuthPage } from '@/pages/auth/AuthPage'
import { ProjectsPage } from '@/pages/projects/ProjectsPage'

export const router = createBrowserRouter([
  { path: '/auth', element: <AuthPage /> },
  { path: '/projects', element: <ProjectsPage /> },
  { path: '/', element: <Navigate to="/projects" replace /> },
])
