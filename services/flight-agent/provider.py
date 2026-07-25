import os

import requests


class IgnavProvider:
    BASE_URL = "https://ignav.com/api/fares/round-trip"

    def get_round_trip_fares(self, origin, destination, departure_date, return_date, travelers):
        api_key = os.getenv("IGNAV_API_KEY")

        if not api_key:
            raise ValueError("IGNAV_API_KEY was not found")

        headers = {
            "X-Api-Key": api_key.strip(),
            "Content-Type": "application/json"
        }

        body = {
            "origin": origin,
            "destination": destination,
            "departure_date": departure_date.isoformat(),
            "return_date": return_date.isoformat(),
            "adults": travelers
        }

        response = requests.post(
            url=self.BASE_URL,
            headers=headers,
            json=body,
            timeout=30
        )

        response.raise_for_status()

        return response.json()
