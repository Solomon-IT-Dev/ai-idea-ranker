import { useNavigate } from 'react-router-dom'

import { useCreateProject, useDeleteProject, useProjects } from '@/entities/project/api/projects.queries'
import { useAuth } from '@/features/auth/model/auth.hooks'
import {
  type CreateProjectFormValues,
  mapCreateProjectFormToPayload,
} from '@/features/project/model/createProjectForm'
import { CreateProjectDialog } from '@/features/project/ui/CreateProjectDialog'
import { ProjectCardGrid } from '@/features/project/ui/ProjectCardGrid'
import { useToastQueryError } from '@/shared/hooks/useToastQueryError'
import { setLastProjectId } from '@/shared/lib/storage'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { ErrorState } from '@/shared/ui/error-state'
import { FullScreenSpinner } from '@/shared/ui/full-screen-spinner'

export function ProjectsPage() {
  const navigate = useNavigate()
  const { user, signOut } = useAuth()

  const projectsQuery = useProjects()
  const createMutation = useCreateProject()
  const deleteMutation = useDeleteProject()

  useToastQueryError(projectsQuery.isError, projectsQuery.error, 'Failed to load projects.')
  const projects = projectsQuery.data?.projects ?? []

  async function onCreate(values: CreateProjectFormValues) {
    const res = await createMutation.mutateAsync(mapCreateProjectFormToPayload(values))

    const projectId = res.project.id
    setLastProjectId(projectId)
    navigate(`/projects/${projectId}`)
  }

  function onOpenProject(projectId: string) {
    setLastProjectId(projectId)
    navigate(`/projects/${projectId}`)
  }

  return (
    <div className="min-h-screen p-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">Projects</h1>
            <p className="text-sm text-muted-foreground">
              Signed in as <span className="font-medium text-foreground">{user?.email ?? 'unknown'}</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <CreateProjectDialog isPending={createMutation.isPending} onCreate={onCreate} />

            <Button variant="outline" onClick={() => void signOut()}>
              Sign out
            </Button>
          </div>
        </header>

        {projectsQuery.isLoading ? <FullScreenSpinner /> : null}

        {projectsQuery.isError ? (
          <ErrorState
            title="Failed to load projects"
            message={
              projectsQuery.error instanceof Error
                ? projectsQuery.error.message
                : 'Failed to load projects.'
            }
            onRetry={() => void projectsQuery.refetch()}
            isRetrying={projectsQuery.isFetching}
          />
        ) : null}

        {!projectsQuery.isLoading && !projectsQuery.isError && projects.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No projects yet</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Create your first project to start importing ideas and generating runs.
              </p>
            </CardContent>
          </Card>
        ) : null}

        {!projectsQuery.isLoading && !projectsQuery.isError && projects.length > 0 ? (
          <ProjectCardGrid
            projects={projects}
            isDeletePending={deleteMutation.isPending}
            onOpenProject={onOpenProject}
            onDeleteProject={projectId => deleteMutation.mutateAsync(projectId)}
          />
        ) : null}
      </div>
    </div>
  )
}
