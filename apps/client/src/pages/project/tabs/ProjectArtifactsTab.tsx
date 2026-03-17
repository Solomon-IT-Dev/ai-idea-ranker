import { useParams } from 'react-router-dom'

import { useProjectArtifactsController } from '@/features/artifact/model/useProjectArtifactsController'
import { ArtifactsLatestTab } from '@/features/artifact/ui/ArtifactsLatestTab'
import { ArtifactsRunSelectorCard } from '@/features/artifact/ui/ArtifactsRunSelectorCard'
import { ArtifactsVersionsTab } from '@/features/artifact/ui/ArtifactsVersionsTab'
import { Card } from '@/shared/ui/card'
import { ErrorState } from '@/shared/ui/error-state'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs'

export function ProjectArtifactsTab() {
  const { projectId } = useParams()
  const pid = projectId ?? ''

  const controller = useProjectArtifactsController(pid)

  return (
    <div className="space-y-4">
      <ArtifactsRunSelectorCard
        projectId={pid}
        runId={controller.runId}
        runs={controller.runs}
        isRunsLoading={controller.runsQuery.isLoading}
        onPickRun={controller.pickRun}
        onRefresh={() => void controller.refreshArtifacts()}
      />

      {pid && controller.runsQuery.isError ? (
        <ErrorState
          title="Failed to load runs"
          message={
            controller.runsQuery.error instanceof Error
              ? controller.runsQuery.error.message
              : 'Failed to load runs.'
          }
          onRetry={() => void controller.runsQuery.refetch()}
          isRetrying={controller.runsQuery.isFetching}
        />
      ) : null}

      {!pid || !controller.runId ? (
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">
            {pid ? 'Choose a run to view artifacts.' : 'Select a project to view artifacts.'}
          </p>
        </Card>
      ) : (
        <Tabs defaultValue="latest">
          <Card className="p-3">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="latest">Latest</TabsTrigger>
              <TabsTrigger value="versions">Versions</TabsTrigger>
            </TabsList>
          </Card>

          <TabsContent value="latest" className="space-y-4">
            <ArtifactsLatestTab
              projectId={pid}
              runId={controller.runId}
              isLoading={controller.latestQuery.isLoading}
              isError={controller.latestQuery.isError}
              errorMessage={controller.latestError}
              isFetching={controller.latestQuery.isFetching}
              latestPlan={controller.latestPlan}
              latestCard={controller.latestCard}
              onRetry={() => void controller.latestQuery.refetch()}
              onCopy={md => void controller.copyMarkdown(md)}
              onExport={controller.exportMarkdown}
            />
          </TabsContent>

          <TabsContent value="versions" className="space-y-4">
            <ArtifactsVersionsTab
              projectId={pid}
              runId={controller.runId}
              byType={controller.byType}
              latestPlanId={controller.latestPlanId}
              latestCardId={controller.latestCardId}
              latestPlan={controller.latestPlan}
              latestCard={controller.latestCard}
              selectedPlan={controller.selectedPlan}
              selectedCard={controller.selectedCard}
              selectedPlanId={controller.selectedVersionByType.plan_30_60_90}
              selectedCardId={controller.selectedVersionByType.experiment_card}
              isListLoading={controller.listQuery.isLoading}
              isListError={controller.listQuery.isError}
              listError={controller.listError}
              isListFetching={controller.listQuery.isFetching}
              isLatestLoading={controller.latestQuery.isLoading}
              onRetryList={() => void controller.listQuery.refetch()}
              onSelectPlan={id => controller.selectVersion('plan_30_60_90', id)}
              onSelectCard={id => controller.selectVersion('experiment_card', id)}
              onClearSelection={controller.clearSelectedVersions}
              onCopy={md => void controller.copyMarkdown(md)}
              onExport={controller.exportMarkdown}
            />
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
