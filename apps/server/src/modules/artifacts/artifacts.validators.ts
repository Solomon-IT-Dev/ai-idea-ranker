import { z } from 'zod'

export const generateArtifactsParamsSchema = z.object({
  projectId: z.uuid(),
  runId: z.uuid(),
})

export const generateArtifactsBodySchema = z.object({
  topN: z.coerce.number().int().positive().max(10).default(3),
})

export const getLatestArtifactsParamsSchema = z.object({
  projectId: z.uuid(),
  runId: z.uuid(),
})

export const listArtifactsParamsSchema = z.object({
  projectId: z.uuid(),
  runId: z.uuid(),
})
