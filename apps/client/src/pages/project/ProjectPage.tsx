import { useParams } from 'react-router-dom'

export function ProjectPage() {
  const { projectId } = useParams()
  return (
    <div className="min-h-screen p-6">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-xl font-semibold">Project</h1>
        <p className="mt-2 text-sm text-muted-foreground">projectId: {projectId}</p>
      </div>
    </div>
  )
}
