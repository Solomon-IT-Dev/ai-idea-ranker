import { useParams } from 'react-router-dom'

import { usePlaybook, useUpsertPlaybook } from '@/entities/playbook/api/playbook.queries'
import { PlaybookEditor } from '@/features/playbook/PlaybookEditor'
import { PlaybookSearchTest } from '@/features/playbook/PlaybookSearchTest'
import { useToastQueryError } from '@/shared/hooks/useToastQueryError'
import { ErrorState } from '@/shared/ui/error-state'

export function ProjectPlaybookTab() {
  const { projectId } = useParams()
  const pid = projectId ?? ''

  const pbQuery = usePlaybook(pid)
  const upsert = useUpsertPlaybook(pid)

  useToastQueryError(pbQuery.isError, pbQuery.error, 'Failed to load playbook.')

  async function onSave(values: { title: string; content: string }) {
    await upsert.mutateAsync(values)
  }

  if (pbQuery.isLoading) {
    return <div className="h-40 animate-pulse rounded-md bg-muted" />
  }

  if (pbQuery.isError) {
    return (
      <ErrorState
        title="Failed to load playbook"
        message={
          pbQuery.error instanceof Error ? pbQuery.error.message : 'Failed to load playbook.'
        }
        onRetry={() => void pbQuery.refetch()}
        isRetrying={pbQuery.isFetching}
      />
    )
  }

  return (
    <div className="space-y-4">
      <PlaybookEditor initial={pbQuery.data ?? null} onSave={onSave} isPending={upsert.isPending} />

      {/* Optional: keep it if retrieval endpoint exists; otherwise comment out */}
      <PlaybookSearchTest projectId={pid} />
    </div>
  )
}
