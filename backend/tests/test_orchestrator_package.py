import json
from datetime import date

from agents.package_models import TravelPackageRecommendation
from agents.package_selection_agent import PackageSelectionAgent
from models import TripRequest
from orchestrator import OrchestratorAgent
from registry.agent_registry import registry


class _FakeChain:
    """Stands in for `prompt | model.with_structured_output(...)`."""

    def __init__(self, result=None, error=None):
        self.result = result
        self.error = error
        self.last_payload = None

    def invoke(self, payload):
        self.last_payload = payload
        if self.error is not None:
            raise self.error
        return self.result


def _valid_recommendation(outbound_id="out-0", return_id="ret-0", hotel_id="hotel-0"):
    return TravelPackageRecommendation(
        outbound_flight_id=outbound_id,
        return_flight_id=return_id,
        hotel_id=hotel_id,
        summary="A well-balanced package.",
        reasoning="Best overall combination of timing and price.",
        advantages=["Direct flights both ways"],
        tradeoffs=[],
        recommendation="Book this package.",
    )


def _make_request(include_hotel=True) -> TripRequest:
    return TripRequest(
        origin="TLV",
        destination="FCO",
        departure_date=date(2026, 8, 1),
        return_date=date(2026, 8, 5),
        travelers=1,
        include_hotel=include_hotel,
    )


def _outbound_leg(index: int, price: float, hour: int) -> dict:
    return {
        "id": f"out-{index}",
        "airline": "Test Air",
        "departure_airport": "TLV",
        "arrival_airport": "FCO",
        "departure_time": f"2026-08-01T{hour:02d}:00:00",
        "arrival_time": f"2026-08-01T{hour + 2:02d}:00:00",
        "duration_minutes": 120,
        "stops": 0,
        "price": price,
    }


def _return_leg(index: int, price: float, hour: int) -> dict:
    return {
        "id": f"ret-{index}",
        "airline": "Test Air",
        "departure_airport": "FCO",
        "arrival_airport": "TLV",
        "departure_time": f"2026-08-05T{hour:02d}:00:00",
        "arrival_time": f"2026-08-05T{hour + 2:02d}:00:00",
        "duration_minutes": 120,
        "stops": 0,
        "price": price,
    }


def _hotel(index: int, price: float, rating: float) -> dict:
    return {
        "id": f"hotel-{index}",
        "hotel_name": f"Hotel {index}",
        "stars": 4,
        "guest_rating": rating,
        "total_price": price,
        "travelers": 1,
        "rooms": 1,
        "check_in": "2026-08-01",
        "check_out": "2026-08-05",
        "image_url": None,
        "city": "Rome",
        "address": None,
    }


class _FakeFlightClient:
    def __init__(self, flights):
        self._flights = flights

    def search(self, request):
        return self._flights


class _FakeHotelClient:
    def __init__(self, hotels):
        self._hotels = hotels

    def search(self, request):
        return self._hotels


def _build_orchestrator(num_outbound=8, num_return=1, num_hotels=8, package_selection_agent=None):
    orchestrator = OrchestratorAgent()

    outbound = [_outbound_leg(i, price=300 + i * 10, hour=8) for i in range(num_outbound)]
    return_flights = [_return_leg(i, price=300 + i * 10, hour=22) for i in range(num_return)]
    hotels = [_hotel(i, price=200 + i * 50, rating=8.0 + (i % 3) * 0.5) for i in range(num_hotels)]

    orchestrator.flight_client = _FakeFlightClient({"outbound": outbound, "return_flights": return_flights})
    orchestrator.hotel_client = _FakeHotelClient(hotels)

    if package_selection_agent is not None:
        orchestrator.package_selection_agent = package_selection_agent

    return orchestrator


def test_package_uses_llm_result_when_selection_succeeds():
    recommendation = _valid_recommendation(outbound_id="out-0", return_id="ret-0", hotel_id="hotel-0")
    agent = PackageSelectionAgent(chain=_FakeChain(result=recommendation))
    orchestrator = _build_orchestrator(package_selection_agent=agent)

    result = orchestrator.create_trip_plan(_make_request())

    assert result["package"]["source"] == "llm"
    assert result["package"]["outbound_flight_id"] == "out-0"
    assert result["package"]["return_flight_id"] == "ret-0"
    assert result["package"]["hotel_id"] == "hotel-0"


def test_package_only_offers_top_5_candidates_per_category_to_the_llm():
    chain = _FakeChain(result=_valid_recommendation(outbound_id="out-0", return_id="ret-0", hotel_id="hotel-0"))
    agent = PackageSelectionAgent(chain=chain)
    orchestrator = _build_orchestrator(num_outbound=8, num_return=1, num_hotels=8, package_selection_agent=agent)

    orchestrator.create_trip_plan(_make_request())

    payload = json.loads(chain.last_payload["candidates"])
    assert len(payload["outbound_flights"]) == 5
    assert len(payload["hotels"]) == 5
    assert len(payload["return_flights"]) == 1  # only 1 return flight existed


def test_package_falls_back_when_llm_raises():
    agent = PackageSelectionAgent(chain=_FakeChain(error=RuntimeError("provider down")))
    orchestrator = _build_orchestrator(package_selection_agent=agent)

    result = orchestrator.create_trip_plan(_make_request())

    assert result["package"]["source"] == "fallback"
    # rank-1 by score is the cheapest/best-timed leg in this synthetic batch: out-0
    assert result["package"]["outbound_flight_id"] == "out-0"
    assert result["package"]["hotel_id"] is not None


def test_package_falls_back_when_llm_returns_unknown_id():
    bad_recommendation = _valid_recommendation(outbound_id="not-a-real-id")
    agent = PackageSelectionAgent(chain=_FakeChain(result=bad_recommendation))
    orchestrator = _build_orchestrator(package_selection_agent=agent)

    result = orchestrator.create_trip_plan(_make_request())

    assert result["package"]["source"] == "fallback"


def test_package_falls_back_when_agent_is_disabled_via_registry():
    recommendation = _valid_recommendation(outbound_id="out-0", return_id="ret-0", hotel_id="hotel-0")
    agent = PackageSelectionAgent(chain=_FakeChain(result=recommendation))
    orchestrator = _build_orchestrator(package_selection_agent=agent)

    registry.set_enabled("package-selection-agent", False)

    result = orchestrator.create_trip_plan(_make_request())

    assert result["package"]["source"] == "fallback"


def test_package_is_none_when_hotel_not_requested():
    agent = PackageSelectionAgent(chain=_FakeChain(result=_valid_recommendation()))
    orchestrator = _build_orchestrator(package_selection_agent=agent)

    result = orchestrator.create_trip_plan(_make_request(include_hotel=False))

    assert result["package"] is None
    assert result["hotels"] == []


def test_existing_response_fields_are_unchanged_on_success():
    agent = PackageSelectionAgent(chain=_FakeChain(result=_valid_recommendation(
        outbound_id="out-0", return_id="ret-0", hotel_id="hotel-0"
    )))
    orchestrator = _build_orchestrator(package_selection_agent=agent)

    result = orchestrator.create_trip_plan(_make_request())

    assert set(result.keys()) == {"flights", "hotels", "recommendations", "package"}
    assert len(result["flights"]["outbound"]) == 8
    assert len(result["recommendations"]["flights"]["outbound"]) == 8
