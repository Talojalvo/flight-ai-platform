import { Link } from 'react-router-dom'
import { useAgents } from '../features/agents/useAgents'
import { AgentCard } from '../features/agents/AgentCard'

function formatUpdatedAt(value: Date | null): string {
  if (!value) {
    return '—'
  }
  return value.toLocaleTimeString()
}

export function AgentManagementPage() {
  const { status, error, agents, lastUpdated, isPolling } = useAgents()

  return (
    <div className="agent-management-page">
      <div className="agent-management-header">
        <h1>Agent Management</h1>
        <Link to="/" className="agent-management-back-link">
          ← Back to app
        </Link>
      </div>

      {status === 'success' && (
        <div className="agent-management-meta">
          <span className={`agent-live-indicator${isPolling ? ' agent-live-indicator-active' : ''}`}>
            <span className="agent-live-dot" />
            Live
          </span>
          <span className="agent-management-updated">Last updated {formatUpdatedAt(lastUpdated)}</span>
          {error && <span className="agent-management-reconnecting">Reconnecting…</span>}
        </div>
      )}

      {status === 'loading' && <p className="agent-management-status">Loading agents…</p>}

      {status === 'error' && (
        <p className="agent-management-status agent-management-status-error">
          Couldn't load agents{error ? `: ${error}` : '.'}
        </p>
      )}

      {status === 'success' && (
        <div className="agent-list">
          {agents.map((agent) => (
            <AgentCard key={agent.id} agent={agent} />
          ))}
        </div>
      )}
    </div>
  )
}
