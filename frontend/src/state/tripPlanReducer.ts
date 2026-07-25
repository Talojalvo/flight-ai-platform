import type { OnboardingState } from './types'
import { createInitialOnboardingState } from './types'

export type TripPlanAction =
  | { type: 'SET_ORIGIN'; origin: string }
  | { type: 'SET_DESTINATION'; destination: string }
  | { type: 'SET_TRAVELERS'; travelers: number }
  | { type: 'SET_DEPARTURE_DATE'; date: string }
  | { type: 'SET_RETURN_DATE'; date: string }
  | { type: 'SET_INCLUDE_HOTEL'; includeHotel: boolean }
  | { type: 'RESET' }

export function tripPlanReducer(state: OnboardingState, action: TripPlanAction): OnboardingState {
  switch (action.type) {
    case 'SET_ORIGIN':
      return { ...state, origin: action.origin }
    case 'SET_DESTINATION':
      return { ...state, destination: action.destination }
    case 'SET_TRAVELERS':
      return { ...state, travelers: action.travelers }
    case 'SET_DEPARTURE_DATE':
      return { ...state, departureDate: action.date }
    case 'SET_RETURN_DATE':
      return { ...state, returnDate: action.date }
    case 'SET_INCLUDE_HOTEL':
      return { ...state, includeHotel: action.includeHotel }
    case 'RESET':
      return createInitialOnboardingState()
    default:
      return state
  }
}
