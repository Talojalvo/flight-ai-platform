from typing import Literal

from pydantic import BaseModel, Field


class FlightCandidate(BaseModel):
    id: str
    rank: int
    score: float
    airline: str
    departure_time: str
    arrival_time: str
    stops: int
    price: float


class HotelCandidate(BaseModel):
    id: str
    rank: int
    score: float
    hotel_name: str
    stars: int
    guest_rating: float
    total_price: float


class TravelPackageRecommendation(BaseModel):
    outbound_flight_id: str = Field(
        description="Id of the chosen outbound flight, copied exactly from the provided outbound flight candidates."
    )
    return_flight_id: str = Field(
        description="Id of the chosen return flight, copied exactly from the provided return flight candidates."
    )
    hotel_id: str = Field(
        description="Id of the chosen hotel, copied exactly from the provided hotel candidates."
    )
    summary: str = Field(description="A one or two sentence summary of the recommended package.")
    reasoning: str = Field(
        description="Why this specific combination of outbound flight, return flight, and hotel "
        "is the best overall package, not just the best individual items."
    )
    advantages: list[str] = Field(description="Key advantages of this package.")
    tradeoffs: list[str] = Field(
        default_factory=list, description="Notable trade-offs or downsides of this package, if any."
    )
    recommendation: str = Field(description="A concise, traveler-facing recommendation sentence.")


class PackageSelection(TravelPackageRecommendation):
    source: Literal["llm", "fallback"]
