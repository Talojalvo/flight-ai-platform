import pytest

from registry.agent_registry import AgentType, registry

AGENT_IDS = [
    "orchestrator",
    "flight-agent",
    "hotel-agent",
    "flight-recommendation-agent",
    "hotel-recommendation-agent",
    "package-selection-agent",
]


@pytest.fixture(autouse=True)
def fresh_registry():
    """Re-register every agent id before each test.

    AgentRegistry is a process-wide singleton (backend/registry/agent_registry.py),
    so without this, one test disabling "package-selection-agent" would leak into
    the next. registry.register() replaces the whole record, which resets
    enabled/history/last_error to defaults as a side effect.
    """
    for agent_id in AGENT_IDS:
        registry.register(agent_id, agent_id, AgentType.INTERNAL, "test agent")
    yield
