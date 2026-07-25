# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project state

Early-stage skeleton. Only `backend/` has code; `frontend/`, `docs/`, and `infrastructure/` exist but are empty. There is no `requirements.txt`/`pyproject.toml`, no test suite, and no lint/format config anywhere in the repo — don't assume tooling exists that hasn't been added yet.

## Running the backend

Dependencies are installed into `.venv` (not committed) but not declared in any manifest file. Known installed packages: `fastapi`, `uvicorn`, `pydantic`, `requests`, `python-dotenv`. If dependencies are missing, install what's needed with pip into `.venv` — there is no lockfile to regenerate from.

Run the API from `backend/`:

```
uvicorn main:app --reload
```

`backend/main.py` loads `backend/.env` for secrets (e.g. `IGNAV_API_KEY`) via `python-dotenv` — this file is git-ignored-by-convention but has no `.gitignore` entry yet, so take care not to commit it.

## Architecture

Single FastAPI app with one endpoint, `POST /plan-trip` (`backend/main.py`), backed by an orchestrator/agent structure:

- `backend/models.py` — `TripRequest`, the single request schema (origin, destination, dates, travelers, budget).
- `backend/orchestrator.py` — `Orchestrator.create_trip_plan()` runs the three agents **synchronously in sequence** (flight → hotel → budget) and merges their outputs into one response dict. There is no async/parallel execution and no LangChain wiring yet, despite LangChain being listed in the README's tech stack.
- `backend/agents/flight_agent.py` — `FlightAgent` is the only agent that calls a real external API (`https://ignav.com/api/fares/round-trip`, authenticated via `IGNAV_API_KEY`). It parses itineraries into `FlightOption` models.
- `backend/agents/hotel_agent.py` — `HotelAgent` currently returns a single hardcoded `HotelOption` ("Rome Central Hotel"); not yet wired to a real data source.
- `backend/agents/budget_agent.py` — `BudgetAgent` is pure computation: sums flight/hotel prices from the results of the other two agents and checks against `TripRequest.budget`.

Each agent is a plain class with an `execute(...)` method — there's no shared base class or agent interface yet. `Orchestrator` instantiates all three agents once at construction and reuses them across requests (agents are stateless).

When adding new agents, follow the existing pattern: a Pydantic result model + a class with a synchronous `execute()` method, wired into `Orchestrator.create_trip_plan()`.
