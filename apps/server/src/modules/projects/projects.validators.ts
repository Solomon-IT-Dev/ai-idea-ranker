import { z } from 'zod'

export const createProjectBodySchema = z.object({
  name: z.string().min(1).max(120),
  constraints: z.record(z.string(), z.unknown()).default({}),
})
