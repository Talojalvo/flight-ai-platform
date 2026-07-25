import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useTripPlan } from '../state/TripPlanContext'
import { FlightLegList } from '../features/results/FlightLegList'
import { HotelsList } from '../features/results/HotelsList'
import { TripSummaryBar } from '../features/results/TripSummaryBar'
import { useTripSelection } from '../features/results/useTripSelection'
import { isOutboundSelected, isReturnSelected } from '../features/results/tripSelection'

const FADE_UP = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: 'easeOut' as const }
}

export function ResultsPage() {
  const { result, state } = useTripPlan()
  const navigate = useNavigate()
  const { selection, selectOutbound, selectReturn, selectHotel } = useTripSelection()

  useEffect(() => {
    if (!result) {
      navigate('/', { replace: true })
    }
  }, [result, navigate])

  if (!result) {
    return null
  }

  const showReturn = isOutboundSelected(selection)
  const showHotels = showReturn && isReturnSelected(selection) && state.includeHotel

  return (
    <div className="results-page">
      <h1>Your Trip Plan</h1>

      <FlightLegList
        title={`Outbound Flights (${result.flights.outbound.length})`}
        groupName="outbound"
        legs={result.flights.outbound}
        selectedId={selection.outboundId}
        onSelect={selectOutbound}
      />

      {showReturn && (
        <motion.div {...FADE_UP}>
          <FlightLegList
            title={`Return Flights (${result.flights.return_flights.length})`}
            groupName="return"
            legs={result.flights.return_flights}
            selectedId={selection.returnId}
            onSelect={selectReturn}
          />
        </motion.div>
      )}

      {showHotels && (
        <motion.div {...FADE_UP}>
          <HotelsList hotels={result.hotels} selectedId={selection.hotelId} onSelect={selectHotel} />
        </motion.div>
      )}

      <TripSummaryBar result={result} selection={selection} />
    </div>
  )
}
