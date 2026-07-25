from datetime import date

import pytest

from agents.package_models import FlightCandidate, HotelCandidate, TravelPackageRecommendation
from agents.package_selection_agent import InvalidPackageSelectionError, PackageSelectionAgent
from models import TripRequest


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


def _make_request() -> TripRequest:
    return TripRequest(
        origin="TLV",
        destination="FCO",
        departure_date=date(2026, 8, 1),
        return_date=date(2026, 8, 5),
        travelers=1,
        include_hotel=True,
    )


def _outbound_candidates():
    return [
        FlightCandidate(
            id="out-1", rank=1, score=115.0, airline="Wizz Air",
            departure_time="2026-08-01T08:00:00", arrival_time="2026-08-01T10:00:00",
            stops=0, price=200.0,
        ),
        FlightCandidate(
            id="out-2", rank=2, score=100.0, airline="ITA",
            departure_time="2026-08-01T14:00:00", arrival_time="2026-08-01T16:00:00",
            stops=0, price=150.0,
        ),
    ]


def _return_candidates():
    return [
        FlightCandidate(
            id="ret-1", rank=1, score=110.0, airline="Wizz Air",
            departure_time="2026-08-05T22:00:00", arrival_time="2026-08-06T00:00:00",
            stops=0, price=210.0,
        ),
    ]


def _hotel_candidates():
    return [
        HotelCandidate(
            id="hotel-1", rank=1, score=127.0, hotel_name="Central Hotel",
            stars=4, guest_rating=8.9, total_price=400.0,
        ),
    ]


def _valid_recommendation(outbound_id="out-1", return_id="ret-1", hotel_id="hotel-1"):
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


def test_execute_returns_llm_result_when_selection_is_valid():
    chain = _FakeChain(result=_valid_recommendation())
    agent = PackageSelectionAgent(chain=chain)

    result = agent.execute(_make_request(), _outbound_candidates(), _return_candidates(), _hotel_candidates())

    assert result.outbound_flight_id == "out-1"
    assert result.return_flight_id == "ret-1"
    assert result.hotel_id == "hotel-1"


def test_execute_only_sends_provided_candidates_to_the_chain():
    chain = _FakeChain(result=_valid_recommendation())
    agent = PackageSelectionAgent(chain=chain)

    agent.execute(_make_request(), _outbound_candidates(), _return_candidates(), _hotel_candidates())

    assert "out-1" in chain.last_payload["candidates"]
    assert "out-2" in chain.last_payload["candidates"]
    assert "hotel-1" in chain.last_payload["candidates"]


@pytest.mark.parametrize(
    "outbound_id,return_id,hotel_id",
    [
        ("does-not-exist", "ret-1", "hotel-1"),
        ("out-1", "does-not-exist", "hotel-1"),
        ("out-1", "ret-1", "does-not-exist"),
    ],
)
def test_execute_rejects_ids_outside_the_candidate_set(outbound_id, return_id, hotel_id):
    chain = _FakeChain(result=_valid_recommendation(outbound_id, return_id, hotel_id))
    agent = PackageSelectionAgent(chain=chain)

    with pytest.raises(InvalidPackageSelectionError):
        agent.execute(_make_request(), _outbound_candidates(), _return_candidates(), _hotel_candidates())


def test_execute_propagates_chain_failures():
    chain = _FakeChain(error=RuntimeError("provider unavailable"))
    agent = PackageSelectionAgent(chain=chain)

    with pytest.raises(RuntimeError):
        agent.execute(_make_request(), _outbound_candidates(), _return_candidates(), _hotel_candidates())
