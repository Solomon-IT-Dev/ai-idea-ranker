export function truncateText(value: string, maxLength: number): string {
  if (!value) return ''
  if (value.length <= maxLength) return value
  return `${value.slice(0, maxLength)}…`
}
