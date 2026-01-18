import { z } from 'zod'

export const projectIdParamsSchema = z.object({
  projectId: z.string().uuid(),
})

export const createRunBodySchema = z.object({
  topN: z.coerce.number().int().positive().max(20).default(5),
  weights: z
    .object({
      impact: z.coerce.number().min(0).max(5).default(1),
      effort: z.coerce.number().min(0).max(5).default(1),
      risk: z.coerce.number().min(0).max(5).default(1),
      dataReadiness: z.coerce.number().min(0).max(5).default(1),
    })
    .default({ impact: 1, effort: 1, risk: 1, dataReadiness: 1 }),
})

export const runIdParamsSchema = z.object({
  projectId: z.uuid(),
  runId: z.uuid(),
})
