import { useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'

import { getLatestArtifacts, listArtifacts } from '@/entities/artifact/api/artifacts.api'
import {
  artifactKeys,
  useGenerateArtifactsMutation,
} from '@/entities/artifact/api/artifacts.queries'
import { runKeys, useRun } from '@/entities/run/api/runs.queries'
import { useRunStream } from '@/features/runStream/model/runStream.hooks'

export type ArtifactsPlanProgressItem = {
  stage?: string
  message?: string
  at: number
}

export function useRunDetailsController(projectId: string, runId: string) {
  const qc = useQueryClient()

  const runQuery = useRun(projectId, runId)
  const { data: runData } = runQuery
  const run = runData?.run
  const status = run?.status

  const [isStreamEnabled, setIsStreamEnabled] = useState(true)
  const [planProgress, setPlanProgress] = useState<ArtifactsPlanProgressItem[]>([])
  const [isGeneratingArtifacts, setIsGeneratingArtifacts] = useState(false)

  useEffect(() => {
    setIsStreamEnabled(true)
    setPlanProgress([])
    setIsGeneratingArtifacts(false)
  }, [projectId, runId])

  const prefetchArtifacts = useCallback(async () => {
    if (!projectId || !runId) return

    await Promise.all([
      qc.prefetchQuery({
        queryKey: artifactKeys.latest(projectId, runId),
        queryFn: () => getLatestArtifacts({ projectId, runId }),
      }),
      qc.prefetchQuery({
        queryKey: artifactKeys.list(projectId, runId),
        queryFn: () => listArtifacts({ projectId, runId }),
      }),
    ])
  }, [projectId, qc, runId])

  const shouldStream =
    isStreamEnabled &&
    Boolean(runId) &&
    (status === 'running' || status === undefined || isGeneratingArtifacts)

  const stream = useRunStream({
    projectId,
    runId,
    enabled: shouldStream,
    stopOnTerminal: !isGeneratingArtifacts,
  })

  useEffect(() => {
    const eventType = stream.lastEvent?.type
    if (eventType === 'run.completed' || eventType === 'run.failed') {
      void runQuery.refetch()
      if (projectId) void qc.invalidateQueries({ queryKey: runKeys.all(projectId) })

      if (eventType === 'run.failed') {
        toast.error(
          isGeneratingArtifacts
            ? 'Artifacts generation failed. See details above.'
            : 'Run failed. See details above.'
        )
      }
    }
  }, [stream.lastEvent?.type, isGeneratingArtifacts, runQuery, projectId, qc])

  useEffect(() => {
    const event = stream.lastEvent
    if (!event || event.type !== 'plan.progress') return

    const payload = event.data as { stage?: unknown; message?: unknown }
    const stage = typeof payload.stage === 'string' ? payload.stage : ''
    const message = typeof payload.message === 'string' ? payload.message : undefined

    // Only keep artifacts-related progress in this panel.
    if (!stage.startsWith('artifacts.')) return

    setPlanProgress(prev => [...prev, { stage, message, at: Date.now() }])

    if (stage === 'artifacts.openai') toast.message('Generating artifacts…')
    if (stage === 'artifacts.render') toast.message('Formatting artifacts…')
    if (stage === 'artifacts.persist') toast.message('Saving artifacts…')
    if (stage === 'artifacts.done') void prefetchArtifacts()
  }, [prefetchArtifacts, stream.lastEvent])

  const generateArtifactsMutation = useGenerateArtifactsMutation()

  const scores = useMemo(() => {
    const entries = runData?.top ?? runData?.scores ?? []
    return [...entries].sort((left, right) => right.overall - left.overall)
  }, [runData])

  async function generateArtifacts() {
    if (!projectId || !runId) return

    if (run?.status !== 'completed') {
      toast.error('Artifacts can be generated after the run is completed.')
      return
    }

    setIsStreamEnabled(true)
    setIsGeneratingArtifacts(true)
    setPlanProgress([])

    try {
      await generateArtifactsMutation.mutateAsync({ projectId, runId, topN: 3 })
      await prefetchArtifacts()
      toast.success('Artifacts generated.')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to generate artifacts.'
      toast.error(message)
    } finally {
      setIsGeneratingArtifacts(false)
    }
  }

  function stopLiveUpdates() {
    setIsStreamEnabled(false)
    stream.stop()
    toast.message('Live updates paused. The run continues on the server.')
  }

  function clearPlanProgress() {
    setPlanProgress([])
  }

  return {
    runQuery,
    run,
    status,
    scores,
    stream,
    shouldStream,
    planProgress,
    isGeneratingArtifacts,
    generateArtifactsMutation,
    generateArtifacts,
    stopLiveUpdates,
    clearPlanProgress,
  }
}
