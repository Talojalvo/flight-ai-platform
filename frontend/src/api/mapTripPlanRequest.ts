import type { OnboardingState } from '../state/types'
import type { TripRequestPayload } from './types'

export function isOnboardingComplete(state: OnboardingState): boolean {
  return Boolean(
    state.origin &&
      state.destination &&
      state.travelers &&
      state.departureDate &&
      state.returnDate &&
      state.includeHotel !== null
  )
}

export function mapOnboardingStateToTripRequest(state: OnboardingState): TripRequestPayload {
  if (!isOnboardingComplete(state)) {
    throw new Error('Onboarding state is incomplete; cannot build a trip request yet.')
  }

  return {
    origin: state.origin as string,
    destination: state.destination as string,
    departure_date: state.departureDate as string,
    return_date: state.returnDate as string,
    travelers: state.travelers,
    include_hotel: state.includeHotel as boolean
  }
}
