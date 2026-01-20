export type Idea = {
  id: string
  project_id: string
  owner_id: string
  title: string
  raw_text: string
  meta: Record<string, unknown>
  created_at: string
  updated_at?: string | null
}

export type ImportIdeasBody = {
  text: string
}

export type ImportIdeasResponse = {
  insertedCount: number
  ideas: Idea[]
  truncated: boolean
}

export type ListIdeasResponse = {
  ideas: Idea[]
  limit: number
  offset: number
}

export type UpdateIdeaBody = {
  title?: string
  rawText?: string
  meta?: Record<string, unknown>
}

export type UpdateIdeaResponse = { idea: Idea }
