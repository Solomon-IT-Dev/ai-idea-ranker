import { createBrowserRouter } from 'react-router-dom'

import { ProtectedRoute } from '@/app/router/protectedRoute'
import { RootRedirect } from '@/app/router/rootRedirect'
import { AuthPage } from '@/pages/auth/AuthPage'
import { ProjectPage } from '@/pages/project/ProjectPage'
import { ProjectsPage } from '@/pages/projects/ProjectsPage'

export const router = createBrowserRouter([
  { path: '/', element: <RootRedirect /> },
  { path: '/auth', element: <AuthPage /> },
  {
    element: <ProtectedRoute />,
    children: [
      { path: '/projects', element: <ProjectsPage /> },
      { path: '/projects/:projectId', element: <ProjectPage /> },
    ],
  },
])
