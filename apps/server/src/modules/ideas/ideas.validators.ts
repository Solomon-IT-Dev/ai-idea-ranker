import { z } from 'zod'

export const projectIdParamsSchema = z.object({
  projectId: z.uuid(),
})

export const importIdeasBodySchema = z.object({
  /**
   * Text/Markdown input. Each bullet/line becomes an idea.
   */
  text: z.string().min(1).max(50_000),
})

export const listIdeasQuerySchema = z.object({
  limit: z.coerce.number().int().positive().max(200).default(50),
  offset: z.coerce.number().int().min(0).default(0),
})

export const ideaIdParamsSchema = z.object({
  id: z.uuid(),
})

export const updateIdeaBodySchema = z
  .object({
    title: z.string().min(1).max(200).optional(),
    rawText: z.string().min(1).max(50_000).optional(),
    meta: z.record(z.string(), z.unknown()).optional(),
  })
  .refine(val => Object.keys(val).length > 0, {
    message: 'At least one field must be provided.',
  })
