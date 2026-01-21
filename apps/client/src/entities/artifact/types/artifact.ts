export type ArtifactType = 'plan_30_60_90' | 'experiment_card'

export type VersionsByType = {
  plan_30_60_90: Artifact[]
  experiment_card: Artifact[]
}

export type Artifact = {
  id: string
  run_id: string
  project_id: string
  owner_id: string
  type: ArtifactType
  content_markdown: string
  citations: Array<{ chunkId: string; quote: string }>
  created_at: string
}

export type ListArtifactsResponse = {
  runId: string
  artifacts: Artifact[]
  byType?: VersionsByType
}

export type LatestArtifactsResponse = {
  runId: string
  artifacts: { plan: Artifact | null; experimentCard: Artifact | null }
}

export type GenerateArtifactsResponse = {
  runId: string
  model: string
  artifacts: {
    plan: Artifact
    experimentCard: Artifact
  }
}
