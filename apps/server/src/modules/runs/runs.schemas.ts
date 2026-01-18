import { z } from 'zod'

export const aiRunResultSchema = z.object({
  scores: z
    .array(
      z.object({
        ideaId: z.string().uuid(),
        impact: z.number().int().min(1).max(10),
        effort: z.number().int().min(1).max(10),
        risk: z.number().int().min(1).max(10),
        dataReadiness: z.number().int().min(1).max(10),
        rationale: z.string().min(1).max(3000),
        citations: z
          .array(
            z.object({
              chunkId: z.string().uuid(),
              quote: z.string().min(1).max(300),
            })
          )
          .max(8)
          .default([]),
        costEstimateUsd: z.number().int().min(0).max(10_000_000).optional(),
        resourceEstimate: z
          .object({
            feDays: z.number().int().min(0).max(365).optional(),
            beDays: z.number().int().min(0).max(365).optional(),
            dsDays: z.number().int().min(0).max(365).optional(),
          })
          .default({}),
      })
    )
    .max(200)
    .refine(arr => new Set(arr.map(x => x.ideaId)).size === arr.length, {
      message: 'Duplicate ideaId in scores is not allowed.',
    }),
})
