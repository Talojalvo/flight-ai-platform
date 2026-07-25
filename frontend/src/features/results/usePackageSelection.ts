import { useMemo, useState } from 'react'
import type { FlightLegOption, HotelOption, PackageSelection, TripPlanResult } from '../../api/types'
import type { TripSelection } from './tripSelection'

export interface PackageChangedFlags {
  outbound: boolean
  return: boolean
  hotel: boolean
}

interface UsePackageSelectionResult {
  original: TripSelection
  current: TripSelection
  changed: PackageChangedFlags
  isCustomized: boolean
  selectedOutboundFlight: FlightLegOption | null
  selectedReturnFlight: FlightLegOption | null
  selectedHotel: HotelOption | null
  setOutbound: (id: string) => void
  setReturn: (id: string) => void
  setHotel: (id: string) => void
  restore: () => void
}

// Owns the "current" package selection independently of the AI/fallback
// original, so a manual change to one component never touches the other two
// and the original is always recoverable via restore(). Local to ResultsPage
// (not global context) to match how the pre-existing useTripSelection hook
// already scopes selection state to the results screen only.
export function usePackageSelection(result: TripPlanResult, pkg: PackageSelection): UsePackageSelectionResult {
  const original = useMemo<TripSelection>(
    () => ({
      outboundId: pkg.outbound_flight_id,
      returnId: pkg.return_flight_id,
      hotelId: pkg.hotel_id
    }),
    [pkg]
  )

  const [current, setCurrent] = useState<TripSelection>(original)

  const changed: PackageChangedFlags = {
    outbound: current.outboundId !== original.outboundId,
    return: current.returnId !== original.returnId,
    hotel: current.hotelId !== original.hotelId
  }
  const isCustomized = changed.outbound || changed.return || changed.hotel

  const selectedOutboundFlight = result.flights.outbound.find((leg) => leg.id === current.outboundId) ?? null
  const selectedReturnFlight = result.flights.return_flights.find((leg) => leg.id === current.returnId) ?? null
  const selectedHotel = result.hotels.find((hotel) => hotel.id === current.hotelId) ?? null

  return {
    original,
    current,
    changed,
    isCustomized,
    selectedOutboundFlight,
    selectedReturnFlight,
    selectedHotel,
    setOutbound: (id) => setCurrent((prev) => ({ ...prev, outboundId: id })),
    setReturn: (id) => setCurrent((prev) => ({ ...prev, returnId: id })),
    setHotel: (id) => setCurrent((prev) => ({ ...prev, hotelId: id })),
    restore: () => setCurrent(original)
  }
}
