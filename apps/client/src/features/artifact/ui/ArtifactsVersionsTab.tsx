import { buildArtifactsBundleMarkdown } from '@/entities/artifact/lib/artifactExport'
import type { Artifact, VersionsByType } from '@/entities/artifact/types/artifact'
import { ArtifactActionsMenu } from '@/entities/artifact/ui/ArtifactActionsMenu'
import { ArtifactMarkdownCard } from '@/entities/artifact/ui/ArtifactMarkdownCard'
import { ArtifactVersionsList } from '@/entities/artifact/ui/ArtifactVersionsList'
import { Button } from '@/shared/ui/button'
import { Card } from '@/shared/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'
import { ErrorState } from '@/shared/ui/error-state'
import { Separator } from '@/shared/ui/separator'

type Props = {
  projectId: string
  runId: string
  byType: VersionsByType
  latestPlanId: string | null
  latestCardId: string | null
  latestPlan: Artifact | null
  latestCard: Artifact | null
  selectedPlan: Artifact | null
  selectedCard: Artifact | null
  selectedPlanId: string | null
  selectedCardId: string | null
  isListLoading: boolean
  isListError: boolean
  listError: string
  isListFetching: boolean
  isLatestLoading: boolean
  onRetryList: () => void
  onSelectPlan: (id: string) => void
  onSelectCard: (id: string) => void
  onClearSelection: () => void
  onCopy: (markdown?: string | null) => void
  onExport: (filename: string, markdown?: string | null) => void
}

export function ArtifactsVersionsTab({
  projectId,
  runId,
  byType,
  latestPlanId,
  latestCardId,
  latestPlan,
  latestCard,
  selectedPlan,
  selectedCard,
  selectedPlanId,
  selectedCardId,
  isListLoading,
  isListError,
  listError,
  isListFetching,
  isLatestLoading,
  onRetryList,
  onSelectPlan,
  onSelectCard,
  onClearSelection,
  onCopy,
  onExport,
}: Props) {
  if (isListLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        <div className="h-64 animate-pulse rounded-md bg-muted" />
        <div className="h-64 animate-pulse rounded-md bg-muted" />
      </div>
    )
  }

  if (isListError) {
    return (
      <ErrorState
        title="Failed to load artifact versions"
        message={listError}
        onRetry={onRetryList}
        isRetrying={isListFetching}
      />
    )
  }

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="space-y-3">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-1">
              <div className="text-sm font-semibold">Versions</div>
              <p className="text-sm text-muted-foreground">
                Select versions below to compare them with the latest.
              </p>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" disabled={!selectedPlan && !selectedCard}>
                  Selected actions
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Selected</DropdownMenuLabel>
                <DropdownMenuItem
                  disabled={!selectedPlan && !selectedCard}
                  onSelect={event => {
                    event.preventDefault()
                    onCopy(
                      buildArtifactsBundleMarkdown({
                        title: `Artifacts (selected) — run ${runId}`,
                        plan: selectedPlan ? { md: selectedPlan.content_markdown } : null,
                        card: selectedCard ? { md: selectedCard.content_markdown } : null,
                      })
                    )
                  }}
                >
                  Copy selected
                </DropdownMenuItem>
                <DropdownMenuItem
                  disabled={!selectedPlan && !selectedCard}
                  onSelect={event => {
                    event.preventDefault()
                    onExport(
                      `artifacts-${runId}-selected.md`,
                      buildArtifactsBundleMarkdown({
                        title: `Artifacts (selected) — run ${runId}`,
                        plan: selectedPlan ? { md: selectedPlan.content_markdown } : null,
                        card: selectedCard ? { md: selectedCard.content_markdown } : null,
                      })
                    )
                  }}
                >
                  Export selected
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  disabled={!selectedPlan && !selectedCard}
                  onSelect={event => {
                    event.preventDefault()
                    onClearSelection()
                  }}
                >
                  Clear selection
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <Separator />

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <div className="text-sm font-semibold">Plan versions</div>
              <ArtifactVersionsList
                artifacts={byType.plan_30_60_90}
                selectedId={selectedPlanId}
                latestId={latestPlanId}
                onSelect={onSelectPlan}
              />
            </div>

            <div className="space-y-3 md:border-l md:pl-4">
              <div className="text-sm font-semibold">Experiment Card versions</div>
              <ArtifactVersionsList
                artifacts={byType.experiment_card}
                selectedId={selectedCardId}
                latestId={latestCardId}
                onSelect={onSelectCard}
              />
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="text-sm font-semibold">Compare with latest</div>
            <p className="text-sm text-muted-foreground">
              Latest is the most recent artifact for this run. Selected comes from the lists above.
            </p>
          </div>
        </div>

        <Separator className="my-3" />

        <div className="space-y-6">
          <CompareSection
            title="30-60-90 Plan"
            projectId={projectId}
            latest={latestPlan}
            selected={selectedPlan}
            runId={runId}
            isLatestLoading={isLatestLoading}
            latestFilenamePrefix="artifact-plan"
            selectedFilenamePrefix="artifact-plan"
            latestMenuLabel="Latest plan"
            selectedMenuLabel="Selected plan"
            emptyLatestText="No latest plan yet."
            emptySelectedText="Select a plan version to compare."
            onCopy={onCopy}
            onExport={onExport}
          />

          <CompareSection
            title="Experiment Card"
            projectId={projectId}
            latest={latestCard}
            selected={selectedCard}
            runId={runId}
            isLatestLoading={isLatestLoading}
            latestFilenamePrefix="artifact-experiment-card"
            selectedFilenamePrefix="artifact-experiment-card"
            latestMenuLabel="Latest card"
            selectedMenuLabel="Selected card"
            emptyLatestText="No latest card yet."
            emptySelectedText="Select a card version to compare."
            onCopy={onCopy}
            onExport={onExport}
          />
        </div>
      </Card>
    </div>
  )
}

