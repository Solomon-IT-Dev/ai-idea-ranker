/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { useParams } from 'react-router-dom'
import remarkGfm from 'remark-gfm'
import { toast } from 'sonner'

import { useArtifactsLatest, useArtifactsList } from '@/entities/artifact/api/artifacts.queries'
import type { Artifact, ArtifactType } from '@/entities/artifact/types/artifact'
import { useRuns } from '@/entities/run/api/runs.queries'
import { Button } from '@/shared/ui/button'
import { Card } from '@/shared/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'
import { Separator } from '@/shared/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs'

function groupByType(artifacts: Artifact[]) {
  return artifacts.reduce(
    (acc, a) => {
      acc[a.type].push(a)
      return acc
    },
    { plan_30_60_90: [] as Artifact[], experiment_card: [] as Artifact[] }
  )
}

function ArtifactMarkdown({ title, md }: { title: string; md: string }) {
  return (
    <Card className="p-4">
      <div className="space-y-3">
        <div className="text-sm font-semibold">{title}</div>
        <Separator />
        <article className="prose prose-zinc max-w-none dark:prose-invert">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{md}</ReactMarkdown>
        </article>
      </div>
    </Card>
  )
}

function VersionsList({
  artifacts,
  selectedId,
  onSelect,
}: {
  artifacts: Artifact[]
  selectedId: string | null
  onSelect: (id: string) => void
}) {
  const sorted = useMemo(
    () => [...artifacts].sort((a, b) => (a.created_at < b.created_at ? 1 : -1)),
    [artifacts]
  )

  if (sorted.length === 0) {
    return <p className="text-sm text-muted-foreground">No versions yet.</p>
  }

  return (
    <div className="space-y-2">
      {sorted.map(a => {
        const active = a.id === selectedId
        return (
          <button
            key={a.id}
            className={[
              'w-full rounded-md border p-3 text-left hover:bg-muted',
              active ? 'border-primary' : '',
            ].join(' ')}
            onClick={() => onSelect(a.id)}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="text-sm font-medium">{a.type}</div>
                <div className="text-xs text-muted-foreground">
                  {new Date(a.created_at).toLocaleString()}
                </div>
              </div>
              <div className="text-xs text-muted-foreground">{a.id.slice(0, 8)}…</div>
            </div>
          </button>
        )
      })}
    </div>
  )
}

