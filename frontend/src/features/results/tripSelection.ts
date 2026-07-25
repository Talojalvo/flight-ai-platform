import type { TripPlanResult } from '../../api/types'

export interface TripSelection {
  outboundId: string | null
  returnId: string | null
  hotelId: string | null
}

export const EMPTY_TRIP_SELECTION: TripSelection = {
  outboundId: null,
  returnId: null,
  hotelId: null
}

export interface TripSummary {
  outboundPrice: number
  returnPrice: number
  hotelPrice: number
  total: number
}

export function computeTripSummary(result: TripPlanResult, selection: TripSelection): TripSummary {
  const outbound = result.flights.outbound.find((leg) => leg.id === selection.outboundId)
  const returnFlight = result.flights.return_flights.find((leg) => leg.id === selection.returnId)
  const hotel = result.hotels.find((h) => h.id === selection.hotelId)

  const outboundPrice = outbound?.price ?? 0
  const returnPrice = returnFlight?.price ?? 0
  const hotelPrice = hotel?.total_price ?? 0

  return {
    outboundPrice,
    returnPrice,
    hotelPrice,
    total: outboundPrice + returnPrice + hotelPrice
  }
}

export function isOutboundSelected(selection: TripSelection): boolean {
  return selection.outboundId !== null
}

export function isReturnSelected(selection: TripSelection): boolean {
  return selection.returnId !== null
}

export function isHotelSelected(selection: TripSelection): boolean {
  return selection.hotelId !== null
}
