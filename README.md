# Flight AI Platform

A multi-agent AI platform for flight and travel planning.

## Architecture

- `frontend/` — React/Vite app (onboarding, results, and an Agent Management page at `/agents`).
- `backend/` — main FastAPI service. Hosts the `OrchestratorAgent`, the two internal recommendation
  agents (`FlightRecommendationAgent`, `HotelRecommendationAgent`), and the in-process `AgentRegistry`
  that tracks status/health/timing for all five agents (exposed via `GET /agents`).
- `services/flight-agent/` — standalone FastAPI microservice wrapping the Ignav integration
  (`POST /search`, `GET /health`).
- `services/hotel-agent/` — standalone FastAPI microservice wrapping the LiteAPI integration
  (`POST /search`, `GET /health`).

The main backend never talks to Ignav/LiteAPI directly — it calls `flight-agent`/`hotel-agent` over
HTTP (URLs from `FLIGHT_AGENT_URL`/`HOTEL_AGENT_URL` env vars), then runs the recommendation agents
over the results. `docker-compose.yml` runs all four services independently, each with its own
Dockerfile, `/health` endpoint, and env-driven configuration — prep for a future Kubernetes/CI-CD
deployment.

## Technologies

- Python
- FastAPI
- React
- LangChain
- Docker
- Kubernetes
- AWS