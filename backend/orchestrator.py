from agents.flight_recommendation_agent import FlightRecommendationAgent
from agents.hotel_recommendation_agent import HotelRecommendationAgent
from clients.flight_agent_client import FlightAgentClient
from clients.hotel_agent_client import HotelAgentClient
from registry.agent_registry import registry


class OrchestratorAgent:
    def __init__(self):
        self.flight_client = FlightAgentClient()
        self.hotel_client = HotelAgentClient()
        self.flight_recommendation_agent = FlightRecommendationAgent()
        self.hotel_recommendation_agent = HotelRecommendationAgent()

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

        return {
            "flights": flights,
            "hotels": hotels,
            "recommendations": {
                "flights": recommended_flights,
                "hotels": recommended_hotels
            }
        }
