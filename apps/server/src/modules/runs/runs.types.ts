export type RunRow = {
  id: string
  project_id: string
  owner_id: string
  status: string
  model: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  weights: any
  top_n: number
  created_at: string
}
