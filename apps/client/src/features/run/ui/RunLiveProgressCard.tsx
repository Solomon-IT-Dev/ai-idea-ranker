import { getRunStatusLabel } from '@/entities/run/lib/runStatus'
import type { RunStreamEvent } from '@/features/runStream/model/runStream.types'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card } from '@/shared/ui/card'

type Props = {
  runStatus: string | undefined
  events: RunStreamEvent[]
  shouldStream: boolean
  isRefreshing: boolean
  onStopLiveUpdates: () => void
}

export function RunLiveProgressCard({
  runStatus,
  events,
  shouldStream,
  isRefreshing,
  onStopLiveUpdates,
}: Props) {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold">Live progress</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={onStopLiveUpdates}
          disabled={isRefreshing || !shouldStream}
        >
          Stop live updates
        </Button>
      </div>

      <div className="mt-3 max-h-64 overflow-auto rounded-md border p-3">
        {events.length === 0 ? (
          <div className="text-xs text-muted-foreground">
            {runStatus === 'running' && !shouldStream
              ? 'Live updates are paused. The run is still running on the server.'
              : runStatus === 'completed'
                ? 'Run completed. Live events are only shown while live updates are enabled.'
                : runStatus === 'failed'
                  ? 'Run failed. No live events available.'
                  : 'Waiting for the first event…'}
          </div>
        ) : (
          <ProgressEventsList events={events} />
        )}
      </div>
    </Card>
  )
}

function ProgressEventsList({ events }: { events: RunStreamEvent[] }) {
  function format(event: RunStreamEvent): {
    title: string
    detail?: string
    badge?: { text: string; variant?: 'default' | 'secondary' | 'outline' | 'destructive' }
  } {
    const payload = event.data as {
      runId?: string
      status?: string
      stage?: string
      message?: string
      ideaId?: string
      overall?: number
      errorType?: string
    }

    if (event.type === 'stream.open') {
      return {
        title: 'Live updates connected',
        detail: payload.runId ? `Run ID: ${String(payload.runId)}` : undefined,
        badge: { text: 'SSE', variant: 'outline' },
      }
    }

    if (event.type === 'run.snapshot') {
      return {
        title: 'Status update',
        detail: payload.status ? `Status: ${getRunStatusLabel(String(payload.status))}` : undefined,
        badge: { text: 'snapshot', variant: 'secondary' },
      }
    }

    if (event.type === 'run.started') {
      return { title: 'Run started', badge: { text: 'running', variant: 'default' } }
    }

    if (event.type === 'plan.progress') {
      const stage = payload.stage ? String(payload.stage) : 'progress'
      const message = payload.message ? String(payload.message) : ''

      return {
        title: message || 'In progress…',
        detail: stage !== 'progress' ? `Stage: ${stage}` : undefined,
        badge: { text: stage, variant: 'outline' },
      }
    }

    if (event.type === 'idea.scored') {
      const ideaId = payload.ideaId ? String(payload.ideaId) : ''
      const overall = typeof payload.overall === 'number' ? Math.round(payload.overall) : null
      return {
        title: 'Idea scored',
        detail: `${ideaId ? `Idea ID: ${ideaId.slice(0, 8)}…` : ''}${overall != null ? ` · Overall: ${overall}` : ''}`,
        badge: { text: 'score', variant: 'secondary' },
      }
    }

    if (event.type === 'run.completed') {
      return { title: 'Run completed', badge: { text: 'completed', variant: 'default' } }
    }

    if (event.type === 'run.failed') {
      return {
        title: 'Run failed',
        detail: payload.message ? String(payload.message) : undefined,
        badge: {
          text: payload.errorType ? String(payload.errorType) : 'failed',
          variant: 'destructive',
        },
      }
    }

    return {
      title: event.type === 'unknown' ? 'Other event' : event.type,
      detail:
        event.data == null
          ? undefined
          : typeof event.data === 'string'
            ? event.data
            : JSON.stringify(event.data, null, 2),
      badge: { text: 'debug', variant: 'outline' },
    }
  }

  return (
    <div className="space-y-2 text-xs">
      {events.map((event, idx) => {
        const formatted = format(event)

        return (
          <div key={idx} className="rounded-md border p-2">
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-1">
                <div className="font-medium">{formatted.title}</div>
                {formatted.detail ? (
                  <pre className="whitespace-pre-wrap text-muted-foreground">
                    {formatted.detail}
                  </pre>
                ) : null}
              </div>
              {formatted.badge ? (
                <Badge variant={formatted.badge.variant ?? 'default'} className="shrink-0">
                  {formatted.badge.text}
                </Badge>
              ) : null}
            </div>
          </div>
        )
      })}
    </div>
  )
}
