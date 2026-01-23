import { useParams } from 'react-router-dom'
import { toast } from 'sonner'

import { useIdeas, useImportIdeas } from '@/entities/idea/api/ideas.queries'
import { IdeasImportForm } from '@/features/idea/IdeasImportForm'
import { IdeasTable } from '@/features/idea/IdeasTable'
import { useToastQueryError } from '@/shared/hooks/useToastQueryError'
import { ErrorState } from '@/shared/ui/error-state'

export function ProjectIdeasTab() {
  const { projectId } = useParams()

  const pid = projectId ?? ''

  const ideasQuery = useIdeas(pid)
  const importMutation = useImportIdeas(pid)

  useToastQueryError(ideasQuery.isError, ideasQuery.error, 'Couldn’t load ideas.')

  async function onImport(text: string) {
    try {
      const res = await importMutation.mutateAsync(text)
      const imported = res.insertedCount ?? res.ideas.length
      toast.success(`Imported ${imported} ideas.`)
    } catch (e) {
      toast.error('Couldn’t import ideas.')

      console.error(e)
    }
  }

  const ideas = ideasQuery.data?.ideas ?? []

  return (
    <div className="space-y-4">
      <IdeasImportForm onImport={onImport} isPending={importMutation.isPending} />

      {ideasQuery.isLoading ? (
        <div className="h-32 animate-pulse rounded-md bg-muted" />
      ) : ideasQuery.isError ? (
        <ErrorState
          title="Failed to load ideas"
          message={
            ideasQuery.error instanceof Error ? ideasQuery.error.message : 'Failed to load ideas.'
          }
          onRetry={() => void ideasQuery.refetch()}
          isRetrying={ideasQuery.isFetching}
        />
      ) : (
        <IdeasTable ideas={ideas} />
      )}
    </div>
  )
}
