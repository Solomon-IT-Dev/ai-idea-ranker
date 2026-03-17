import { useMemo } from 'react'

import type { RunRow } from '@/entities/run/types/run'

import { RunStatusBadge } from '@/entities/run/ui/RunStatusBadge'
import { formatDateTime } from '@/shared/lib/date'
import { Button } from '@/shared/ui/button'
import { Card } from '@/shared/ui/card'
import { ErrorState } from '@/shared/ui/error-state'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table'

type Props = {
  runs: RunRow[]
  isLoading: boolean
  isError: boolean
  isFetching: boolean
  error: unknown
  onRetry: () => void
  onRefresh: () => void
  onOpenRun: (runId: string) => void
}

export function RunHistoryTable({
  runs,
  isLoading,
  isError,
  isFetching,
  error,
  onRetry,
  onRefresh,
  onOpenRun,
}: Props) {
  const sortedRuns = useMemo(
    () => [...runs].sort((left, right) => (left.created_at < right.created_at ? 1 : -1)),
    [runs]
  )

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold">Run history</h3>
        <Button variant="outline" onClick={onRefresh} disabled={isFetching}>
          Refresh
        </Button>
      </div>

      <div className="mt-3">
        {isLoading ? (
          <div className="h-32 animate-pulse rounded-md bg-muted" />
        ) : isError ? (
          <ErrorState
            title="Failed to load runs"
            message={error instanceof Error ? error.message : 'Failed to load runs.'}
            onRetry={onRetry}
            isRetrying={isFetching}
          />
        ) : (
          <div className="overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Created</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Model</TableHead>
                  <TableHead>Top N</TableHead>
                  <TableHead className="text-right">Open</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedRuns.map(run => (
                  <TableRow key={run.id}>
                    <TableCell className="whitespace-nowrap">{formatDateTime(run.created_at)}</TableCell>
                    <TableCell>
                      <RunStatusBadge status={run.status} />
                    </TableCell>
                    <TableCell>{run.model}</TableCell>
                    <TableCell>{run.top_n}</TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="outline" onClick={() => onOpenRun(run.id)}>
                        Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}

                {sortedRuns.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-muted-foreground">
                      No runs yet. Start your first run above.
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </Card>
  )
}
