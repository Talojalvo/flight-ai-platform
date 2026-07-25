from agents.flight_recommendation_agent import FlightRecommendationAgent
from agents.hotel_recommendation_agent import HotelRecommendationAgent
from agents.package_models import FlightCandidate, HotelCandidate, PackageSelection
from agents.package_selection_agent import PackageSelectionAgent
from clients.flight_agent_client import FlightAgentClient
from clients.hotel_agent_client import HotelAgentClient
from registry.agent_registry import registry

TOP_CANDIDATES = 5


class OrchestratorAgent:
    def __init__(self):
        self.flight_client = FlightAgentClient()
        self.hotel_client = HotelAgentClient()
        self.flight_recommendation_agent = FlightRecommendationAgent()
        self.hotel_recommendation_agent = HotelRecommendationAgent()
        self.package_selection_agent = PackageSelectionAgent()

    def create_trip_plan(self, request):
        return registry.timed_call("orchestrator", lambda: self._create_trip_plan(request))

    def _create_trip_plan(self, request):
        flights = registry.timed_call("flight-agent", lambda: self.flight_client.search(request))
        hotels = (
            registry.timed_call("hotel-agent", lambda: self.hotel_client.search(request))
            if request.include_hotel
            else []
        )

        recommended_flights = registry.timed_call(
            "flight-recommendation-agent",
            lambda: self.flight_recommendation_agent.execute(flights)
        )
        recommended_hotels = (
            registry.timed_call(
                "hotel-recommendation-agent",
                lambda: self.hotel_recommendation_agent.execute(hotels)
            )
            if request.include_hotel
            else []
        )

        package = (
            self._select_package(request, flights, hotels, recommended_flights, recommended_hotels)
            if request.include_hotel
            else None
        )

        return {
            "flights": flights,
            "hotels": hotels,
            "recommendations": {
                "flights": recommended_flights,
                "hotels": recommended_hotels
            },
            "package": package.model_dump() if package else None
        }

    def _select_package(self, request, flights, hotels, recommended_flights, recommended_hotels):
        outbound_candidates = self._flight_candidates(
            flights.get("outbound", []), recommended_flights.get("outbound", [])
        )
        return_candidates = self._flight_candidates(
            flights.get("return_flights", []), recommended_flights.get("return_flights", [])
        )
        hotel_candidates = self._hotel_candidates(hotels, recommended_hotels)

        if not outbound_candidates or not return_candidates or not hotel_candidates:
            return None

        try:
            result = registry.timed_call(
                "package-selection-agent",
                lambda: self.package_selection_agent.execute(
                    request, outbound_candidates, return_candidates, hotel_candidates
                )
            )
            return PackageSelection(**result.model_dump(), source="llm")
        except Exception:
            # Disabled, unavailable, timed out, or returned an invalid/unknown
            # id: the deterministic rank-1 picks are always a valid package.
            return self._fallback_package(outbound_candidates, return_candidates, hotel_candidates)

    def _flight_candidates(self, legs: list, ranked: list) -> list[FlightCandidate]:
        legs_by_id = {leg["id"]: leg for leg in legs}
        top = sorted(ranked, key=lambda entry: entry["rank"])[:TOP_CANDIDATES]

        candidates = []
        for entry in top:
            leg = legs_by_id.get(entry["id"])
            if leg is None:
                continue
            candidates.append(FlightCandidate(
                id=leg["id"],
                rank=entry["rank"],
                score=entry["score"],
                airline=leg["airline"],
                departure_time=leg["departure_time"],
                arrival_time=leg["arrival_time"],
                stops=leg["stops"],
                price=leg["price"],
            ))
        return candidates

    def _hotel_candidates(self, hotels: list, ranked: list) -> list[HotelCandidate]:
        hotels_by_id = {hotel["id"]: hotel for hotel in hotels}
        top = sorted(ranked, key=lambda entry: entry["rank"])[:TOP_CANDIDATES]

        candidates = []
        for entry in top:
            hotel = hotels_by_id.get(entry["id"])
            if hotel is None:
                continue
            candidates.append(HotelCandidate(
                id=hotel["id"],
                rank=entry["rank"],
                score=entry["score"],
                hotel_name=hotel["hotel_name"],
                stars=hotel["stars"],
                guest_rating=hotel["guest_rating"],
                total_price=hotel["total_price"],
            ))
        return candidates

    def _fallback_package(self, outbound_candidates, return_candidates, hotel_candidates) -> PackageSelection:
        outbound = outbound_candidates[0]
        return_flight = return_candidates[0]
        hotel = hotel_candidates[0]

        return PackageSelection(
            outbound_flight_id=outbound.id,
            return_flight_id=return_flight.id,
            hotel_id=hotel.id,
            summary=(
                f"Top-ranked outbound flight with {outbound.airline}, top-ranked return flight "
                f"with {return_flight.airline}, and top-ranked hotel {hotel.hotel_name}."
            ),
            reasoning=(
                "AI package selection was unavailable, so this package uses the highest-ranked "
                "outbound flight, return flight, and hotel from the deterministic recommendation "
                "agents."
            ),
            advantages=["Each option is individually the top-ranked choice in its category."],
            tradeoffs=["This combination was not evaluated together as a package."],
            recommendation="A solid default package based on our ranking algorithm.",
            source="fallback",
        )
