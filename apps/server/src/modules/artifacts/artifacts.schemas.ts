import { z } from 'zod'

export const artifactCitationSchema = z.object({
  chunkId: z.uuid(),
  quote: z.string().min(1).max(300),
})

export const aiArtifactsSchema = z.object({
  plan: z.object({
    title: z.string().min(1).max(120),
    days30: z.array(z.string().min(1).max(200)).min(3).max(10),
    days60: z.array(z.string().min(1).max(200)).min(3).max(10),
    days90: z.array(z.string().min(1).max(200)).min(3).max(10),
    citations: z.array(artifactCitationSchema).max(10).default([]),
  }),
  experimentCard: z.object({
    ideaId: z.uuid(),
    title: z.string().min(1).max(160),
    problem: z.string().min(1).max(800),
    hypothesis: z.string().min(1).max(500),
    dataset: z.string().min(1).max(800),
    metrics: z.array(z.string().min(1).max(200)).min(2).max(10),
    goNoGo: z.array(z.string().min(1).max(200)).min(2).max(10),
    citations: z.array(artifactCitationSchema).max(10).default([]),
  }),
})
