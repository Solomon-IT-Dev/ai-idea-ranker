const uuidRegex =
  /([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)/

export function nodeToText(node: unknown): string {
  if (node == null) return ''
  if (typeof node === 'string' || typeof node === 'number') return String(node)
  if (Array.isArray(node)) return node.map(nodeToText).join('')

  if (typeof node === 'object') {
    const n = node as { props?: { children?: unknown } }
    return nodeToText(n.props?.children)
  }

  return ''
}

export function linkifyArtifactSourcesMarkdown(markdown: string, projectId: string): string {
  const marker = '\n## Sources\n'
  const markerIndex = markdown.indexOf(marker)
  if (markerIndex === -1) return markdown

  const head = markdown.slice(0, markerIndex + marker.length)
  const tail = markdown.slice(markerIndex + marker.length)

  const mapped = tail.split('\n').map(line => {
    if (!line.startsWith('- [C')) return line
    const match = uuidRegex.exec(line)
    if (!match) return line

    const chunkId = match[1]
    const href = `/projects/${projectId}/playbook?chunkId=${chunkId}`
    return line.replace(chunkId, `[${chunkId}](${href})`)
  })

  return head + mapped.join('\n')
}
