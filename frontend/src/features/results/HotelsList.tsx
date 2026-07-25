import type { HotelOption } from '../../api/types'
import { SelectableCard } from './SelectableCard'
import { HotelCard } from './HotelCard'

interface HotelsListProps {
  hotels: HotelOption[]
  selectedId: string | null
  onSelect: (id: string) => void
}

export function HotelsList({ hotels, selectedId, onSelect }: HotelsListProps) {
  return (
    <section className="results-section">
      <h2>Hotels ({hotels.length})</h2>
      <div className="selectable-card-list">
        {hotels.map((hotel) => (
          <SelectableCard
            key={hotel.id}
            name="hotel"
            value={hotel.id}
            checked={hotel.id === selectedId}
            onChange={onSelect}
          >
            <HotelCard hotel={hotel} />
          </SelectableCard>
        ))}
      </div>
    </section>
  )
}
