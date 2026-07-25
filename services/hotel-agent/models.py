from datetime import date
from typing import Optional

from pydantic import BaseModel


class HotelSearchRequest(BaseModel):
    origin: str
    destination: str
    departure_date: date
    return_date: date
    travelers: int


class HotelOption(BaseModel):
    id: str
    hotel_name: str
    stars: int
    guest_rating: float
    total_price: float
    travelers: int
    rooms: int
    check_in: date
    check_out: date
    image_url: Optional[str] = None
    city: Optional[str] = None
    address: Optional[str] = None
