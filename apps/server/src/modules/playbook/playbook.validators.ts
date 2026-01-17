import { z } from 'zod'

export const projectIdParamsSchema = z.object({
  projectId: z.uuid(),
})

export const upsertPlaybookBodySchema = z.object({
  title: z.string().min(1).max(120),
  content: z.string().min(1).max(300_000), // markdown
})

export const searchPlaybookBodySchema = z.object({
  query: z.string().min(1).max(5_000),
  topK: z.coerce.number().int().positive().max(20).default(5),
  includeText: z.boolean().optional().default(true),
})
