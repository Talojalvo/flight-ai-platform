import { useState } from 'react'
import { EMPTY_TRIP_SELECTION, type TripSelection } from './tripSelection'

interface UseTripSelectionResult {
  selection: TripSelection
  selectOutbound: (id: string) => void
  selectReturn: (id: string) => void
  selectHotel: (id: string) => void
}

export function useTripSelection(): UseTripSelectionResult {
  const [selection, setSelection] = useState<TripSelection>(EMPTY_TRIP_SELECTION)

  return {
    selection,
    selectOutbound: (id) => setSelection((prev) => ({ ...prev, outboundId: id })),
    selectReturn: (id) => setSelection((prev) => ({ ...prev, returnId: id })),
    selectHotel: (id) => setSelection((prev) => ({ ...prev, hotelId: id }))
  }
}
