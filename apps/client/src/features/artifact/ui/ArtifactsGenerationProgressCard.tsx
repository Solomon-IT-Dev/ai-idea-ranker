import type { ArtifactsPlanProgressItem } from '@/features/run/model/useRunDetailsController'
import { Button } from '@/shared/ui/button'
import { Card } from '@/shared/ui/card'
import { Separator } from '@/shared/ui/separator'

type Props = {
  runStatus: string | undefined
  planProgress: ArtifactsPlanProgressItem[]
  onClear: () => void
}

export function ArtifactsGenerationProgressCard({ runStatus, planProgress, onClear }: Props) {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold">Artifacts generation</h3>
        <Button variant="outline" size="sm" onClick={onClear} disabled={planProgress.length === 0}>
          Clear
        </Button>
      </div>

      <Separator className="my-3" />

      {planProgress.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {runStatus !== 'completed'
            ? 'Available after the run is completed.'
            : 'Click “Generate artifacts” to create a plan and an experiment card for this run.'}
        </p>
      ) : (
        <div className="max-h-48 space-y-2 overflow-auto rounded-md border p-3 text-xs">
          {planProgress.map((progress, idx) => (
            <div key={idx} className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="rounded bg-muted px-2 py-0.5">{progress.stage ?? 'progress'}</span>
                <span className="text-muted-foreground">
                  {new Date(progress.at).toLocaleTimeString()}
                </span>
              </div>
              {progress.message ? (
                <div className="text-muted-foreground">{progress.message}</div>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}
