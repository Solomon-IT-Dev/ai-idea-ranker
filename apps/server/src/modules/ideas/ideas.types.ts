export type IdeaRow = {
  id: string
  project_id: string
  owner_id: string
  title: string
  raw_text: string
  meta: Record<string, unknown>
  created_at: string
}
