import { useEffect, useMemo, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import remarkGfm from 'remark-gfm'
import { toast } from 'sonner'

import { useArtifactsLatest, useArtifactsList } from '@/entities/artifact/api/artifacts.queries'
import type { Artifact, ArtifactType, VersionsByType } from '@/entities/artifact/types/artifact'
import { useRuns } from '@/entities/run/api/runs.queries'
import { useToastQueryError } from '@/shared/hooks/useToastQueryError'
import { copyToClipboard } from '@/shared/lib/clipboard'
import { downloadTextFile } from '@/shared/lib/download'
import { getArtifactsLastRunId, setArtifactsLastRunId } from '@/shared/lib/storage'
import { Button } from '@/shared/ui/button'
import { Card } from '@/shared/ui/card'
import { ErrorState } from '@/shared/ui/error-state'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'
import { Separator } from '@/shared/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs'

function groupByType(artifacts: Artifact[]): VersionsByType {
  return artifacts.reduce(
    (acc, a) => {
      acc[a.type].push(a)
      return acc
    },
    { plan_30_60_90: [] as Artifact[], experiment_card: [] as Artifact[] }
  )
}

function ArtifactMarkdown({
  title,
  md,
  projectId,
  variant = 'default',
}: {
  title: string
  md: string
  projectId: string
  variant?: 'default' | 'latest' | 'selected'
}) {
  const border =
    variant === 'latest'
      ? 'border-primary/40'
      : variant === 'selected'
        ? 'border-ring'
        : 'border-border'

  const decorated = useMemo(() => linkifySourcesMarkdown(md, projectId), [md, projectId])

  return (
    <Card className={`p-4 border ${border}`}>
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="text-sm font-semibold">{title}</div>
          {variant === 'latest' ? (
            <span className="rounded bg-primary/10 px-2 py-0.5 text-xs text-primary">Latest</span>
          ) : variant === 'selected' ? (
            <span className="rounded bg-muted px-2 py-0.5 text-xs">Selected</span>
          ) : null}
        </div>
        <Separator />
        <article className="prose prose-zinc max-w-none dark:prose-invert">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              a: ({ href, children }) => {
                const h = href ?? ''
                if (h.startsWith('/projects/')) {
                  return (
                    <Link to={h} className="underline underline-offset-4">
                      {children}
                    </Link>
                  )
                }
                return (
                  <a
                    href={h}
                    className="underline underline-offset-4"
                    target="_blank"
                    rel="noreferrer"
                  >
                    {children}
                  </a>
                )
              },
            }}
          >
            {decorated}
          </ReactMarkdown>
        </article>
      </div>
    </Card>
  )
}

