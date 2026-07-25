import json

from langchain_core.prompts import ChatPromptTemplate

from agents.llm_client import get_chat_model
from agents.package_models import FlightCandidate, HotelCandidate, TravelPackageRecommendation


class InvalidPackageSelectionError(Exception):
    pass


SYSTEM_PROMPT = """You are a travel package advisor. You are given a traveler's trip details and \
three lists of candidates: outbound flights, return flights, and hotels. Every candidate has \
already been ranked by a separate deterministic scoring algorithm (rank 1 is the best in its list).

Choose exactly one outbound flight, one return flight, and one hotel from the candidates provided, \
optimizing for the best combination as a whole trip package rather than just picking the single \
best-ranked item from each list. For example, prefer a package where flight times and hotel fit \
well together over one that only maximizes individual rankings.

Rules:
- You may only choose ids that appear exactly as given in the candidate lists below. Never invent, \
  guess, or modify an id.
- Do not re-rank or second-guess the individual candidate scores; only combine the given candidates \
  into one package and explain your choice.
"""


class PackageSelectionAgent:
    def __init__(self, chain=None):
        # Injected in tests as a fake chain; built lazily otherwise so a
        # missing/invalid API key only fails at execute() time, not here.
        self._chain = chain

    def execute(
        self,
        request,
        outbound_candidates: list[FlightCandidate],
        return_candidates: list[FlightCandidate],
        hotel_candidates: list[HotelCandidate],
    ) -> TravelPackageRecommendation:
        if self._chain is None:
            self._chain = self._build_chain()

        payload = self._build_payload(request, outbound_candidates, return_candidates, hotel_candidates)
        result = self._chain.invoke({"candidates": payload})

        outbound_ids = {candidate.id for candidate in outbound_candidates}
        return_ids = {candidate.id for candidate in return_candidates}
        hotel_ids = {candidate.id for candidate in hotel_candidates}

        if result.outbound_flight_id not in outbound_ids:
            raise InvalidPackageSelectionError(
                f"outbound_flight_id '{result.outbound_flight_id}' is not one of the provided candidates"
            )
        if result.return_flight_id not in return_ids:
            raise InvalidPackageSelectionError(
                f"return_flight_id '{result.return_flight_id}' is not one of the provided candidates"
            )
        if result.hotel_id not in hotel_ids:
            raise InvalidPackageSelectionError(
                f"hotel_id '{result.hotel_id}' is not one of the provided candidates"
            )

        return result

    def _build_chain(self):
        model = get_chat_model()
        prompt = ChatPromptTemplate.from_messages([
            ("system", SYSTEM_PROMPT),
            ("human", "{candidates}"),
        ])
        return prompt | model.with_structured_output(TravelPackageRecommendation)

    def _build_payload(self, request, outbound_candidates, return_candidates, hotel_candidates) -> str:
        return json.dumps({
            "trip": {
                "origin": request.origin,
                "destination": request.destination,
                "departure_date": str(request.departure_date),
                "return_date": str(request.return_date),
                "travelers": request.travelers,
            },
            "outbound_flights": [candidate.model_dump() for candidate in outbound_candidates],
            "return_flights": [candidate.model_dump() for candidate in return_candidates],
            "hotels": [candidate.model_dump() for candidate in hotel_candidates],
        }, indent=2)
