from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

env_path = Path(__file__).resolve().parent / ".env"
load_dotenv(dotenv_path=env_path)

from agents.llm_client import validate_llm_config
from models import TripRequest
from orchestrator import OrchestratorAgent
from registry.agent_registry import registry, AgentType, AgentDisabledError

validate_llm_config()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

orchestrator = OrchestratorAgent()


def _register_agents():
    registry.register(
        "orchestrator", "OrchestratorAgent", AgentType.INTERNAL,
        "Coordinates the flight and hotel search agents and runs the recommendation and "
        "package-selection agents over their results"
    )
    registry.register(
        "flight-agent", "FlightAgent", AgentType.EXTERNAL,
        "Searches round-trip flight fares via the Ignav API",
        endpoint=orchestrator.flight_client.base_url,
        health_check=orchestrator.flight_client.health
    )
    registry.register(
        "hotel-agent", "HotelAgent", AgentType.EXTERNAL,
        "Searches hotel availability and rates via the LiteAPI API",
        endpoint=orchestrator.hotel_client.base_url,
        health_check=orchestrator.hotel_client.health
    )
    registry.register(
        "flight-recommendation-agent", "FlightRecommendationAgent", AgentType.INTERNAL,
        "Ranks flight search results by directness, departure time, and price"
    )
    registry.register(
        "hotel-recommendation-agent", "HotelRecommendationAgent", AgentType.INTERNAL,
        "Ranks hotel search results by guest rating and price"
    )
    registry.register(
        "package-selection-agent", "PackageSelectionAgent", AgentType.INTERNAL,
        "Uses an LLM to pick the best overall outbound flight, return flight, and hotel "
        "combination from the top-5 ranked candidates in each category; falls back to the "
        "top-ranked pick per category if the LLM is unavailable, disabled, or returns an "
        "invalid selection"
    )


_register_agents()


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/agents")
async def get_agents():
    return await registry.snapshot_with_health()


@app.post("/agents/{agent_id}/enable")
def enable_agent(agent_id: str):
    try:
        registry.set_enabled(agent_id, True)
    except KeyError:
        raise HTTPException(status_code=404, detail=f"Unknown agent '{agent_id}'")
    return {"id": agent_id, "enabled": True}


@app.post("/agents/{agent_id}/disable")
def disable_agent(agent_id: str):
    try:
        registry.set_enabled(agent_id, False)
    except KeyError:
        raise HTTPException(status_code=404, detail=f"Unknown agent '{agent_id}'")
    return {"id": agent_id, "enabled": False}


@app.get("/agents/{agent_id}/history")
def get_agent_history(agent_id: str):
    try:
        return registry.get_history(agent_id)
    except KeyError:
        raise HTTPException(status_code=404, detail=f"Unknown agent '{agent_id}'")


@app.post("/plan-trip")
def plan_trip(request: TripRequest):
    try:
        return orchestrator.create_trip_plan(request)
    except AgentDisabledError as exc:
        raise HTTPException(status_code=503, detail=str(exc))