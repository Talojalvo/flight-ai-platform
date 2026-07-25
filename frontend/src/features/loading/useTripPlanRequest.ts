import { useCallback, useEffect, useRef, useState } from 'react'
import { planTrip } from '../../api/tripPlanService'
import { mapOnboardingStateToTripRequest } from '../../api/mapTripPlanRequest'
import type { OnboardingState } from '../../state/types'
import type { TripPlanResult } from '../../api/types'

type Status = 'idle' | 'loading' | 'success' | 'error'

interface UseTripPlanRequestResult {
  status: Status
  error: string | null
  execute: () => void
}

export function useTripPlanRequest(
  onboardingState: OnboardingState,
  onSuccess: (result: TripPlanResult) => void
): UseTripPlanRequestResult {
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const execute = useCallback(() => {
    // Cancel any request still in flight (including one killed by a
    // StrictMode dev cleanup) instead of gating on a flag that only
    // clears asynchronously once the aborted request's catch runs.
    abortRef.current?.abort()

    let payload
    try {
      payload = mapOnboardingStateToTripRequest(onboardingState)
    } catch (mappingError) {
      setStatus('error')
      setError(mappingError instanceof Error ? mappingError.message : 'Invalid trip details.')
      return
    }

    setStatus('loading')
    setError(null)

    const controller = new AbortController()
    abortRef.current = controller

    planTrip(payload, controller.signal)
      .then((result) => {
        setStatus('success')
        onSuccess(result)
      })
      .catch((requestError: unknown) => {
        if (requestError instanceof DOMException && requestError.name === 'AbortError') {
          return
        }
        setStatus('error')
        setError(requestError instanceof Error ? requestError.message : 'Something went wrong.')
      })
  }, [onboardingState, onSuccess])

  useEffect(() => {
    return () => {
      abortRef.current?.abort()
    }
  }, [])

  return { status, error, execute }
}
