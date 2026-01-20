/**
 * Extract ideas from a plain text/markdown input.
 * Supported:
 * - bullet lists (-, *, •)
 * - numbered lists (1., 2.)
 * - or one idea per line
 */
export function normalizeIdeasInput(raw: string) {
  const lines = raw
    .split('\n')
    .map(l => l.trim())
    .filter(Boolean)

  const cleaned = lines.map(l =>
    l
      .replace(/^(\*|-|•)\s+/, '')
      .replace(/^\d+\.\s+/, '')
      .trim()
  )

  // Drop duplicates (case-insensitive)
  const seen = new Set<string>()
  const unique: string[] = []
  for (const c of cleaned) {
    const k = c.toLowerCase()
    if (!seen.has(k)) {
      seen.add(k)
      unique.push(c)
    }
  }

  return unique
}
