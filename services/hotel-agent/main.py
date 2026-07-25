import os
from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI

env_path = Path(__file__).resolve().parent / ".env"
load_dotenv(dotenv_path=env_path)

from agent import HotelAgent
from models import HotelSearchRequest

app = FastAPI()

hotel_agent = HotelAgent()


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/search")
def search(request: HotelSearchRequest):
    return hotel_agent.execute(request)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=int(os.getenv("PORT", 8002)))
