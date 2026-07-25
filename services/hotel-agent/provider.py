import os

import requests


class LiteApiProvider:
    BASE_URL = "https://api.liteapi.travel/v3.0"
    DEFAULT_RADIUS_METERS = 30000
    DEFAULT_HOTEL_LIMIT = 10
    CURRENCY = "USD"
    GUEST_NATIONALITY = "US"

    def _headers(self):
        api_key = os.getenv("LITEAPI_API_KEY")

        if not api_key:
            raise ValueError("LITEAPI_API_KEY was not found")

        return {
            "X-API-Key": api_key.strip(),
            "accept": "application/json"
        }

    def _resolve_coordinates(self, iata_code):
        response = requests.get(
            url=f"{self.BASE_URL}/data/iataCodes",
            headers=self._headers(),
            timeout=30
        )

        response.raise_for_status()

        airports = response.json().get("data", [])

        for airport in airports:
            if airport.get("code", "").upper() == iata_code.upper():
                return airport["latitude"], airport["longitude"]

        raise ValueError(f"No airport found for IATA code '{iata_code}'")

    def _build_occupancies(self, travelers, rooms):
        base = travelers // rooms
        remainder = travelers % rooms

        return [
            {"adults": base + (1 if i < remainder else 0) or 1}
            for i in range(rooms)
        ]

    def search_hotels(self, destination, check_in, check_out, travelers, rooms):
        latitude, longitude = self._resolve_coordinates(destination)

        hotels_response = requests.get(
            url=f"{self.BASE_URL}/data/hotels",
            headers=self._headers(),
            params={
                "latitude": latitude,
                "longitude": longitude,
                "radius": self.DEFAULT_RADIUS_METERS,
                "limit": self.DEFAULT_HOTEL_LIMIT
            },
            timeout=30
        )

        hotels_response.raise_for_status()

        hotels_data = hotels_response.json().get("data", [])
        hotels_by_id = {hotel["id"]: hotel for hotel in hotels_data if hotel.get("id")}

        if not hotels_by_id:
            return {"hotels_by_id": {}, "rates": {"data": []}}

        rates_response = requests.post(
            url=f"{self.BASE_URL}/hotels/rates",
            headers=self._headers(),
            json={
                "hotelIds": list(hotels_by_id.keys()),
                "occupancies": self._build_occupancies(travelers, rooms),
                "currency": self.CURRENCY,
                "guestNationality": self.GUEST_NATIONALITY,
                "checkin": check_in.isoformat(),
                "checkout": check_out.isoformat(),
                "maxRatesPerHotel": 1
            },
            timeout=30
        )

        rates_response.raise_for_status()

        return {
            "hotels_by_id": hotels_by_id,
            "rates": rates_response.json()
        }
