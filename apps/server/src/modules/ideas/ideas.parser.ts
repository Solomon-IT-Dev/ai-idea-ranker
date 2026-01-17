/**
 * Parses Markdown/plain text into normalized idea items.
 *
 * Supported formats:
 * - bullet lists: "- idea", "* idea"
 * - numbered lists: "1. idea"
 * - plain lines: "idea"
 *
 * Empty lines and headings are ignored.
 */
export function parseIdeasFromText(input: string): Array<{ title: string; rawText: string }> {
  const lines = input
    .split(/\r?\n/)
    .map(l => l.trim())
    .filter(Boolean)

  const ideas: Array<{ title: string; rawText: string }> = []

  for (const line of lines) {
    // Ignore markdown headings
    if (/^#{1,6}\s+/.test(line)) continue

    // Remove common list prefixes: "-", "*", "1.", "1)"
    const normalized = line.replace(/^([-*]|\d+[.)])\s*/, '').trim()
    if (!normalized) continue

    // Title is a trimmed version; rawText keeps the normalized content.
    ideas.push({ title: normalized, rawText: normalized })
  }

  // De-duplicate while keeping order (case-insensitive)
  const seen = new Set<string>()
  return ideas.filter(i => {
    const key = i.title.toLowerCase()
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}
