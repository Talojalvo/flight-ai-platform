from datetime import date

from pydantic import BaseModel


class FlightSearchRequest(BaseModel):
    origin: str
    destination: str
    departure_date: date
    return_date: date
    travelers: int


class FlightLegOption(BaseModel):
    id: str
    airline: str
    departure_airport: str
    arrival_airport: str
    departure_time: str
    arrival_time: str
    duration_minutes: int
    stops: int
    price: float
