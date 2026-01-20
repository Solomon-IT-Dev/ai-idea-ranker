import { createBrowserRouter, Navigate } from 'react-router-dom'

import { ProtectedRoute } from '@/app/router/protectedRoute'
import { RootRedirect } from '@/app/router/rootRedirect'
import { AuthPage } from '@/pages/auth/AuthPage'
import { ProjectLayout } from '@/pages/project/project.layout'
import { ProjectArtifactsTab } from '@/pages/project/tabs/project-artifacts.tab'
import { ProjectIdeasTab } from '@/pages/project/tabs/project-ideas.tab'
import { ProjectPlaybookTab } from '@/pages/project/tabs/project-playbook.tab'
import { ProjectRunsTab } from '@/pages/project/tabs/project-runs.tab'
import { ProjectsPage } from '@/pages/projects/ProjectsPage'

export const router = createBrowserRouter([
  { path: '/', element: <RootRedirect /> },
  { path: '/auth', element: <AuthPage /> },
  {
    element: <ProtectedRoute />,
    children: [
      { path: '/projects', element: <ProjectsPage /> },
      {
        path: '/projects/:projectId',
        element: <ProjectLayout />,
        children: [
          { index: true, element: <Navigate to="ideas" replace /> },
          { path: 'ideas', element: <ProjectIdeasTab /> },
          { path: 'playbook', element: <ProjectPlaybookTab /> },
          { path: 'runs', element: <ProjectRunsTab /> },
          { path: 'artifacts', element: <ProjectArtifactsTab /> },
        ],
      },
    ],
  },
])
