import { z } from 'zod'

const uuidRegex =
  /[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/i

function coerceCitation(value: unknown): unknown {
  if (typeof value !== 'string') return value

  const text = value.trim()
  if (!text) return value

  // Sometimes models return a JSON object serialized as a string.
  if (text.startsWith('{') && text.endsWith('}')) {
    try {
      return JSON.parse(text)
    } catch {
      // fall through to best-effort parsing
    }
  }

  const match = uuidRegex.exec(text)
  if (!match) return value

  const chunkId = match[0]
  let quote = text.slice(match.index + chunkId.length).trim()
  quote = quote.replace(/^[:\-–—\s]+/, '').trim()
  quote = quote.replace(/^[“"]+/, '').replace(/[”"]+$/, '').trim()

  // As a last resort, use the whole string as "quote" to avoid hard failure.
  if (!quote) quote = text.slice(0, 300)

  return { chunkId, quote }
}

export const artifactCitationSchema = z.preprocess(
  coerceCitation,
  z.object({
    chunkId: z.uuid(),
    quote: z.string().min(1).max(300),
  })
)

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
