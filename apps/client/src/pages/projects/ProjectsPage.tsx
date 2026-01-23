import { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { z } from 'zod'

import { useCreateProject, useDeleteProject, useProjects } from '@/entities/project/api/projects.queries'
import { useAuth } from '@/features/auth/model/auth.hooks'
import { useToastQueryError } from '@/shared/hooks/useToastQueryError'
import { setLastProjectId } from '@/shared/lib/storage'
import { zodResolver } from '@/shared/lib/zodResolver'
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
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/ui/dialog'
import { ErrorState } from '@/shared/ui/error-state'
import { FullScreenSpinner } from '@/shared/ui/full-screen-spinner'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Separator } from '@/shared/ui/separator'

const createProjectSchema = z.object({
  name: z.string().min(2).max(80),
  budget: z.coerce.number().int().min(0).max(10_000_000),
  fe: z.coerce.number().int().min(0).max(50),
  be: z.coerce.number().int().min(0).max(50),
  ds: z.coerce.number().int().min(0).max(50).optional(),
})

type CreateProjectForm = z.infer<typeof createProjectSchema>

export function ProjectsPage() {
  const navigate = useNavigate()
  const { user, signOut } = useAuth()

  const projectsQuery = useProjects()
  const createMutation = useCreateProject()
  const deleteMutation = useDeleteProject()

  useToastQueryError(projectsQuery.isError, projectsQuery.error, 'Failed to load projects.')

  const projects = useMemo(() => projectsQuery.data?.projects ?? [], [projectsQuery.data])

  const form = useForm<CreateProjectForm>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: { name: '', budget: 10000, fe: 1, be: 1, ds: 0 },
  })

  async function onCreate(values: CreateProjectForm) {
    const res = await createMutation.mutateAsync({
      name: values.name,
      constraints: {
        budget: values.budget,
        team: {
          fe: values.fe,
          be: values.be,
          ...(values.ds ? { ds: values.ds } : {}),
        },
      },
    })

    const projectId = res.project.id
    setLastProjectId(projectId)
    form.reset({ name: '', budget: 10000, fe: 1, be: 1, ds: 0 })
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
            <Dialog>
              <DialogTrigger asChild>
                <Button>Create project</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create project</DialogTitle>
                </DialogHeader>

                <form className="space-y-4" onSubmit={form.handleSubmit(onCreate)}>
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" placeholder="R&D ideas Q1" {...form.register('name')} />
                    {form.formState.errors.name?.message ? (
                      <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
                    ) : null}
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label htmlFor="budget">Budget (USD)</Label>
                    <Input id="budget" type="number" {...form.register('budget')} />
                    {form.formState.errors.budget?.message ? (
                      <p className="text-sm text-red-500">{form.formState.errors.budget.message}</p>
                    ) : null}
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="fe">FE</Label>
                      <Input id="fe" type="number" {...form.register('fe')} />
                      {form.formState.errors.fe?.message ? (
                        <p className="text-sm text-red-500">{form.formState.errors.fe.message}</p>
                      ) : null}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="be">BE</Label>
                      <Input id="be" type="number" {...form.register('be')} />
                      {form.formState.errors.be?.message ? (
                        <p className="text-sm text-red-500">{form.formState.errors.be.message}</p>
                      ) : null}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ds">DS</Label>
                      <Input id="ds" type="number" {...form.register('ds')} />
                      {form.formState.errors.ds?.message ? (
                        <p className="text-sm text-red-500">{form.formState.errors.ds.message}</p>
                      ) : null}
                    </div>
                  </div>

                  <DialogFooter>
                    <Button
                      type="submit"
                      disabled={form.formState.isSubmitting || createMutation.isPending}
                    >
                      {createMutation.isPending ? 'Creating…' : 'Create'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>

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
          <div className="grid gap-4 sm:grid-cols-2">
            {projects.map(p => (
              <Card
                key={p.id}
                className="cursor-pointer hover:opacity-90"
                onClick={() => onOpenProject(p.id)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                    <CardTitle className="text-base">{p.name}</CardTitle>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={e => e.stopPropagation()}
                        >
                          Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent onClick={e => e.stopPropagation()}>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete project?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete the project and all related data (ideas,
                            runs, playbook, artifacts). This action can’t be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => void deleteMutation.mutateAsync(p.id)}
                            disabled={deleteMutation.isPending}
                          >
                            {deleteMutation.isPending ? 'Deleting…' : 'Delete'}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="text-sm text-muted-foreground">
                    Budget: ${p.constraints?.budget ?? 0}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Team: FE {p.constraints?.team?.fe ?? 0} • BE {p.constraints?.team?.be ?? 0}
                    {p.constraints?.team?.ds ? ` • DS ${p.constraints.team.ds}` : ''}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  )
}
