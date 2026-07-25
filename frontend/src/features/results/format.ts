const MONTH_ABBREVIATIONS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
]

// departure_time/arrival_time are naive local ISO timestamps (no timezone
// offset), so they're formatted by slicing rather than parsing through
// `Date` to avoid any local-timezone reinterpretation.
export function formatDateTime(iso: string): string {
  const [datePart, timePart] = iso.split('T')
  if (!datePart || !timePart) return iso

  const [, month, day] = datePart.split('-').map(Number)
  const time = timePart.slice(0, 5)
  const monthLabel = MONTH_ABBREVIATIONS[(month ?? 1) - 1] ?? ''

  return `${monthLabel} ${day}, ${time}`
}

export function formatDuration(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60

  if (hours <= 0) return `${minutes}m`
  if (minutes === 0) return `${hours}h`
  return `${hours}h ${minutes}m`
}

export function formatStops(stops: number): string {
  if (stops <= 0) return 'Nonstop'
  if (stops === 1) return '1 stop'
  return `${stops} stops`
}

export function formatPrice(price: number): string {
  return `$${price.toFixed(2)}`
}
