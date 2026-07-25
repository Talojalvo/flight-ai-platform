from math import ceil

from models import HotelOption
from provider import LiteApiProvider


class HotelAgent:
    def __init__(self):
        self.provider = LiteApiProvider()

    def execute(self, request):
        rooms = ceil(request.travelers / 2)

        data = self.provider.search_hotels(
            destination=request.destination,
            check_in=request.departure_date,
            check_out=request.return_date,
            travelers=request.travelers,
            rooms=rooms
        )

        hotels_by_id = data.get("hotels_by_id", {})
        rates_data = data.get("rates", {}).get("data", [])

        hotel_options = []

        for hotel_rates in rates_data:
            hotel_meta = hotels_by_id.get(hotel_rates.get("hotelId"))
            room_types = hotel_rates.get("roomTypes", [])

            if not hotel_meta or not room_types:
                continue

            cheapest_offer = min(
                room_types,
                key=lambda rt: rt.get("offerRetailRate", {}).get("amount", float("inf"))
            )
            price = cheapest_offer.get("offerRetailRate", {}).get("amount")

            if price is None:
                continue

            hotel_option = HotelOption(
                id=str(hotel_meta.get("id", hotel_rates.get("hotelId", ""))),
                hotel_name=hotel_meta.get("name", "Unknown"),
                stars=hotel_meta.get("stars", 0),
                guest_rating=hotel_meta.get("rating", 0.0),
                total_price=price,
                travelers=request.travelers,
                rooms=rooms,
                check_in=request.departure_date,
                check_out=request.return_date,
                image_url=hotel_meta.get("main_photo") or hotel_meta.get("thumbnail"),
                city=hotel_meta.get("city"),
                address=hotel_meta.get("address")
            )

            hotel_options.append(hotel_option)

        hotel_options.sort(key=lambda hotel: hotel.total_price)

        return hotel_options
