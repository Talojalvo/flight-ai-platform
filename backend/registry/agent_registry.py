import asyncio
import threading
import time
from collections import deque
from datetime import datetime, timezone
from enum import Enum
from typing import Callable, Optional


class AgentDisabledError(Exception):
    pass


class AgentType(str, Enum):
    INTERNAL = "Internal"
    EXTERNAL = "External"


class AgentStatus(str, Enum):
    ONLINE = "Online"
    OFFLINE = "Offline"
    BUSY = "Busy"


class HealthStatus(str, Enum):
    HEALTHY = "Healthy"
    UNHEALTHY = "Unhealthy"
    UNKNOWN = "Unknown"


class _AgentRecord:
    def __init__(self, agent_id: str, name: str, agent_type: AgentType, description: str,
                 endpoint: Optional[str] = None, health_check: Optional[Callable[[], bool]] = None):
        self.id = agent_id
        self.name = name
        self.type = agent_type
        self.description = description
        self.endpoint = endpoint
        self.health_check = health_check

        self.status = AgentStatus.ONLINE
        self.last_execution_time: Optional[str] = None
        self.avg_response_time_ms: Optional[float] = None
        self._execution_count = 0
        self.lock = threading.Lock()

        self.enabled = True
        self.last_error: Optional[str] = None
        self.history: deque = deque(maxlen=20)


class AgentRegistry:
    def __init__(self):
        self._agents: dict[str, _AgentRecord] = {}

    def register(self, agent_id: str, name: str, agent_type: AgentType, description: str,
                 endpoint: Optional[str] = None, health_check: Optional[Callable[[], bool]] = None):
        self._agents[agent_id] = _AgentRecord(
            agent_id=agent_id,
            name=name,
            agent_type=agent_type,
            description=description,
            endpoint=endpoint,
            health_check=health_check
        )

    def timed_call(self, agent_id: str, fn: Callable, operation: str = "execute"):
        record = self._agents[agent_id]

        with record.lock:
            if not record.enabled:
                raise AgentDisabledError(f"Agent '{agent_id}' is disabled")
            record.status = AgentStatus.BUSY

        started = time.monotonic()
        try:
            result = fn()
        except Exception as exc:
            elapsed_ms = (time.monotonic() - started) * 1000
            with record.lock:
                record.status = AgentStatus.OFFLINE
                record.last_execution_time = self._now()
                record.last_error = str(exc)
                record.history.append({
                    "timestamp": self._now(),
                    "operation": operation,
                    "duration_ms": round(elapsed_ms, 2),
                    "status": "Failed",
                })
            raise
        else:
            elapsed_ms = (time.monotonic() - started) * 1000
            with record.lock:
                record.status = AgentStatus.ONLINE
                record.last_execution_time = self._now()
                record._execution_count += 1
                if record.avg_response_time_ms is None:
                    record.avg_response_time_ms = elapsed_ms
                else:
                    n = record._execution_count
                    record.avg_response_time_ms = (
                        (record.avg_response_time_ms * (n - 1) + elapsed_ms) / n
                    )
                record.history.append({
                    "timestamp": self._now(),
                    "operation": operation,
                    "duration_ms": round(elapsed_ms, 2),
                    "status": "Success",
                })
            return result

    def set_enabled(self, agent_id: str, enabled: bool) -> None:
        record = self._agents[agent_id]
        with record.lock:
            record.enabled = enabled

    def get_history(self, agent_id: str) -> list[dict]:
        record = self._agents[agent_id]
        with record.lock:
            return list(record.history)

    async def snapshot_with_health(self) -> list[dict]:
        records = list(self._agents.values())
        healths = await asyncio.gather(*(self._resolve_health(r) for r in records))

        snapshot = []
        for record, health in zip(records, healths):
            with record.lock:
                entry = {
                    "id": record.id,
                    "name": record.name,
                    "type": record.type.value,
                    "description": record.description,
                    "status": record.status.value,
                    "health": health.value,
                    "enabled": record.enabled,
                    "last_execution_time": record.last_execution_time,
                    "avg_response_time_ms": (
                        round(record.avg_response_time_ms, 2)
                        if record.avg_response_time_ms is not None
                        else None
                    )
                }
                if record.last_error is not None:
                    entry["last_error"] = record.last_error
            if record.type == AgentType.EXTERNAL:
                entry["endpoint"] = record.endpoint

            snapshot.append(entry)

        return snapshot

    async def _resolve_health(self, record: _AgentRecord) -> HealthStatus:
        if record.type == AgentType.INTERNAL or record.health_check is None:
            return HealthStatus.HEALTHY

        try:
            is_healthy = await asyncio.to_thread(record.health_check)
        except Exception:
            return HealthStatus.UNKNOWN

        return HealthStatus.HEALTHY if is_healthy else HealthStatus.UNHEALTHY

    @staticmethod
    def _now() -> str:
        return datetime.now(timezone.utc).isoformat()


registry = AgentRegistry()
