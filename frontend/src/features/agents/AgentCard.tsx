import { useState } from 'react'
import { disableAgent, enableAgent, getAgentHistory } from '../../api/agentsService'
import type { AgentHistoryEntry, AgentInfo } from '../../api/types'

interface AgentCardProps {
  agent: AgentInfo
}

function formatTimestamp(value: string | null): string {
  if (!value) {
    return 'Never'
  }
  return new Date(value).toLocaleString()
}

function formatResponseTime(value: number | null): string {
  if (value === null) {
    return '—'
  }
  return `${Math.round(value)} ms`
}

export function AgentCard({ agent }: AgentCardProps) {
  const isBusy = agent.status === 'Busy'
  const [isToggling, setIsToggling] = useState(false)
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)
  const [history, setHistory] = useState<AgentHistoryEntry[] | null>(null)
  const [historyError, setHistoryError] = useState<string | null>(null)

  const handleToggleEnabled = () => {
    setIsToggling(true)
    const request = agent.enabled ? disableAgent(agent.id) : enableAgent(agent.id)
    request.finally(() => setIsToggling(false))
  }

  const handleToggleHistory = () => {
    if (isHistoryOpen) {
      setIsHistoryOpen(false)
      return
    }

    setIsHistoryOpen(true)
    setHistoryError(null)
    getAgentHistory(agent.id)
      .then(setHistory)
      .catch((requestError: unknown) => {
        const message = requestError instanceof Error ? requestError.message : 'Something went wrong.'
        setHistoryError(message)
      })
  }

  return (
    <div className={`agent-card${isBusy ? ' agent-card-busy' : ''}`}>
      <div className="agent-card-header">
        <span className="agent-card-name">{agent.name}</span>
        <span className={`agent-type-badge agent-type-badge-${agent.type.toLowerCase()}`}>
          {agent.type}
        </span>
      </div>

      <p className="agent-card-description">{agent.description}</p>

      <div className="agent-card-badges">
        <span className={`agent-status-badge agent-status-badge-${agent.status.toLowerCase()}`}>
          {isBusy && <span className="agent-status-busy-dot" />}
          {agent.status}
        </span>
        <span className={`agent-health-badge agent-health-badge-${agent.health.toLowerCase()}`}>
          {agent.health}
        </span>
        {!agent.enabled && <span className="agent-disabled-badge">Disabled</span>}
      </div>

      <div className="agent-card-meta">
        <div className="agent-card-meta-row">
          <span>Last execution</span>
          <span>{formatTimestamp(agent.last_execution_time)}</span>
        </div>
        <div className="agent-card-meta-row">
          <span>Avg response time</span>
          <span>{formatResponseTime(agent.avg_response_time_ms)}</span>
        </div>
        {agent.endpoint && (
          <div className="agent-card-meta-row">
            <span>Endpoint</span>
            <span className="agent-card-endpoint">{agent.endpoint}</span>
          </div>
        )}
        {agent.last_error && (
          <div className="agent-card-meta-row">
            <span>Last error</span>
            <span className="agent-card-error">{agent.last_error}</span>
          </div>
        )}
      </div>

      <div className="agent-card-actions">
        <button type="button" className="agent-action-button" disabled={isToggling} onClick={handleToggleEnabled}>
          {agent.enabled ? 'Disable' : 'Enable'}
        </button>
        <button type="button" className="agent-action-button" onClick={handleToggleHistory}>
          {isHistoryOpen ? 'Hide History' : 'View History'}
        </button>
      </div>

      {isHistoryOpen && (
        <div className="agent-history">
          {historyError && <p className="agent-history-error">Couldn't load history: {historyError}</p>}
          {!historyError && history === null && <p className="agent-history-empty">Loading…</p>}
          {!historyError && history !== null && history.length === 0 && (
            <p className="agent-history-empty">No executions yet.</p>
          )}
          {!historyError && history !== null && history.length > 0 && (
            <ul className="agent-history-list">
              {history
                .slice()
                .reverse()
                .map((entry, index) => (
                  <li key={`${entry.timestamp}-${index}`} className="agent-history-entry">
                    <span className={`agent-history-status agent-history-status-${entry.status.toLowerCase()}`}>
                      {entry.status}
                    </span>
                    <span>{entry.operation}</span>
                    <span>{Math.round(entry.duration_ms)} ms</span>
                    <span>{formatTimestamp(entry.timestamp)}</span>
                  </li>
                ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
