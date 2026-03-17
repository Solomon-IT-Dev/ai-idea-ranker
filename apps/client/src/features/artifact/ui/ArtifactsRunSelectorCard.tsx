import type { RunRow } from '@/entities/run/types/run'
import { Button } from '@/shared/ui/button'
import { Card } from '@/shared/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'
import { Separator } from '@/shared/ui/separator'

type Props = {
  projectId: string
  runId: string
  runs: RunRow[]
  isRunsLoading: boolean
  onPickRun: (value: string) => void
  onRefresh: () => void
}

export function ArtifactsRunSelectorCard({
  projectId,
  runId,
  runs,
  isRunsLoading,
  onPickRun,
  onRefresh,
}: Props) {
  if (!projectId) {
    return (
      <Card className="p-4">
        <p className="text-sm text-muted-foreground">Project is not selected.</p>
      </Card>
    )
  }

  return (
    <Card className="p-4">
      <div className="space-y-3">
        <div>
          <h2 className="text-base font-semibold">Artifacts</h2>
          <p className="text-sm text-muted-foreground">
            View the latest artifacts and compare them with previous versions.
          </p>
        </div>

        <Separator />

        <div className="flex flex-wrap items-end gap-3">
          <div className="w-full md:w-96 flex-grow">
            <div className="mb-1 text-sm font-medium">Run</div>
            <Select value={runId} onValueChange={onPickRun} disabled={!projectId}>
              <SelectTrigger>
                <SelectValue placeholder={isRunsLoading ? 'Loading runs…' : 'Choose a run'} />
              </SelectTrigger>
              <SelectContent>
                {runs.map(run => (
                  <SelectItem key={run.id} value={run.id}>
                    {new Date(run.created_at).toLocaleString()} · {run.status} ·{' '}
                    {run.id.slice(0, 8)}…
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button variant="outline" onClick={onRefresh} disabled={!runId}>
            Refresh
          </Button>
        </div>
      </div>
    </Card>
  )
}
