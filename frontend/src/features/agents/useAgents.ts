import { useCallback, useEffect, useRef, useState } from 'react'
import { getAgents } from '../../api/agentsService'
import type { AgentInfo } from '../../api/types'

const POLL_INTERVAL_MS = 1000

type Status = 'loading' | 'success' | 'error'

interface UseAgentsResult {
  status: Status
  error: string | null
  agents: AgentInfo[]
  lastUpdated: Date | null
  isPolling: boolean
}

export function useAgents(): UseAgentsResult {
  const [status, setStatus] = useState<Status>('loading')
  const [error, setError] = useState<string | null>(null)
  const [agents, setAgents] = useState<AgentInfo[]>([])
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [isPolling, setIsPolling] = useState(false)

  const inFlightRef = useRef(false)
  const abortRef = useRef<AbortController | null>(null)
  const hasDataRef = useRef(false)

  const poll = useCallback(() => {
    // Skip this tick rather than overlap if the previous poll hasn't resolved yet.
    if (inFlightRef.current) {
      return
    }
    inFlightRef.current = true
    setIsPolling(true)

    const controller = new AbortController()
    abortRef.current = controller

    getAgents(controller.signal)
      .then((result) => {
        hasDataRef.current = true
        setAgents(result)
        setStatus('success')
        setError(null)
        setLastUpdated(new Date())
      })
      .catch((requestError: unknown) => {
        if (requestError instanceof DOMException && requestError.name === 'AbortError') {
          return
        }
        const message = requestError instanceof Error ? requestError.message : 'Something went wrong.'
        setError(message)
        // A transient poll failure shouldn't blank out already-visible agent data.
        setStatus(hasDataRef.current ? 'success' : 'error')
      })
      .finally(() => {
        inFlightRef.current = false
        setIsPolling(false)
      })
  }, [])

  useEffect(() => {
    poll()
    const intervalId = window.setInterval(poll, POLL_INTERVAL_MS)

    return () => {
      window.clearInterval(intervalId)
      abortRef.current?.abort()
    }
  }, [poll])

  return { status, error, agents, lastUpdated, isPolling }
}
