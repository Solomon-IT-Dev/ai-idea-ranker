import { fetchEventSource } from '@microsoft/fetch-event-source'
import { useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'

import { routes } from '@/entities/run/api/runs.routes'
import { env } from '@/shared/lib/env'
import { supabase } from '@/shared/lib/supabase'

import type { RunStreamEvent } from './runStream.types'

function safeParseJson(data: string) {
  try {
    return JSON.parse(data)
  } catch {
    return data
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapToTypedEvent(eventName: string, data: any): RunStreamEvent {
  const known = new Set([
    'stream.open',
    'run.snapshot',
    'run.started',
    'run.sources_ready',
    'idea.scored',
    'plan.progress',
    'run.completed',
    'run.failed',
  ])

  if (known.has(eventName)) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return { type: eventName as any, data }
  }
  return { type: 'unknown', data, eventName }
}

export function useRunStream(input: {
  projectId: string
  runId: string
  enabled: boolean
  stopOnTerminal?: boolean
}) {
  const [events, setEvents] = useState<RunStreamEvent[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [lastEvent, setLastEvent] = useState<RunStreamEvent | null>(null)

  const abortRef = useRef<AbortController | null>(null)
  const stopOnTerminal = input.stopOnTerminal ?? true

  const hasTerminal = useMemo(() => {
    return events.some(e => e.type === 'run.completed' || e.type === 'run.failed')
  }, [events])

  const terminalGate = stopOnTerminal ? hasTerminal : false

  useEffect(() => {
    if (!input.enabled || !input.projectId || !input.runId) return
    if (terminalGate) return

    const abort = new AbortController()
    abortRef.current = abort

    let stopped = false

    async function run() {
      const session = await supabase.auth.getSession()
      const token = session.data.session?.access_token
      if (!token) {
        toast.error('No auth session. Please sign in again.')
        return
      }

      const url = `${env.apiBaseUrl}${routes.streamRun(input.projectId, input.runId)}`

      try {
        await fetchEventSource(url, {
          signal: abort.signal,
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'text/event-stream',
          },
          onopen: async resp => {
            if (resp.ok) {
              setIsConnected(true)
              return
            }
            // If backend returns JSON error, fetchEventSource throws later — but we handle early.
            throw new Error(`SSE open failed: ${resp.status}`)
          },
          onmessage: msg => {
            if (stopped) return

            // Ignore keep-alive comments / empty frames.
            if (!msg.event && (!msg.data || msg.data.trim() === '')) {
              return
            }

            const eventName = msg.event || 'message'
            const parsed = safeParseJson(msg.data)

            // Some proxies/servers may emit empty "message" events; ignore them.
            if (eventName === 'message' && (parsed === '' || parsed == null)) {
              return
            }

            const e: RunStreamEvent = mapToTypedEvent(eventName, parsed)
            setEvents(prev => [...prev, e])
            setLastEvent(e)
          },
          onerror: err => {
            if (stopped) return
            setIsConnected(false)
            // Throw to stop auto-retry (we prefer explicit refresh)
            throw err
          },
          openWhenHidden: true,
        })
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        if (abort.signal.aborted) return
        setIsConnected(false)
        toast.error(err?.message ?? 'SSE connection error.')
      }
    }

    void run()

    return () => {
      stopped = true
      setIsConnected(false)
      abort.abort()
      abortRef.current = null
    }
  }, [terminalGate, input.enabled, input.projectId, input.runId])

  return {
    isConnected,
    events,
    lastEvent,
    stop: () => {
      setIsConnected(false)
      abortRef.current?.abort()
    },
  }
}
