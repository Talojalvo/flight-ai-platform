import type { TripPlanResult } from '../../api/types'
import type { TripSelection } from './tripSelection'
import { computeTripSummary } from './tripSelection'
import { formatPrice } from './format'

interface TripSummaryBarProps {
  result: TripPlanResult
  selection: TripSelection
}

export function TripSummaryBar({ result, selection }: TripSummaryBarProps) {
  const summary = computeTripSummary(result, selection)
  const hotelWasRequested = result.hotels.length > 0

  return (
    <div className="trip-summary-bar">
      <div className="trip-summary-row">
        <span>✈ Outbound flight price</span>
        <span>{formatPrice(summary.outboundPrice)}</span>
      </div>
      <div className="trip-summary-row">
        <span>✈ Return flight price</span>
        <span>{formatPrice(summary.returnPrice)}</span>
      </div>
      {hotelWasRequested && (
        <div className="trip-summary-row">
          <span>🏨 Hotel price</span>
          <span>{formatPrice(summary.hotelPrice)}</span>
        </div>
      )}
      <div className="trip-summary-divider" />
      <div className="trip-summary-row trip-summary-total">
        <span>💰 Total trip price</span>
        <span>{formatPrice(summary.total)}</span>
      </div>
    </div>
  )
}
