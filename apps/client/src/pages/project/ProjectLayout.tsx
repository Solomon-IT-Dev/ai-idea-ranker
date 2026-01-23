import { useEffect, useMemo } from 'react'
import { Navigate, Outlet, useLocation, useNavigate, useParams } from 'react-router-dom'

import { useDeleteProject, useProject } from '@/entities/project/api/projects.queries'
import { ProjectHeader } from '@/entities/project/ui/ProjectHeader'
import { setLastProjectId } from '@/shared/lib/storage'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/shared/ui/alert-dialog'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card } from '@/shared/ui/card'
import { Tabs, TabsList, TabsTrigger } from '@/shared/ui/tabs'

type TabValue = 'ideas' | 'playbook' | 'runs' | 'artifacts'

function getActiveTab(pathname: string): TabValue {
  // pathname like: /projects/:id/ideas
  const parts = pathname.split('/').filter(Boolean)
  const last = parts[parts.length - 1]
  if (last === 'playbook' || last === 'runs' || last === 'artifacts') return last
  return 'ideas'
}

export function ProjectLayout() {
  const { projectId } = useParams()
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    if (projectId) setLastProjectId(projectId)
  }, [projectId])

  const activeTab = useMemo(() => getActiveTab(location.pathname), [location.pathname])

  function onTabChange(value: string) {
    if (!projectId) return
    const v = value as TabValue
    navigate({
      pathname: `/projects/${projectId}/${v}`,
      search: v === 'artifacts' ? location.search : '',
    })
  }

  function goBack() {
    navigate('/projects')
  }

  const { data, isLoading, isError } = useProject(projectId ?? '')
  const project = data?.project
  const deleteMutation = useDeleteProject()

  // Guard: missing param
  if (!projectId) {
    return <Navigate to="/projects" replace />
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen p-6">
        <div className="mx-auto max-w-5xl space-y-4">
          <div className="h-10 w-48 animate-pulse rounded-md bg-muted" />
          <div className="h-24 animate-pulse rounded-md bg-muted" />
          <div className="h-12 animate-pulse rounded-md bg-muted" />
          <div className="h-40 animate-pulse rounded-md bg-muted" />
        </div>
      </div>
    )
  }

  // Error state: 404 / forbidden / any backend "not found" should route away
  if (isError || !project) {
    return (
      <div className="min-h-screen p-6">
        <div className="mx-auto max-w-5xl space-y-4">
          <Card className="p-4">
            <div className="space-y-2">
              <h1 className="text-lg font-semibold">Project not available</h1>
              <p className="text-sm text-muted-foreground">
                The project may not exist or you don’t have access.
              </p>
              <Button variant="outline" onClick={goBack}>
                Back to projects
              </Button>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-6">
      <div className="mx-auto max-w-5xl space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">
              projectId:{' '}
              <Badge variant="secondary" className="font-mono">
                {projectId}
              </Badge>
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">Delete project</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete project?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete the project and all related data (ideas, runs,
                    playbook, artifacts). This action can’t be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={async () => {
                      await deleteMutation.mutateAsync(projectId)
                      goBack()
                    }}
                    disabled={deleteMutation.isPending}
                  >
                    {deleteMutation.isPending ? 'Deleting…' : 'Delete'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <Button variant="outline" onClick={goBack}>
              Back to projects
            </Button>
          </div>
        </div>

        <ProjectHeader name={project.name} constraints={project.constraints} />

        <Card className="p-3">
          <Tabs value={activeTab} onValueChange={onTabChange}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="ideas">Ideas</TabsTrigger>
              <TabsTrigger value="playbook">Playbook</TabsTrigger>
              <TabsTrigger value="runs">Runs</TabsTrigger>
              <TabsTrigger value="artifacts">Artifacts</TabsTrigger>
            </TabsList>
          </Tabs>
        </Card>

        <Outlet />
      </div>
    </div>
  )
}
