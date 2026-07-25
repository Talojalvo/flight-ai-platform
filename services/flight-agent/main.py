import os
from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI

env_path = Path(__file__).resolve().parent / ".env"
load_dotenv(dotenv_path=env_path)

from agent import FlightAgent
from models import FlightSearchRequest

app = FastAPI()

flight_agent = FlightAgent()


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/search")
def search(request: FlightSearchRequest):
    return flight_agent.execute(request)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=int(os.getenv("PORT", 8001)))
