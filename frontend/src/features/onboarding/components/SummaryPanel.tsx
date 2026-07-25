import type { OnboardingState } from '../../../state/types'
import { AIRPORTS } from '../airports'

function airportLabel(code: string | null): string {
  if (!code) return '—'
  const airport = AIRPORTS.find((item) => item.code === code)
  return airport ? `${airport.city} (${airport.code})` : code
}

interface SummaryPanelProps {
  state: OnboardingState
}

export function SummaryPanel({ state }: SummaryPanelProps) {
  const rows: [string, string][] = [
    ['Departure Airport', airportLabel(state.origin)],
    ['Destination Airport', airportLabel(state.destination)],
    ['Travelers', String(state.travelers)],
    ['Departure Date', state.departureDate ?? '—'],
    ['Return Date', state.returnDate ?? '—'],
    ['Hotel Included', state.includeHotel === null ? '—' : state.includeHotel ? 'Yes' : 'No']
  ]

  return (
    <dl className="summary-panel">
      {rows.map(([label, value]) => (
        <div className="summary-row" key={label}>
          <dt>{label}</dt>
          <dd>{value}</dd>
        </div>
      ))}
    </dl>
  )
}
