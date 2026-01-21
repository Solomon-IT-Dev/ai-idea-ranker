import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'

import { useGenerateArtifactsMutation } from '@/entities/artifact/api/artifacts.queries'
import { useRun } from '@/entities/run/api/runs.queries'
import { useRunStream } from '@/features/runStream/model/runStream.hooks'
import { useToastQueryError } from '@/shared/hooks/useToastQueryError'
import { Button } from '@/shared/ui/button'
import { Card } from '@/shared/ui/card'
import { ErrorState } from '@/shared/ui/error-state'
import { Separator } from '@/shared/ui/separator'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table'

export function RunDetailsPage() {
  const { projectId, runId } = useParams()
  const navigate = useNavigate()

  const pid = projectId ?? ''
  const rid = runId ?? ''

  const runQuery = useRun(pid, rid)
  useToastQueryError(runQuery.isError, runQuery.error, 'Failed to load run.')

  const run = runQuery.data?.run
  const status = run?.status

  // Streaming is optional; we also use the same SSE stream for `plan.progress` during artifacts generation.
  const [isStreamEnabled, setIsStreamEnabled] = useState(true)

  // Local progress log for artifacts generation (plan.progress)
  const [planProgress, setPlanProgress] = useState<
    Array<{ stage?: string; message?: string; at: number }>
  >([])

  // When generating artifacts, we want SSE enabled even if the run is already completed.
  const [isGeneratingArtifacts, setIsGeneratingArtifacts] = useState(false)

  useEffect(() => {
    setIsStreamEnabled(true)
    setPlanProgress([])
    setIsGeneratingArtifacts(false)
  }, [pid, rid])

  const shouldStream =
    isStreamEnabled &&
    Boolean(rid) &&
    (status === 'running' || status === undefined || isGeneratingArtifacts)

  const stream = useRunStream({ projectId: pid, runId: rid, enabled: shouldStream })

  // When we receive terminal run events, refetch to get final scores
  useEffect(() => {
    const t = stream.lastEvent?.type
    if (t === 'run.completed' || t === 'run.failed') {
      void runQuery.refetch()
      if (t === 'run.failed') {
        toast.error(
          isGeneratingArtifacts
            ? 'Artifacts generation failed. Check errors.'
            : 'Run failed. Check errors.'
        )
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stream.lastEvent?.type, isGeneratingArtifacts])

  // Track `plan.progress` events (artifacts streaming)
  useEffect(() => {
    const e = stream.lastEvent
    if (!e) return

    if (e.type === 'plan.progress') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const stage = (e.data as any)?.stage
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const message = (e.data as any)?.message

      setPlanProgress(prev => [...prev, { stage, message, at: Date.now() }])

      // Optional lightweight UX hints
      if (stage === 'artifacts.openai') toast.message('Artifacts: generating draft…')
      if (stage === 'artifacts.render') toast.message('Artifacts: rendering markdown…')
      if (stage === 'artifacts.persist') toast.message('Artifacts: saving…')
    }
  }, [stream.lastEvent])

  const scores = useMemo(() => {
    const d = runQuery.data
    const arr = d?.top ?? d?.scores ?? []
    return [...arr].sort((a, b) => b.overall - a.overall)
  }, [runQuery.data])

  const generateArtifactsMutation = useGenerateArtifactsMutation()

  async function onGenerateArtifacts() {
    if (!pid || !rid) return

    if (run?.status !== 'completed') {
      toast.error('Artifacts can be generated only after the run is completed.')
      return
    }

    // Ensure stream is enabled so we can see `plan.progress`.
    setIsStreamEnabled(true)
    setIsGeneratingArtifacts(true)
    setPlanProgress([])

    try {
      await generateArtifactsMutation.mutateAsync({ projectId: pid, runId: rid, topN: 3 })
      toast.success('Artifacts generated.')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast.error(err?.message ?? 'Failed to generate artifacts.')
    } finally {
      setIsGeneratingArtifacts(false)
    }
  }

  return (
    <div className="min-h-screen p-6">
      <div className="mx-auto max-w-5xl space-y-4">
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={() => navigate(`/projects/${pid}/runs`)}>
            Back
          </Button>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => runQuery.refetch()}
              disabled={runQuery.isFetching}
            >
              Refresh
            </Button>

            <Button
              variant="outline"
              onClick={() => navigate(`/projects/${pid}/artifacts?runId=${rid}`)}
              disabled={!pid || !rid}
            >
              Open Artifacts tab
            </Button>

            <Button
              onClick={onGenerateArtifacts}
              disabled={
                runQuery.isFetching ||
                generateArtifactsMutation.isPending ||
                isGeneratingArtifacts ||
                run?.status !== 'completed'
              }
            >
              Generate 30-60-90 + Experiment Card
            </Button>
          </div>
        </div>

        {runQuery.isError ? (
          <ErrorState
            title="Failed to load run"
            message={
              runQuery.error instanceof Error ? runQuery.error.message : 'Failed to load run.'
            }
            onRetry={() => void runQuery.refetch()}
            isRetrying={runQuery.isFetching}
          />
        ) : null}

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

          {run?.status !== 'completed' ? (
            <div className="mt-3 text-xs text-muted-foreground">
              Artifacts generation is enabled once the run is completed.
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
                    ? 'Run completed. Live events are only available while streaming is enabled.'
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

        {/* Artifacts-specific progress (plan.progress) */}
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold">Artifacts progress</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPlanProgress([])}
              disabled={planProgress.length === 0}
            >
              Clear
            </Button>
          </div>

          <Separator className="my-3" />

          {planProgress.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No artifacts progress yet. Click “Generate 30-60-90 + Experiment Card” to see streamed
              stages.
            </p>
          ) : (
            <div className="max-h-48 space-y-2 overflow-auto rounded-md border p-3 text-xs">
              {planProgress.map((p, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="rounded bg-muted px-2 py-0.5">{p.stage ?? 'progress'}</span>
                    <span className="text-muted-foreground">
                      {new Date(p.at).toLocaleTimeString()}
                    </span>
                  </div>
                  {p.message ? <div className="text-muted-foreground">{p.message}</div> : null}
                </div>
              ))}
            </div>
          )}
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
