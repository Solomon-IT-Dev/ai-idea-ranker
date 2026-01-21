import { z } from 'zod'

// RFC4122 nil/ffff sentinels
const NIL_UUID = '00000000-0000-0000-0000-000000000000'

// Best-effort UUID extraction (matches RFC4122-ish UUIDs + nil/ffff sentinels).
const uuidExtractRegex =
  /(00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff|[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12})/

function coerceCitation(value: unknown): unknown {
  if (typeof value === 'object' && value !== null) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const v = value as any
    const chunkIdRaw = typeof v.chunkId === 'string' ? v.chunkId : ''
    const quoteRaw =
      typeof v.quote === 'string'
        ? v.quote
        : typeof v.text === 'string'
          ? v.text
          : typeof v.snippet === 'string'
            ? v.snippet
            : ''

    const match = uuidExtractRegex.exec(chunkIdRaw)
    const chunkId =
      match?.[1] ?? (chunkIdRaw && uuidExtractRegex.exec(String(chunkIdRaw))?.[1]) ?? NIL_UUID

    let quote = String(quoteRaw ?? '').trim()
    if (!quote) quote = JSON.stringify(value).slice(0, 300)
    if (quote.length > 300) quote = quote.slice(0, 300)

    return { chunkId, quote }
  }

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

  const match = uuidExtractRegex.exec(text)
  if (!match) return value

  const chunkId = match[1]
  let quote = text.slice(match.index + chunkId.length).trim()
  quote = quote.replace(/^[:\-–—\s]+/, '').trim()
  quote = quote
    .replace(/^[“"]+/, '')
    .replace(/[”"]+$/, '')
    .trim()

  // As a last resort, use the whole string as "quote" to avoid hard failure.
  if (!quote) quote = text.slice(0, 300)

  return { chunkId, quote }
}

export const citationSchema = z.preprocess(
  coerceCitation,
  z.object({
    chunkId: z.uuid(),
    quote: z.string().min(1).max(300),
  })
)
