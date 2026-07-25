import type { FlightLegOption } from '../../api/types'
import { SelectableCard } from './SelectableCard'
import { FlightLegCard } from './FlightLegCard'

interface FlightLegListProps {
  title: string
  groupName: string
  legs: FlightLegOption[]
  selectedId: string | null
  onSelect: (id: string) => void
}

export function FlightLegList({ title, groupName, legs, selectedId, onSelect }: FlightLegListProps) {
  return (
    <section className="results-section">
      <h2>{title}</h2>
      <div className="selectable-card-list">
        {legs.map((leg) => (
          <SelectableCard key={leg.id} name={groupName} value={leg.id} checked={leg.id === selectedId} onChange={onSelect}>
            <FlightLegCard leg={leg} />
          </SelectableCard>
        ))}
      </div>
    </section>
  )
}
