import os

import requests


class FlightAgentClient:
    def __init__(self, timeout: float = 35):
        self.base_url = os.getenv("FLIGHT_AGENT_URL", "http://localhost:8001").rstrip("/")
        self.timeout = timeout

    def search(self, request):
        response = requests.post(
            url=f"{self.base_url}/search",
            json=request.model_dump(mode="json"),
            timeout=self.timeout
        )
        response.raise_for_status()
        return response.json()

    def health(self, timeout: float = 1.5) -> bool:
        try:
            response = requests.get(url=f"{self.base_url}/health", timeout=timeout)
            return response.ok
        except requests.RequestException:
            return False
