import { useNavigate, useParams } from 'react-router-dom'

import { ArtifactsGenerationProgressCard } from '@/features/artifact/ui/ArtifactsGenerationProgressCard'
import { useRunDetailsController } from '@/features/run/model/useRunDetailsController'
import { RunLiveProgressCard } from '@/features/run/ui/RunLiveProgressCard'
import { RunScoresTableCard } from '@/features/run/ui/RunScoresTableCard'
import { RunSummaryCard } from '@/features/run/ui/RunSummaryCard'
import { useToastQueryError } from '@/shared/hooks/useToastQueryError'
import { Button } from '@/shared/ui/button'
import { ErrorState } from '@/shared/ui/error-state'

export function RunDetailsPage() {
  const { projectId, runId } = useParams()
  const navigate = useNavigate()

  const pid = projectId ?? ''
  const rid = runId ?? ''

  const controller = useRunDetailsController(pid, rid)
  const { runQuery } = controller

  useToastQueryError(runQuery.isError, runQuery.error, 'Failed to load run.')

  return (
    <div className="min-h-screen p-6">
      <div className="mx-auto max-w-5xl space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <Button variant="outline" onClick={() => navigate(`/projects/${pid}/runs`)}>
            Back to runs
          </Button>
        </div>

        {runQuery.isError ? (
          <ErrorState
            title="Failed to load run"
            message={runQuery.error instanceof Error ? runQuery.error.message : 'Failed to load run.'}
            onRetry={() => void runQuery.refetch()}
            isRetrying={runQuery.isFetching}
          />
        ) : null}

        <RunSummaryCard
          runId={rid}
          runStatus={controller.status}
          runErrorMessage={controller.run?.error_message}
          isConnected={controller.stream.isConnected}
          isRefreshing={runQuery.isFetching}
          isGeneratingArtifacts={controller.isGeneratingArtifacts}
          isGeneratePending={controller.generateArtifactsMutation.isPending}
          onRefresh={() => void runQuery.refetch()}
          onOpenArtifacts={() => navigate(`/projects/${pid}/artifacts?runId=${rid}`)}
          onGenerateArtifacts={() => void controller.generateArtifacts()}
        />

        <RunLiveProgressCard
          runStatus={controller.status}
          events={controller.stream.events}
          shouldStream={controller.shouldStream}
          isRefreshing={runQuery.isFetching}
          onStopLiveUpdates={controller.stopLiveUpdates}
        />

        <ArtifactsGenerationProgressCard
          runStatus={controller.status}
          planProgress={controller.planProgress}
          onClear={controller.clearPlanProgress}
        />

        <RunScoresTableCard scores={controller.scores} />
      </div>
    </div>
  )
}
