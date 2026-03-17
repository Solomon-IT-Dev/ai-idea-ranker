import { RunStatusBadge } from '@/entities/run/ui/RunStatusBadge'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card } from '@/shared/ui/card'
import { Separator } from '@/shared/ui/separator'

type Props = {
  runId: string
  runStatus: string | undefined
  runErrorMessage: string | null | undefined
  isConnected: boolean
  isRefreshing: boolean
  isGeneratingArtifacts: boolean
  isGeneratePending: boolean
  onRefresh: () => void
  onOpenArtifacts: () => void
  onGenerateArtifacts: () => void
}

export function RunSummaryCard({
  runId,
  runStatus,
  runErrorMessage,
  isConnected,
  isRefreshing,
  isGeneratingArtifacts,
  isGeneratePending,
  onRefresh,
  onOpenArtifacts,
  onGenerateArtifacts,
}: Props) {
  return (
    <Card className="p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold">Run</h2>
          <p className="text-sm text-muted-foreground">
            Run ID{' '}
            <Badge variant="secondary" className="font-mono">
              {runId}
            </Badge>
          </p>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex flex-wrap items-center justify-end gap-2">
            <span>Status</span>
            <RunStatusBadge status={runStatus} />
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2 text-muted-foreground">
            <span>Live updates</span>
            <Badge variant={isConnected ? 'secondary' : 'destructive'}>
              {isConnected ? 'Connected' : 'Disconnected'}
            </Badge>
          </div>
        </div>
      </div>

      {runErrorMessage ? (
        <div className="mt-3 rounded-md border p-3 text-sm">
          <div className="font-medium">Error</div>
          <div className="text-muted-foreground">{runErrorMessage}</div>
        </div>
      ) : null}

      <Separator className="my-3" />

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-xs text-muted-foreground">
          {runStatus !== 'completed'
            ? 'Artifacts are available after the run is completed.'
            : 'Artifacts are available for this run.'}
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
          <Button variant="outline" onClick={onRefresh} disabled={isRefreshing}>
            Refresh
          </Button>

          <Button variant="outline" onClick={onOpenArtifacts}>
            Open artifacts
          </Button>

          <Button
            onClick={onGenerateArtifacts}
            disabled={
              isRefreshing || isGeneratePending || isGeneratingArtifacts || runStatus !== 'completed'
            }
          >
            Generate artifacts
          </Button>
        </div>
      </div>
    </Card>
  )
}
