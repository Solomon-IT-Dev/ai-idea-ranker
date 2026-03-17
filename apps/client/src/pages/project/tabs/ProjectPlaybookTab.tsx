import { useParams } from 'react-router-dom'

import { useProjectPlaybookController } from '@/features/playbook/model/useProjectPlaybookController'
import { PlaybookEditor } from '@/features/playbook/PlaybookEditor'
import { PlaybookSearchTest } from '@/features/playbook/PlaybookSearchTest'
import { PlaybookChunksCard } from '@/features/playbook/ui/PlaybookChunksCard'
import { ErrorState } from '@/shared/ui/error-state'

export function ProjectPlaybookTab() {
  const { projectId } = useParams()
  const pid = projectId ?? ''

  const controller = useProjectPlaybookController(pid)

  if (controller.playbookQuery.isLoading) {
    return <div className="h-40 animate-pulse rounded-md bg-muted" />
  }

  if (controller.playbookQuery.isError) {
    return (
      <ErrorState
        title="Failed to load playbook"
        message={
          controller.playbookQuery.error instanceof Error
            ? controller.playbookQuery.error.message
            : 'Failed to load playbook.'
        }
        onRetry={() => void controller.playbookQuery.refetch()}
        isRetrying={controller.playbookQuery.isFetching}
      />
    )
  }

  return (
    <div className="space-y-4">
      <PlaybookEditor
        projectId={pid}
        initial={controller.playbookQuery.data ?? null}
        onSave={controller.savePlaybook}
        isPending={controller.upsertMutation.isPending}
      />

      <PlaybookSearchTest projectId={pid} hasChunks={controller.chunks.length > 0} />

      <PlaybookChunksCard
        chunks={controller.chunks}
        highlightedChunkId={controller.highlightedChunkId}
        onCopyChunkId={controller.copyChunkId}
        onCopyChunkLink={controller.copyChunkLink}
        onClearChunkLink={controller.clearChunkLink}
      />
    </div>
  )
}
