import { useParams } from 'react-router-dom'
import { toast } from 'sonner'

import { useIdeas, useImportIdeas } from '@/entities/idea/api/ideas.queries'
import { IdeasImportForm } from '@/features/idea/IdeasImportForm'
import { IdeasTable } from '@/features/idea/IdeasTable'

export function ProjectIdeasTab() {
  const { projectId } = useParams()

  const pid = projectId ?? ''

  const ideasQuery = useIdeas(pid)
  const importMutation = useImportIdeas(pid)

  async function onImport(text: string) {
    try {
      const res = await importMutation.mutateAsync(text)
      const imported = res.imported ?? res.ideas?.length ?? 0
      toast.success(`Imported ${imported} ideas.`)
    } catch (e) {
      toast.error('Failed to import ideas.')

      console.error(e)
    }
  }

  const ideas = ideasQuery.data?.ideas ?? []

  return (
    <div className="space-y-4">
      <IdeasImportForm onImport={onImport} isPending={importMutation.isPending} />

      {ideasQuery.isLoading ? (
        <div className="h-32 animate-pulse rounded-md bg-muted" />
      ) : (
        <IdeasTable ideas={ideas} />
      )}
    </div>
  )
}
