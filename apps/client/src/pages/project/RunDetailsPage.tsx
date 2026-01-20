import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'

import { useRun } from '@/entities/run/api/runs.queries'
import { useRunStream } from '@/features/runStream/model/runStream.hooks'
import { Button } from '@/shared/ui/button'
import { Card } from '@/shared/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table'

export function RunDetailsPage() {
  const { projectId, runId } = useParams()
  const navigate = useNavigate()

  const pid = projectId ?? ''
  const rid = runId ?? ''

  const runQuery = useRun(pid, rid)

  const status = runQuery.data?.run.status
  const [isStreamEnabled, setIsStreamEnabled] = useState(true)

  useEffect(() => {
    setIsStreamEnabled(true)
  }, [pid, rid])

  const shouldStream =
    isStreamEnabled && Boolean(rid) && (status === 'running' || status === undefined)

  const stream = useRunStream({ projectId: pid, runId: rid, enabled: shouldStream })

  // When we receive terminal events, refetch to get final scores
  useEffect(() => {
    const t = stream.lastEvent?.type
    if (t === 'run.completed' || t === 'run.failed') {
      void runQuery.refetch()
      if (t === 'run.failed') toast.error('Run failed. Check errors.')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stream.lastEvent?.type])

  const run = runQuery.data?.run
  const scores = useMemo(() => {
    const d = runQuery.data
    const arr = d?.top ?? d?.scores ?? []
    return [...arr].sort((a, b) => b.overall - a.overall)
  }, [runQuery.data])

  return (
    <div className="min-h-screen p-6">
      <div className="mx-auto max-w-5xl space-y-4">
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={() => navigate(`/projects/${pid}/runs`)}>
            Back
          </Button>
          <Button
            variant="outline"
            onClick={() => runQuery.refetch()}
            disabled={runQuery.isFetching}
          >
            Refresh
          </Button>
        </div>

        <Card className="p-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold">Run details</h2>
              <p className="text-sm text-muted-foreground">runId: {rid}</p>
            </div>

            <div className="text-sm">
              <div>Status: {run?.status ?? 'loading…'}</div>
              <div className="text-muted-foreground">
                Stream: {stream.isConnected ? 'connected' : 'disconnected'}
              </div>
            </div>
          </div>

          {run?.error_message ? (
            <div className="mt-3 rounded-md border p-3 text-sm">
              <div className="font-medium">Error</div>
              <div className="text-muted-foreground">{run.error_message}</div>
            </div>
          ) : null}
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold">Progress</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setIsStreamEnabled(false)
                stream.stop()
                toast.message('Stream stopped. The run continues on the server.')
              }}
              disabled={runQuery.isFetching || !shouldStream}
            >
              Stop stream
            </Button>
          </div>

          <div className="mt-3 max-h-64 overflow-auto rounded-md border p-3 text-xs">
            {stream.events.length === 0 ? (
              <div className="text-muted-foreground">
                {run?.status === 'running' && !shouldStream
                  ? 'Stream stopped (the run continues on the server).'
                  : run?.status === 'completed'
                    ? 'Run completed. Live events are only available while the run is running.'
                    : run?.status === 'failed'
                      ? 'Run failed. No stream events available.'
                      : 'No events yet.'}
              </div>
            ) : (
              <div className="space-y-2">
                {stream.events.map((e, idx) => (
                  <div key={idx}>
                    <div className="font-medium">{e.type}</div>
                    <pre className="whitespace-pre-wrap text-muted-foreground">
                      {JSON.stringify(e.data, null, 2)}
                    </pre>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>

        <Card className="p-4">
          <h3 className="text-base font-semibold">Top results</h3>

          <div className="mt-3 overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Idea</TableHead>
                  <TableHead>Overall</TableHead>
                  <TableHead>Impact</TableHead>
                  <TableHead>Effort</TableHead>
                  <TableHead>Risk</TableHead>
                  <TableHead>Data</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {scores.map(s => (
                  <TableRow key={s.id}>
                    <TableCell className="min-w-[260px]">
                      <div className="font-medium">{s.ideas?.title ?? s.idea_id}</div>
                      <div className="mt-1 text-xs text-muted-foreground">{s.rationale}</div>
                    </TableCell>
                    <TableCell>{Math.round(s.overall)}</TableCell>
                    <TableCell>{s.impact}</TableCell>
                    <TableCell>{s.effort}</TableCell>
                    <TableCell>{s.risk}</TableCell>
                    <TableCell>{s.data_readiness}</TableCell>
                  </TableRow>
                ))}

                {scores.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-muted-foreground">
                      No scores yet. If the run is running, wait for completion.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
    </div>
  )
}