type CompareSectionProps = {
  title: string
  projectId: string
  latest: Artifact | null
  selected: Artifact | null
  runId: string
  isLatestLoading: boolean
  latestFilenamePrefix: string
  selectedFilenamePrefix: string
  latestMenuLabel: string
  selectedMenuLabel: string
  emptyLatestText: string
  emptySelectedText: string
  onCopy: (markdown?: string | null) => void
  onExport: (filename: string, markdown?: string | null) => void
}

function CompareSection({
  title,
  projectId,
  latest,
  selected,
  runId,
  isLatestLoading,
  latestFilenamePrefix,
  selectedFilenamePrefix,
  latestMenuLabel,
  selectedMenuLabel,
  emptyLatestText,
  emptySelectedText,
  onCopy,
  onExport,
}: CompareSectionProps) {
  return (
    <div className="space-y-3">
      <div className="text-sm font-semibold">{title}</div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground">Latest</div>
            <ArtifactActionsMenu
              label={latestMenuLabel}
              canCopy={Boolean(latest)}
              onCopy={() => onCopy(latest?.content_markdown ?? null)}
              onExport={() =>
                onExport(
                  `${latestFilenamePrefix}-${runId}-${latest?.id ?? 'latest'}.md`,
                  latest?.content_markdown ?? null
                )
              }
            />
          </div>
          {isLatestLoading ? (
            <div className="h-72 animate-pulse rounded-md bg-muted" />
          ) : latest ? (
            <ArtifactMarkdownCard
              title="Latest"
              markdown={latest.content_markdown}
              projectId={projectId}
              variant="latest"
            />
          ) : (
            <Card className="p-4">
              <p className="text-sm text-muted-foreground">{emptyLatestText}</p>
            </Card>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground">Selected</div>
            <ArtifactActionsMenu
              label={selectedMenuLabel}
              canCopy={Boolean(selected)}
              onCopy={() => onCopy(selected?.content_markdown ?? null)}
              onExport={() =>
                onExport(
                  `${selectedFilenamePrefix}-${runId}-${selected?.id ?? 'selected'}.md`,
                  selected?.content_markdown ?? null
                )
              }
            />
          </div>
          {selected ? (
            <ArtifactMarkdownCard
              title="Selected"
              markdown={selected.content_markdown}
              projectId={projectId}
              variant="selected"
            />
          ) : (
            <Card className="p-4">
              <p className="text-sm text-muted-foreground">{emptySelectedText}</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
