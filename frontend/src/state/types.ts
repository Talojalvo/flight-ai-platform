export interface OnboardingState {
  origin: string | null
  destination: string | null
  travelers: number
  departureDate: string | null
  returnDate: string | null
  includeHotel: boolean | null
}

export function createInitialOnboardingState(): OnboardingState {
  return {
    origin: null,
    destination: null,
    travelers: 1,
    departureDate: null,
    returnDate: null,
    includeHotel: null
  }
}
