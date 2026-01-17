import type { Chunk } from './playbook.types.js'

/**
 * Deterministic chunking for Markdown playbooks.
 * - Split by headings (#..######)
 * - Then split long sections into smaller chunks by paragraph boundaries
 */
export function chunkPlaybookMarkdown(input: string, options?: { maxChars?: number }): Chunk[] {
  const maxChars = options?.maxChars ?? 1400
  const text = input.replace(/\r\n/g, '\n').trim()

  // Split into sections by headings (keep headings)
  const lines = text.split('\n')
  const sections: Array<{ heading: string | null; bodyLines: string[] }> = []

  let currentHeading: string | null = null
  let currentBody: string[] = []

  function pushSection() {
    const body = currentBody.join('\n').trim()
    if (body) sections.push({ heading: currentHeading, bodyLines: body.split('\n') })
    currentBody = []
  }

  for (const line of lines) {
    const m = line.match(/^(#{1,6})\s+(.*)$/)
    if (m) {
      // New heading starts a new section
      pushSection()
      currentHeading = m[2].trim() || null
      continue
    }
    currentBody.push(line)
  }
  pushSection()

  // If no headings were found, treat entire document as one section
  if (sections.length === 0) {
    sections.push({ heading: null, bodyLines: lines })
  }

  // Split each section into chunks
  const chunks: Chunk[] = []

  for (const section of sections) {
    const paragraphs = section.bodyLines
      .join('\n')
      .split(/\n{2,}/g)
      .map(p => p.trim())
      .filter(Boolean)

    let buffer = ''
    for (const p of paragraphs) {
      const candidate = buffer ? `${buffer}\n\n${p}` : p

      if (candidate.length <= maxChars) {
        buffer = candidate
        continue
      }

      if (buffer) {
        chunks.push({ title: section.heading, text: buffer })
        buffer = ''
      }

      // If a single paragraph is too large, hard-split it
      if (p.length > maxChars) {
        for (let i = 0; i < p.length; i += maxChars) {
          chunks.push({ title: section.heading, text: p.slice(i, i + maxChars) })
        }
      } else {
        buffer = p
      }
    }

    if (buffer) {
      chunks.push({ title: section.heading, text: buffer })
    }
  }

  // De-dup trivial whitespace variants
  return chunks.map(c => ({ ...c, text: c.text.trim() })).filter(c => c.text.length > 0)
}
