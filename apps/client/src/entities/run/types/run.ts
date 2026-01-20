export type RunWeights = {
  impact: number
  effort: number
  risk: number
  dataReadiness: number
}

export type RunRow = {
  id: string
  project_id: string
  owner_id: string
  status: 'running' | 'completed' | 'failed'
  model: string
  weights: RunWeights
  top_n: number
  created_at: string
  prompt_version: string
  input_snapshot: unknown
  sources_used: unknown[]
  raw_ai_response: unknown | null
  error_type: string | null
  error_message: string | null
}

export type IdeaScoreRow = {
  id: string
  run_id: string
  project_id: string
  owner_id: string
  idea_id: string
  impact: number
  effort: number
  risk: number
  data_readiness: number
  overall: number
  rationale: string
  citations: Array<{ chunkId: string; quote: string }>
  cost_estimate_usd: number | null
  resource_estimate: Record<string, unknown>
  created_at: string
  ideas?: { title?: string; raw_text?: string } | null
}

export type RunGetResponse = {
  run: RunRow
  scores?: IdeaScoreRow[]
  top?: IdeaScoreRow[]
}

export type RunsListResponse = {
  runs: RunRow[]
}

export type StartRunResponse = {
  run: RunRow
}
