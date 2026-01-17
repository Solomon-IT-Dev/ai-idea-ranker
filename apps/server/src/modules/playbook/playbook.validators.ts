import { z } from 'zod'

export const projectIdParamsSchema = z.object({
  projectId: z.uuid(),
})

export const upsertPlaybookBodySchema = z.object({
  title: z.string().min(1).max(120),
  content: z.string().min(1).max(300_000), // markdown
})
