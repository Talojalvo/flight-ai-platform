import { createContext, useContext, useReducer, useState, type Dispatch, type ReactNode } from 'react'
import { createInitialOnboardingState, type OnboardingState } from './types'
import { tripPlanReducer, type TripPlanAction } from './tripPlanReducer'
import type { TripPlanResult } from '../api/types'

interface TripPlanContextValue {
  state: OnboardingState
  dispatch: Dispatch<TripPlanAction>
  result: TripPlanResult | null
  setResult: (result: TripPlanResult | null) => void
}

const TripPlanContext = createContext<TripPlanContextValue | undefined>(undefined)

export function TripPlanProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(tripPlanReducer, createInitialOnboardingState())
  const [result, setResult] = useState<TripPlanResult | null>(null)

  return (
    <TripPlanContext.Provider value={{ state, dispatch, result, setResult }}>
      {children}
    </TripPlanContext.Provider>
  )
}

export function useTripPlan(): TripPlanContextValue {
  const context = useContext(TripPlanContext)

  if (!context) {
    throw new Error('useTripPlan must be used within a TripPlanProvider')
  }

  return context
}
