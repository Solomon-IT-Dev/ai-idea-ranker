import type { Project } from '@/entities/project/types/project'
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

type Props = {
  projects: Project[]
  isDeletePending?: boolean
  onOpenProject: (projectId: string) => void
  onDeleteProject: (projectId: string) => Promise<void>
}

export function ProjectCardGrid({
  projects,
  isDeletePending = false,
  onOpenProject,
  onDeleteProject,
}: Props) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {projects.map(project => (
        <Card
          key={project.id}
          className="cursor-pointer hover:opacity-90"
          onClick={() => onOpenProject(project.id)}
        >
          <CardHeader>
            <div className="flex items-start justify-between gap-3">
              <CardTitle className="text-base">{project.name}</CardTitle>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={event => event.stopPropagation()}
                  >
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent onClick={event => event.stopPropagation()}>
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
                      onClick={() => void onDeleteProject(project.id)}
                      disabled={isDeletePending}
                    >
                      {isDeletePending ? 'Deleting…' : 'Delete'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-sm text-muted-foreground">
              Budget: ${project.constraints?.budget ?? 0}
            </div>
            <div className="text-sm text-muted-foreground">
              Team: FE {project.constraints?.team?.fe ?? 0} • BE{' '}
              {project.constraints?.team?.be ?? 0}
              {project.constraints?.team?.ds ? ` • DS ${project.constraints.team.ds}` : ''}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
