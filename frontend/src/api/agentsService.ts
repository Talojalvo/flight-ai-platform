import { getJson, postJson } from './client'
import type { AgentHistoryEntry, AgentInfo } from './types'

export function getAgents(signal?: AbortSignal) {
  return getJson<AgentInfo[]>('/agents', signal)
}

export function enableAgent(agentId: string) {
  return postJson<{ id: string; enabled: boolean }>(`/agents/${agentId}/enable`, {})
}

export function disableAgent(agentId: string) {
  return postJson<{ id: string; enabled: boolean }>(`/agents/${agentId}/disable`, {})
}

export function getAgentHistory(agentId: string) {
  return getJson<AgentHistoryEntry[]>(`/agents/${agentId}/history`)
}
