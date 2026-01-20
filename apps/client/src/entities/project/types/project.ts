export type ProjectTeamConstraints = {
  fe: number
  be: number
  ds?: number
}

export type ProjectConstraints = {
  budget: number
  team: ProjectTeamConstraints
}

export type Project = {
  id: string
  owner_id: string
  name: string
  constraints: ProjectConstraints
  created_at: string
}

