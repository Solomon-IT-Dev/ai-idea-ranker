export type ArtifactRow = {
  id: string
  run_id: string
  project_id: string
  owner_id: string
  type: 'plan_30_60_90' | 'experiment_card'
  content_markdown: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  citations: any[]
  created_at: string
}