const uuidRegex =
  /([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)/

function linkifySourcesMarkdown(md: string, projectId: string) {
  const marker = '\n## Sources\n'
  const idx = md.indexOf(marker)
  if (idx === -1) return md

  const head = md.slice(0, idx + marker.length)
  const tail = md.slice(idx + marker.length)

  const lines = tail.split('\n')
  const mapped = lines.map(line => {
    if (!line.startsWith('- [C')) return line
    const match = uuidRegex.exec(line)
    if (!match) return line
    const chunkId = match[1]
    const href = `/projects/${projectId}/playbook?chunkId=${chunkId}`
    return line.replace(chunkId, `[${chunkId}](${href})`)
  })

  return head + mapped.join('\n')
}

function VersionsList({
  artifacts,
  selectedId,
  latestId,
  onSelect,
}: {
  artifacts: Artifact[]
  selectedId: string | null
  latestId: string | null
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
        const isSelected = a.id === selectedId
        const isLatest = a.id === latestId

        const classes = [
          'w-full rounded-md border p-3 text-left hover:bg-muted transition-colors',
          isSelected ? 'border-ring' : '',
          !isSelected && isLatest ? 'border-primary/40' : '',
        ]
          .filter(Boolean)
          .join(' ')

        return (
          <button type="button" key={a.id} className={classes} onClick={() => onSelect(a.id)}>
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="text-sm font-medium">
                    {a.type === 'plan_30_60_90' ? 'Plan' : 'Experiment Card'}
                  </div>
                  {isLatest ? (
                    <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] text-primary">
                      Latest
                    </span>
                  ) : null}
                  {isSelected ? (
                    <span className="rounded bg-muted px-1.5 py-0.5 text-[10px]">Selected</span>
                  ) : null}
                </div>
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
  const pid = projectId ?? ''

  const [searchParams, setSearchParams] = useSearchParams()
  const urlRunId = searchParams.get('runId') ?? ''

  const [runId, setRunId] = useState<string>(urlRunId)
  const [selectedVersionByType, setSelectedVersionByType] = useState<
    Record<ArtifactType, string | null>
  >({
    plan_30_60_90: null,
    experiment_card: null,
  })

  const runsQuery = useRuns(pid)
  useToastQueryError(runsQuery.isError, runsQuery.error, 'Failed to load runs.')
  const runs = useMemo(() => {
    return (runsQuery.data?.runs ?? [])
      .slice()
      .sort((a, b) => (a.created_at < b.created_at ? 1 : -1))
  }, [runsQuery.data?.runs])

  const latestQuery = useArtifactsLatest(pid, runId, Boolean(pid && runId))
  const listQuery = useArtifactsList(pid, runId, Boolean(pid && runId))
  useToastQueryError(latestQuery.isError, latestQuery.error, 'Failed to load latest artifacts.')
  useToastQueryError(listQuery.isError, listQuery.error, 'Failed to load artifact versions.')

  // If URL changes externally, sync state.
  useEffect(() => {
    if (!pid) return
    if (!urlRunId) return
    if (urlRunId === runId) return
    setRunId(urlRunId)
    setSelectedVersionByType({ plan_30_60_90: null, experiment_card: null })
    setArtifactsLastRunId(pid, urlRunId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pid, urlRunId])

  // Auto-select: URL -> localStorage -> latest run.
  useEffect(() => {
    if (!pid) return
    if (runId) return
    if (runsQuery.isLoading) return
    if (runs.length === 0) return

    const stored = getArtifactsLastRunId(pid)
    const candidate = stored && runs.some(r => r.id === stored) ? stored : runs[0].id
    setRunId(candidate)
    setArtifactsLastRunId(pid, candidate)
    setSearchParams(
      prev => {
        const next = new URLSearchParams(prev)
        next.set('runId', candidate)
        return next
      },
      { replace: true }
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pid, runId, runsQuery.isLoading, runs])

  function onPickRun(value: string) {
    setRunId(value)
    setSelectedVersionByType({ plan_30_60_90: null, experiment_card: null })
    if (pid) setArtifactsLastRunId(pid, value)

    setSearchParams(
      prev => {
        const next = new URLSearchParams(prev)
        next.set('runId', value)
        return next
      },
      { replace: true }
    )
  }

  function onSelectVersion(type: ArtifactType, id: string) {
    setSelectedVersionByType(prev => ({ ...prev, [type]: id }))
  }

  async function onCopy(md?: string | null) {
    if (!md) return
    try {
      await copyToClipboard(md)
      toast.success('Copied')
    } catch (e) {
      toast.error('Copy failed')
      console.error(e)
    }
  }

  function onExport(filename: string, md?: string | null) {
    if (!md) return
    try {
      downloadTextFile(filename, md, 'text/markdown')
      toast.success('Downloaded')
    } catch (e) {
      toast.error('Download failed')
      console.error(e)
    }
  }

  function buildBundleMd(input: {
    title: string
    plan?: { md: string } | null
    card?: { md: string } | null
  }) {
    const parts: string[] = [`# ${input.title}`]
    if (input.plan) parts.push(`\n\n## 30-60-90 Plan\n\n${input.plan.md}`)
    if (input.card) parts.push(`\n\n---\n\n## Experiment Card\n\n${input.card.md}`)
    return parts.join('')
  }

  const latestPlan = latestQuery.data?.artifacts?.plan ?? null
  const latestCard = latestQuery.data?.artifacts?.experimentCard ?? null

  const byType: VersionsByType = useMemo(() => {
    const artifacts = listQuery.data?.artifacts ?? []
    const serverByType = listQuery.data?.byType
    if (serverByType) return serverByType as VersionsByType
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

  const latestError =
    latestQuery.error instanceof Error
      ? latestQuery.error.message
      : 'Failed to load latest artifacts'
  const listError =
    listQuery.error instanceof Error ? listQuery.error.message : 'Failed to load versions'

  const latestPlanId = latestPlan?.id ?? null
  const latestCardId = latestCard?.id ?? null

  return (
    <div className="space-y-4">
      {!pid ? (
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Missing projectId.</p>
        </Card>
      ) : (
        <Card className="p-4">
          <div className="space-y-3">
            <div>
              <h2 className="text-base font-semibold">Artifacts</h2>
              <p className="text-sm text-muted-foreground">
                View latest artifacts and compare them with any historical version.
              </p>
            </div>

            <Separator />

            <div className="flex flex-wrap items-end gap-3">
              <div className="w-full md:w-96 flex-grow">
                <div className="mb-1 text-sm font-medium">Run</div>
                <Select value={runId} onValueChange={onPickRun} disabled={!pid}>
                  <SelectTrigger>
                    <SelectValue
                      placeholder={runsQuery.isLoading ? 'Loading runs…' : 'Select a run'}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {runs.map(r => (
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
      )}

      {pid && runsQuery.isError ? (
        <ErrorState
          title="Failed to load runs"
          message={
            runsQuery.error instanceof Error ? runsQuery.error.message : 'Failed to load runs.'
          }
          onRetry={() => void runsQuery.refetch()}
          isRetrying={runsQuery.isFetching}
        />
      ) : null}

      {!pid || !runId ? (
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">
            {pid ? 'Select a run to view artifacts.' : 'Select a project to view artifacts.'}
          </p>
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
            {latestQuery.isLoading ? (
              <div className="grid gap-4 md:grid-cols-2">
                <div className="h-72 animate-pulse rounded-md bg-muted" />
                <div className="h-72 animate-pulse rounded-md bg-muted" />
              </div>
            ) : latestQuery.isError ? (
              <ErrorState
                title="Failed to load latest artifacts"
                message={latestError}
                onRetry={() => void latestQuery.refetch()}
                isRetrying={latestQuery.isFetching}
              />
            ) : (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="text-sm font-semibold">Export / Copy</div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        void onCopy(
                          buildBundleMd({
                            title: `Artifacts — run ${runId}`,
                            plan: latestPlan ? { md: latestPlan.content_markdown } : null,
                            card: latestCard ? { md: latestCard.content_markdown } : null,
                          })
                        )
                      }
                      disabled={!latestPlan && !latestCard}
                    >
                      Copy all
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        onExport(
                          `artifacts-${runId}-latest.md`,
                          buildBundleMd({
                            title: `Artifacts — run ${runId}`,
                            plan: latestPlan ? { md: latestPlan.content_markdown } : null,
                            card: latestCard ? { md: latestCard.content_markdown } : null,
                          })
                        )
                      }
                      disabled={!latestPlan && !latestCard}
                    >
                      Export all
                    </Button>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold">30-60-90 Plan</div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => void onCopy(latestPlan?.content_markdown ?? null)}
                        disabled={!latestPlan}
                      >
                        Copy
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          onExport(
                            `artifact-plan-${runId}-${latestPlan?.id ?? 'latest'}.md`,
                            latestPlan?.content_markdown ?? null
                          )
                        }
                        disabled={!latestPlan}
                      >
                        Export
                      </Button>
                    </div>
                  </div>
                  {latestPlan ? (
                    <ArtifactMarkdown
                      title="Latest plan"
                      md={latestPlan.content_markdown}
                      projectId={pid}
                      variant="latest"
                    />
                  ) : (
                    <Card className="p-4">
                      <p className="text-sm text-muted-foreground">No plan artifact yet.</p>
                    </Card>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold">Experiment Card</div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => void onCopy(latestCard?.content_markdown ?? null)}
                        disabled={!latestCard}
                      >
                        Copy
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          onExport(
                            `artifact-experiment-card-${runId}-${latestCard?.id ?? 'latest'}.md`,
                            latestCard?.content_markdown ?? null
                          )
                        }
                        disabled={!latestCard}
                      >
                        Export
                      </Button>
                    </div>
                  </div>
                  {latestCard ? (
                    <ArtifactMarkdown
                      title="Latest experiment card"
                      md={latestCard.content_markdown}
                      projectId={pid}
                      variant="latest"
                    />
                  ) : (
                    <Card className="p-4">
                      <p className="text-sm text-muted-foreground">No experiment card yet.</p>
                    </Card>
                  )}
                </div>
              </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="versions" className="space-y-4">
            {listQuery.isLoading ? (
              <div className="grid gap-4 md:grid-cols-2">
                <div className="h-64 animate-pulse rounded-md bg-muted" />
                <div className="h-64 animate-pulse rounded-md bg-muted" />
              </div>
            ) : listQuery.isError ? (
              <ErrorState
                title="Failed to load artifact versions"
                message={listError}
                onRetry={() => void listQuery.refetch()}
                isRetrying={listQuery.isFetching}
              />
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                <Card className="p-4">
                  <div className="space-y-3">
                    <div className="text-sm font-semibold">Plan versions</div>
                    <Separator />
                    <VersionsList
                      artifacts={byType.plan_30_60_90}
                      selectedId={selectedVersionByType.plan_30_60_90}
                      latestId={latestPlanId}
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
                      latestId={latestCardId}
                      onSelect={id => onSelectVersion('experiment_card', id)}
                    />
                  </div>
                </Card>
              </div>
            )}

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold">Latest vs Selected</div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        void onCopy(
                          buildBundleMd({
                            title: `Artifacts (selected) — run ${runId}`,
                            plan: selectedPlan ? { md: selectedPlan.content_markdown } : null,
                            card: selectedCard ? { md: selectedCard.content_markdown } : null,
                          })
                        )
                      }
                      disabled={!selectedPlan && !selectedCard}
                    >
                      Copy selected
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        onExport(
                          `artifacts-${runId}-selected.md`,
                          buildBundleMd({
                            title: `Artifacts (selected) — run ${runId}`,
                            plan: selectedPlan ? { md: selectedPlan.content_markdown } : null,
                            card: selectedCard ? { md: selectedCard.content_markdown } : null,
                          })
                        )
                      }
                      disabled={!selectedPlan && !selectedCard}
                    >
                      Export selected
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setSelectedVersionByType({ plan_30_60_90: null, experiment_card: null })
                      }
                      disabled={!selectedPlan && !selectedCard}
                    >
                      Clear selection
                    </Button>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-semibold">Plan</div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => void onCopy(selectedPlan?.content_markdown ?? null)}
                          disabled={!selectedPlan}
                        >
                          Copy
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            onExport(
                              `artifact-plan-${runId}-${selectedPlan?.id ?? 'selected'}.md`,
                              selectedPlan?.content_markdown ?? null
                            )
                          }
                          disabled={!selectedPlan}
                        >
                          Export
                        </Button>
                      </div>
                    </div>
                  {latestPlan ? (
                    <ArtifactMarkdown
                      title="Latest"
                      md={latestPlan.content_markdown}
                      projectId={pid}
                      variant="latest"
                    />
                  ) : (
                    <Card className="p-4">
                      <p className="text-sm text-muted-foreground">No latest plan yet.</p>
                    </Card>
                  )}
                  {selectedPlan ? (
                    <ArtifactMarkdown
                      title="Selected"
                      md={selectedPlan.content_markdown}
                      projectId={pid}
                      variant="selected"
                    />
                  ) : (
                    <Card className="p-4">
                      <p className="text-sm text-muted-foreground">
                        Select a plan version to compare.
                      </p>
                    </Card>
                  )}
                </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-semibold">Experiment Card</div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => void onCopy(selectedCard?.content_markdown ?? null)}
                          disabled={!selectedCard}
                        >
                          Copy
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            onExport(
                              `artifact-experiment-card-${runId}-${selectedCard?.id ?? 'selected'}.md`,
                              selectedCard?.content_markdown ?? null
                            )
                          }
                          disabled={!selectedCard}
                        >
                          Export
                        </Button>
                      </div>
                    </div>
                  {latestCard ? (
                    <ArtifactMarkdown
                      title="Latest"
                      md={latestCard.content_markdown}
                      projectId={pid}
                      variant="latest"
                    />
                  ) : (
                    <Card className="p-4">
                      <p className="text-sm text-muted-foreground">No latest card yet.</p>
                    </Card>
                  )}
                  {selectedCard ? (
                    <ArtifactMarkdown
                      title="Selected"
                      md={selectedCard.content_markdown}
                      projectId={pid}
                      variant="selected"
                    />
                  ) : (
                    <Card className="p-4">
                      <p className="text-sm text-muted-foreground">
                        Select a card version to compare.
                      </p>
                    </Card>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