export function ProjectArtifactsTab() {
  const { projectId } = useParams()
  const [runId, setRunId] = useState<string>('')
  const [selectedVersionByType, setSelectedVersionByType] = useState<
    Record<ArtifactType, string | null>
  >({
    plan_30_60_90: null,
    experiment_card: null,
  })

  if (!projectId) {
    return (
      <Card className="p-4">
        <p className="text-sm text-muted-foreground">Missing projectId.</p>
      </Card>
    )
  }

  // Runs list for selector
  const runsQuery = useRuns(projectId)

  const latestQuery = useArtifactsLatest(projectId, runId, Boolean(runId))
  const listQuery = useArtifactsList(projectId, runId, Boolean(runId))

  const byType = useMemo(() => {
    const artifacts = listQuery.data?.artifacts ?? []
    const serverByType = listQuery.data?.byType
    if (serverByType) return serverByType
    return groupByType(artifacts)
  }, [listQuery.data])

  const selectedPlan = useMemo(() => {
    const id = selectedVersionByType.plan_30_60_90
    if (!id) return null
    return byType.plan_30_60_90.find(a => a.id === id) ?? null
  }, [byType.plan_30_60_90, selectedVersionByType.plan_30_60_90])

  const selectedCard = useMemo(() => {
    const id = selectedVersionByType.experiment_card
    if (!id) return null
    return byType.experiment_card.find(a => a.id === id) ?? null
  }, [byType.experiment_card, selectedVersionByType.experiment_card])

  const latestPlan = latestQuery.data?.artifacts?.plan ?? null
  const latestCard = latestQuery.data?.artifacts?.experimentCard ?? null

  function onPickRun(value: string) {
    setRunId(value)
    // Reset selected versions when switching run
    setSelectedVersionByType({ plan_30_60_90: null, experiment_card: null })
  }

  function onSelectVersion(type: ArtifactType, id: string) {
    setSelectedVersionByType(prev => ({ ...prev, [type]: id }))
  }

  function onCopy(md?: string | null) {
    if (!md) return
    navigator.clipboard
      .writeText(md)
      .then(() => toast.success('Copied'))
      .catch(() => toast.error('Copy failed'))
  }

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="space-y-3">
          <div>
            <h2 className="text-base font-semibold">Artifacts</h2>
            <p className="text-sm text-muted-foreground">
              View latest artifacts and all historical versions for a run.
            </p>
          </div>

          <Separator />

          <div className="flex flex-wrap items-end gap-3">
            <div className="w-full md:w-96 md:flex-1">
              <div className="text-sm font-medium mb-1">Run</div>
              <Select value={runId} onValueChange={onPickRun}>
                <SelectTrigger>
                  <SelectValue
                    placeholder={runsQuery.isLoading ? 'Loading runs…' : 'Select a run'}
                  />
                </SelectTrigger>
                <SelectContent>
                  {(runsQuery.data?.runs ?? [])
                    .slice()
                    .sort((a, b) => (a.created_at < b.created_at ? 1 : -1))
                    .map(r => (
                      <SelectItem key={r.id} value={r.id}>
                        {new Date(r.created_at).toLocaleString()} · {r.status} · {r.id.slice(0, 8)}…
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              variant="outline"
              onClick={() => {
                void latestQuery.refetch()
                void listQuery.refetch()
              }}
              disabled={!runId}
            >
              Refresh
            </Button>
          </div>
        </div>
      </Card>

      {!runId ? (
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Select a run to view artifacts.</p>
        </Card>
      ) : (
        <Tabs defaultValue="latest">
          <Card className="p-3">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="latest">Latest</TabsTrigger>
              <TabsTrigger value="versions">Versions</TabsTrigger>
            </TabsList>
          </Card>

          <TabsContent value="latest" className="space-y-4">
            {latestQuery.isLoading && (
              <Card className="p-4">
                <p className="text-sm text-muted-foreground">Loading latest…</p>
              </Card>
            )}

            {latestQuery.isError && (
              <Card className="p-4">
                <p className="text-sm text-destructive">
                  {(latestQuery.error as any)?.message ?? 'Failed to load latest artifacts'}
                </p>
              </Card>
            )}

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold">30-60-90 Plan</div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onCopy(latestPlan?.content_markdown ?? null)}
                    disabled={!latestPlan}
                  >
                    Copy
                  </Button>
                </div>
                {latestPlan ? (
                  <ArtifactMarkdown title="Latest plan" md={latestPlan.content_markdown} />
                ) : (
                  <Card className="p-4">
                    <p className="text-sm text-muted-foreground">No plan artifact yet.</p>
                  </Card>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold">Experiment Card</div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onCopy(latestCard?.content_markdown ?? null)}
                    disabled={!latestCard}
                  >
                    Copy
                  </Button>
                </div>
                {latestCard ? (
                  <ArtifactMarkdown
                    title="Latest experiment card"
                    md={latestCard.content_markdown}
                  />
                ) : (
                  <Card className="p-4">
                    <p className="text-sm text-muted-foreground">No experiment card yet.</p>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="versions" className="space-y-4">
            {listQuery.isLoading && (
              <Card className="p-4">
                <p className="text-sm text-muted-foreground">Loading versions…</p>
              </Card>
            )}

            {listQuery.isError && (
              <Card className="p-4">
                <p className="text-sm text-destructive">
                  {(listQuery.error as any)?.message ?? 'Failed to load versions'}
                </p>
              </Card>
            )}

            {!listQuery.isLoading && !listQuery.isError && (
              <div className="grid gap-4 md:grid-cols-2">
                <Card className="p-4">
                  <div className="space-y-3">
                    <div className="text-sm font-semibold">Plan versions</div>
                    <Separator />
                    <VersionsList
                      artifacts={byType.plan_30_60_90}
                      selectedId={selectedVersionByType.plan_30_60_90}
                      onSelect={id => onSelectVersion('plan_30_60_90', id)}
                    />
                  </div>
                </Card>

                <Card className="p-4">
                  <div className="space-y-3">
                    <div className="text-sm font-semibold">Experiment Card versions</div>
                    <Separator />
                    <VersionsList
                      artifacts={byType.experiment_card}
                      selectedId={selectedVersionByType.experiment_card}
                      onSelect={id => onSelectVersion('experiment_card', id)}
                    />
                  </div>
                </Card>
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold">Selected plan</div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onCopy(selectedPlan?.content_markdown ?? null)}
                    disabled={!selectedPlan}
                  >
                    Copy
                  </Button>
                </div>
                {selectedPlan ? (
                  <ArtifactMarkdown
                    title={`Plan version — ${selectedPlan.id.slice(0, 8)}…`}
                    md={selectedPlan.content_markdown}
                  />
                ) : (
                  <Card className="p-4">
                    <p className="text-sm text-muted-foreground">
                      Select a plan version to preview.
                    </p>
                  </Card>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold">Selected experiment card</div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onCopy(selectedCard?.content_markdown ?? null)}
                    disabled={!selectedCard}
                  >
                    Copy
                  </Button>
                </div>
                {selectedCard ? (
                  <ArtifactMarkdown
                    title={`Experiment card version — ${selectedCard.id.slice(0, 8)}…`}
                    md={selectedCard.content_markdown}
                  />
                ) : (
                  <Card className="p-4">
                    <p className="text-sm text-muted-foreground">
                      Select an experiment card version to preview.
                    </p>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
