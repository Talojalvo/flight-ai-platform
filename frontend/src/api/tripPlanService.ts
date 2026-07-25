import { postJson } from './client'
import type { TripPlanResult, TripRequestPayload } from './types'

export function planTrip(payload: TripRequestPayload, signal?: AbortSignal) {
  return postJson<TripPlanResult>('/plan-trip', payload, signal)
}
