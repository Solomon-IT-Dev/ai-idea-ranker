import { useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'

import { getLatestArtifacts, listArtifacts } from '@/entities/artifact/api/artifacts.api'
import {
  artifactKeys,
  useGenerateArtifactsMutation,
} from '@/entities/artifact/api/artifacts.queries'
import { runKeys, useRun } from '@/entities/run/api/runs.queries'
import { useRunStream } from '@/features/runStream/model/runStream.hooks'
import { useToastQueryError } from '@/shared/hooks/useToastQueryError'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card } from '@/shared/ui/card'
import { ErrorState } from '@/shared/ui/error-state'
import { Separator } from '@/shared/ui/separator'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table'

export function RunDetailsPage() {
  const { projectId, runId } = useParams()
  const navigate = useNavigate()
  const qc = useQueryClient()

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

  const prefetchArtifacts = useCallback(async () => {
    if (!pid || !rid) return

    await Promise.all([
      qc.prefetchQuery({
        queryKey: artifactKeys.latest(pid, rid),
        queryFn: () => getLatestArtifacts({ projectId: pid, runId: rid }),
      }),
      qc.prefetchQuery({
        queryKey: artifactKeys.list(pid, rid),
        queryFn: () => listArtifacts({ projectId: pid, runId: rid }),
      }),
    ])
  }, [pid, qc, rid])

  const shouldStream =
    isStreamEnabled &&
    Boolean(rid) &&
    (status === 'running' || status === undefined || isGeneratingArtifacts)

  const stream = useRunStream({
    projectId: pid,
    runId: rid,
    enabled: shouldStream,
    stopOnTerminal: !isGeneratingArtifacts,
  })

  // When we receive terminal run events, refetch to get final scores
  useEffect(() => {
    const t = stream.lastEvent?.type
    if (t === 'run.completed' || t === 'run.failed') {
      void runQuery.refetch()
      if (pid) void qc.invalidateQueries({ queryKey: runKeys.all(pid) })
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

      // This section is specifically for artifacts generation.
      // Ignore run-scoring stages like "scoring"/"persist" to avoid confusing UX.
      const stageStr = typeof stage === 'string' ? stage : ''
      if (!stageStr.startsWith('artifacts.')) return

      setPlanProgress(prev => [...prev, { stage, message, at: Date.now() }])

      // Optional lightweight UX hints
      if (stage === 'artifacts.openai') toast.message('Artifacts: generating draft…')
      if (stage === 'artifacts.render') toast.message('Artifacts: rendering markdown…')
      if (stage === 'artifacts.persist') toast.message('Artifacts: saving…')
      if (stage === 'artifacts.done') void prefetchArtifacts()
    }
  }, [prefetchArtifacts, stream.lastEvent])

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
      await prefetchArtifacts()
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
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <Button variant="outline" onClick={() => navigate(`/projects/${pid}/runs`)}>
            Back
          </Button>

          <div className="flex items-center justify-between gap-2 sm:justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => runQuery.refetch()}
              disabled={runQuery.isFetching}
            >
              Refresh
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

            <div className="space-y-2 text-sm">
              <div className="flex flex-wrap items-center justify-end gap-2">
                <span>Status</span>
                <Badge variant={statusBadgeVariant(run?.status)}>{run?.status ?? 'loading'}</Badge>
              </div>
              <div className="flex flex-wrap items-center justify-end gap-2 text-muted-foreground">
                <span>Stream</span>
                <Badge variant={stream.isConnected ? 'secondary' : 'destructive'}>
                  {stream.isConnected ? 'connected' : 'disconnected'}
                </Badge>
              </div>
            </div>
          </div>

          {run?.error_message ? (
            <div className="mt-3 rounded-md border p-3 text-sm">
              <div className="font-medium">Error</div>
              <div className="text-muted-foreground">{run.error_message}</div>
            </div>
          ) : null}

          <Separator className="my-3" />

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-xs text-muted-foreground">
              {run?.status !== 'completed'
                ? 'Artifacts actions (available after the run is completed).'
                : 'Artifacts actions.'}
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
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
                Generate Plan + Experiment Card
              </Button>
            </div>
          </div>
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

          <div className="mt-3 max-h-64 overflow-auto rounded-md border p-3">
            {stream.events.length === 0 ? (
              <div className="text-xs text-muted-foreground">
                {run?.status === 'running' && !shouldStream
                  ? 'Stream stopped (the run continues on the server).'
                  : run?.status === 'completed'
                    ? 'Run completed. Live events are only available while streaming is enabled.'
                    : run?.status === 'failed'
                      ? 'Run failed. No stream events available.'
                      : 'No events yet.'}
              </div>
            ) : (
              <ProgressEventsList events={stream.events} />
            )}
          </div>
        </Card>

        {/* Artifacts generation progress (plan.progress: artifacts.*) */}
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold">Artifacts generation</h3>
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
              Artifacts are generated after the run completes. Click “Generate Plan + Experiment
              Card” to start.
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

function statusBadgeVariant(
  status: string | undefined
): 'default' | 'secondary' | 'outline' | 'destructive' {
  if (status === 'completed') return 'default'
  if (status === 'running') return 'secondary'
  if (status === 'failed') return 'destructive'
  return 'outline'
}

function ProgressEventsList({ events }: { events: Array<{ type: string; data: unknown }> }) {
  function format(e: { type: string; data: unknown }): {
    title: string
    detail?: string
    badge?: { text: string; variant?: 'default' | 'secondary' | 'outline' | 'destructive' }
  } {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const d: any = e.data

    if (e.type === 'stream.open') {
      return {
        title: 'Live stream connected',
        detail: `runId: ${d?.runId ?? ''}`,
        badge: { text: 'SSE', variant: 'outline' },
      }
    }

    if (e.type === 'run.snapshot') {
      return {
        title: 'Run status snapshot',
        detail: `status: ${d?.status ?? 'unknown'}`,
        badge: { text: 'snapshot', variant: 'secondary' },
      }
    }

    if (e.type === 'run.started') {
      return { title: 'Run started', badge: { text: 'running', variant: 'default' } }
    }

    if (e.type === 'plan.progress') {
      const stage = d?.stage ? String(d.stage) : 'progress'
      const message = d?.message ? String(d.message) : ''
      return {
        title: message || 'In progress…',
        detail: stage !== 'progress' ? `stage: ${stage}` : undefined,
        badge: { text: stage, variant: 'outline' },
      }
    }

    if (e.type === 'idea.scored') {
      const ideaId = d?.ideaId ? String(d.ideaId) : ''
      const overall = typeof d?.overall === 'number' ? Math.round(d.overall) : null
      return {
        title: 'Idea scored',
        detail: `${ideaId ? `ideaId: ${ideaId.slice(0, 8)}…` : ''}${overall != null ? ` · overall: ${overall}` : ''}`,
        badge: { text: 'score', variant: 'secondary' },
      }
    }

    if (e.type === 'run.completed') {
      return { title: 'Run completed', badge: { text: 'completed', variant: 'default' } }
    }

    if (e.type === 'run.failed') {
      return {
        title: 'Run failed',
        detail: d?.message ? String(d.message) : undefined,
        badge: { text: d?.errorType ? String(d.errorType) : 'failed', variant: 'destructive' },
      }
    }

    // Fallback (kept for debugging)
    return {
      title: e.type === 'unknown' ? 'Other event' : e.type,
      detail:
        e.data == null
          ? undefined
          : typeof e.data === 'string'
            ? e.data
            : JSON.stringify(e.data, null, 2),
      badge: { text: 'debug', variant: 'outline' },
    }
  }

  return (
    <div className="space-y-2 text-xs">
      {events.map((e, idx) => {
        const f = format(e)
        return (
          <div key={idx} className="rounded-md border p-2">
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-1">
                <div className="font-medium">{f.title}</div>
                {f.detail ? (
                  <pre className="whitespace-pre-wrap text-muted-foreground">{f.detail}</pre>
                ) : null}
              </div>
              {f.badge ? (
                <Badge variant={f.badge.variant ?? 'default'} className="shrink-0">
                  {f.badge.text}
                </Badge>
              ) : null}
            </div>
          </div>
        )
      })}
    </div>
  )
}
