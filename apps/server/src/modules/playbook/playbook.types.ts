export type Chunk = { title: string | null; text: string }

export type PlaybookRow = {
  id: string
  project_id: string
  owner_id: string
  title: string
  content_markdown: string
  created_at: string
  updated_at: string
}

export type PlaybookChunkRow = {
  id: string
  playbook_id: string
  project_id: string
  owner_id: string
  chunk_index: number
  chunk_title: string | null
  chunk_text: string
  created_at: string
}
