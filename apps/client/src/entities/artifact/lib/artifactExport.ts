export function buildArtifactsBundleMarkdown(input: {
  title: string
  plan?: { md: string } | null
  card?: { md: string } | null
}): string {
  const parts: string[] = [`# ${input.title}`]
  if (input.plan) parts.push(`\n\n## 30-60-90 Plan\n\n${input.plan.md}`)
  if (input.card) parts.push(`\n\n---\n\n## Experiment Card\n\n${input.card.md}`)
  return parts.join('')
}
