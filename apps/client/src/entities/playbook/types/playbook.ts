export type Playbook = {
  id: string
  project_id: string
  owner_id: string
  title: string
  content_markdown: string
  created_at: string
  updated_at: string
}

export type PlaybookChunk = {
  id: string
  playbook_id: string
  project_id: string
  owner_id: string
  chunk_index: number
  chunk_title: string | null
  chunk_text: string
  embedding?: string | null
  created_at: string
}

export type GetPlaybookResponse = {
  playbook: Playbook | null
  chunks: PlaybookChunk[]
}

export type UpsertPlaybookBody = {
  title: string
  content: string
}

export type UpsertPlaybookResponse = {
  playbook: Playbook
  chunksInserted: number
  embeddings: { status: 'ok' | 'failed'; errorType?: string }
}

export type PlaybookSearchResult = {
  chunkId: string
  chunkIndex: number
  title: string | null
  score: number
  text?: string
}
