export type Idea = {
  id: string
  project_id: string
  owner_id: string
  title: string
  raw_text: string
  created_at: string
  updated_at?: string | null
}

export type ImportIdeasBody = {
  text: string
}
