import type { FlightLegOption } from '../../api/types'
import { formatDateTime, formatDuration, formatPrice, formatStops } from './format'

interface FlightLegCardProps {
  leg: FlightLegOption
}

export function FlightLegCard({ leg }: FlightLegCardProps) {
  return (
    <div className="flight-card">
      <div className="flight-card-row flight-card-airline">
        <span>{leg.airline}</span>
        <span className="flight-card-price">{formatPrice(leg.price)}</span>
      </div>
      <div className="flight-card-row flight-card-route">
        <div>
          <div className="flight-card-time">{formatDateTime(leg.departure_time)}</div>
          <div className="flight-card-airport">{leg.departure_airport}</div>
        </div>
        <div className="flight-card-arrow">→</div>
        <div>
          <div className="flight-card-time">{formatDateTime(leg.arrival_time)}</div>
          <div className="flight-card-airport">{leg.arrival_airport}</div>
        </div>
      </div>
      <div className="flight-card-row flight-card-meta">
        <span>{formatDuration(leg.duration_minutes)}</span>
        <span>{formatStops(leg.stops)}</span>
      </div>
    </div>
  )
}
