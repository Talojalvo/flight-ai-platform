from datetime import date

from pydantic import BaseModel, Field


class TripRequest(BaseModel):
    origin: str
    destination: str
    departure_date: date
    return_date: date
    travelers: int = Field(gt=0)
    include_hotel: bool