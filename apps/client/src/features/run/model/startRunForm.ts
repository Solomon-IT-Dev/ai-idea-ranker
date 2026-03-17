import { z } from 'zod'

export const startRunSchema = z.object({
  topN: z.coerce.number().int().min(1).max(20).default(5),
  impact: z.coerce.number().min(0).max(5).default(1),
  effort: z.coerce.number().min(0).max(5).default(1),
  risk: z.coerce.number().min(0).max(5).default(1),
  dataReadiness: z.coerce.number().min(0).max(5).default(1),
})

export type StartRunFormValues = z.infer<typeof startRunSchema>

export const startRunDefaultValues: StartRunFormValues = {
  topN: 5,
  impact: 1,
  effort: 1,
  risk: 1,
  dataReadiness: 1,
}
