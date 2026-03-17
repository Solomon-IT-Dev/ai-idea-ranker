import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'

import { useArtifactsLatest, useArtifactsList } from '@/entities/artifact/api/artifacts.queries'
import { groupArtifactsByType } from '@/entities/artifact/lib/artifactGrouping'
import type { Artifact, ArtifactType, VersionsByType } from '@/entities/artifact/types/artifact'
import { useRuns } from '@/entities/run/api/runs.queries'
import { useToastQueryError } from '@/shared/hooks/useToastQueryError'
import { copyToClipboard } from '@/shared/lib/clipboard'
import { downloadTextFile } from '@/shared/lib/download'
import { getArtifactsLastRunId, setArtifactsLastRunId } from '@/shared/lib/storage'

export function useProjectArtifactsController(projectId: string) {
  const [searchParams, setSearchParams] = useSearchParams()
  const urlRunId = searchParams.get('runId') ?? ''

  const [runId, setRunId] = useState<string>(urlRunId)
  const [selectedVersionByType, setSelectedVersionByType] = useState<
    Record<ArtifactType, string | null>
  >({
    plan_30_60_90: null,
    experiment_card: null,
  })

  const runsQuery = useRuns(projectId)
  useToastQueryError(runsQuery.isError, runsQuery.error, 'Failed to load runs.')

  const runs = useMemo(() => {
    return (runsQuery.data?.runs ?? [])
      .slice()
      .sort((a, b) => (a.created_at < b.created_at ? 1 : -1))
  }, [runsQuery.data?.runs])

  const latestQuery = useArtifactsLatest(projectId, runId, Boolean(projectId && runId))
  const listQuery = useArtifactsList(projectId, runId, Boolean(projectId && runId))
  useToastQueryError(latestQuery.isError, latestQuery.error, 'Failed to load latest artifacts.')
  useToastQueryError(listQuery.isError, listQuery.error, 'Failed to load artifact versions.')

  useEffect(() => {
    if (!projectId || !urlRunId || urlRunId === runId) return
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRunId(urlRunId)
    setSelectedVersionByType({ plan_30_60_90: null, experiment_card: null })
    setArtifactsLastRunId(projectId, urlRunId)
  }, [projectId, runId, urlRunId])

  useEffect(() => {
    if (!projectId || runId || runsQuery.isLoading || runs.length === 0) return

    const stored = getArtifactsLastRunId(projectId)
    const candidate = stored && runs.some(run => run.id === stored) ? stored : runs[0].id
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRunId(candidate)
    setArtifactsLastRunId(projectId, candidate)
    setSearchParams(
      prev => {
        const next = new URLSearchParams(prev)
        next.set('runId', candidate)
        return next
      },
      { replace: true }
    )
  }, [projectId, runId, runs, runsQuery.isLoading, setSearchParams])

  function pickRun(value: string) {
    setRunId(value)
    setSelectedVersionByType({ plan_30_60_90: null, experiment_card: null })
    if (projectId) setArtifactsLastRunId(projectId, value)

    setSearchParams(
      prev => {
        const next = new URLSearchParams(prev)
        next.set('runId', value)
        return next
      },
      { replace: true }
    )
  }

  function selectVersion(type: ArtifactType, id: string) {
    setSelectedVersionByType(prev => ({ ...prev, [type]: id }))
  }

  function clearSelectedVersions() {
    setSelectedVersionByType({
      plan_30_60_90: null,
      experiment_card: null,
    })
  }

  async function copyMarkdown(markdown?: string | null) {
    if (!markdown) return
    try {
      await copyToClipboard(markdown)
      toast.success('Copied')
    } catch {
      toast.error('Copy failed')
    }
  }

  function exportMarkdown(filename: string, markdown?: string | null) {
    if (!markdown) return
    try {
      downloadTextFile(filename, markdown, 'text/markdown')
      toast.success('Downloaded')
    } catch {
      toast.error('Download failed')
    }
  }

  const latestPlan = latestQuery.data?.artifacts?.plan ?? null
  const latestCard = latestQuery.data?.artifacts?.experimentCard ?? null
  const latestPlanId = latestPlan?.id ?? null
  const latestCardId = latestCard?.id ?? null

  const byType: VersionsByType = useMemo(() => {
    const artifacts = listQuery.data?.artifacts ?? []
    const serverByType = listQuery.data?.byType
    if (serverByType) return serverByType as VersionsByType
    return groupArtifactsByType(artifacts)
  }, [listQuery.data])

  const selectedPlan = useMemo(() => {
    const id = selectedVersionByType.plan_30_60_90
    if (!id) return null
    return byType.plan_30_60_90.find(artifact => artifact.id === id) ?? null
  }, [byType.plan_30_60_90, selectedVersionByType.plan_30_60_90])

  const selectedCard = useMemo(() => {
    const id = selectedVersionByType.experiment_card
    if (!id) return null
    return byType.experiment_card.find(artifact => artifact.id === id) ?? null
  }, [byType.experiment_card, selectedVersionByType.experiment_card])

  const latestError =
    latestQuery.error instanceof Error
      ? latestQuery.error.message
      : 'Failed to load latest artifacts'
  const listError =
    listQuery.error instanceof Error ? listQuery.error.message : 'Failed to load versions'

  return {
    runId,
    runsQuery,
    runs,
    latestQuery,
    listQuery,
    latestError,
    listError,
    byType,
    latestPlan,
    latestCard,
    latestPlanId,
    latestCardId,
    selectedVersionByType,
    selectedPlan,
    selectedCard,
    pickRun,
    selectVersion,
    clearSelectedVersions,
    copyMarkdown,
    exportMarkdown,
    refreshArtifacts: async () => {
      await Promise.all([latestQuery.refetch(), listQuery.refetch()])
    },
  }
}

export type ProjectArtifactsController = ReturnType<typeof useProjectArtifactsController>

export type ArtifactPair = {
  plan?: Artifact | null
  card?: Artifact | null
}
