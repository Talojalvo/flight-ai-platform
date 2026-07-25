import { useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { useTripPlan } from '../state/TripPlanContext'
import { useTripPlanRequest } from '../features/loading/useTripPlanRequest'
import { useCyclingMessage } from '../features/loading/useCyclingMessage'
import { LOADING_MESSAGES } from '../features/loading/loadingMessages'
import type { TripPlanResult } from '../api/types'

export function LoadingPage() {
  const navigate = useNavigate()
  const { state, setResult } = useTripPlan()
  const message = useCyclingMessage(LOADING_MESSAGES)

  const handleSuccess = useCallback(
    (result: TripPlanResult) => {
      setResult(result)
      navigate('/results')
    },
    [navigate, setResult]
  )

  const { status, error, execute } = useTripPlanRequest(state, handleSuccess)

  useEffect(() => {
    execute()
    // Runs once on mount; `execute` internally guards against duplicate in-flight requests.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="loading-page">
      {status === 'error' ? (
        <div className="loading-error">
          <p>We couldn&apos;t plan your trip.</p>
          <p className="loading-error-detail">{error}</p>
          <button type="button" className="primary-button" onClick={execute}>
            Retry
          </button>
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.p
            key={message}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.4 }}
            className="loading-message"
          >
            {message}
          </motion.p>
        </AnimatePresence>
      )}
    </div>
  )
}
