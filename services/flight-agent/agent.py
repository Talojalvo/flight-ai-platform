from models import FlightLegOption
from provider import IgnavProvider


class FlightAgent:
    def __init__(self):
        self.provider = IgnavProvider()

    def execute(self, request):
        data = self.provider.get_round_trip_fares(
            origin=request.origin,
            destination=request.destination,
            departure_date=request.departure_date,
            return_date=request.return_date,
            travelers=request.travelers
        )

        outbound_options = []
        return_options = []

        for itinerary in data.get("itineraries", []):
            ignav_id = itinerary.get("ignav_id")
            outbound = itinerary.get("outbound", {})
            inbound = itinerary.get("inbound", {})

            if not ignav_id or not outbound.get("segments") or not inbound.get("segments"):
                continue

            price = float(itinerary.get("price", {}).get("amount", 0))

            # Ignav prices each itinerary as a single combined round-trip
            # fare; it never prices the outbound/inbound legs independently.
            # Splitting the fare by each leg's share of total flight
            # duration lets the results UI show a standalone price per leg
            # while still summing back to the original fare
            # (outbound_price + return_price == price). This also means the
            # UI can let a user pair an outbound leg from one itinerary with
            # a return leg from another, a combination Ignav never actually
            # priced together — an accepted consequence of letting outbound
            # and return be selected independently.
            outbound_duration = outbound.get("duration_minutes", 0)
            inbound_duration = inbound.get("duration_minutes", 0)
            total_duration = outbound_duration + inbound_duration

            outbound_share = outbound_duration / total_duration if total_duration > 0 else 0.5

            outbound_price = round(price * outbound_share, 2)
            inbound_price = round(price - outbound_price, 2)

            outbound_options.append(
                self._build_leg_option(f"{ignav_id}-outbound", outbound, outbound_price)
            )
            return_options.append(
                self._build_leg_option(f"{ignav_id}-inbound", inbound, inbound_price)
            )

        return {"outbound": outbound_options, "return_flights": return_options}

    def _build_leg_option(self, leg_id, leg, price):
        segments = leg.get("segments", [])
        first_segment = segments[0]
        last_segment = segments[-1]

        airline = (
            first_segment.get("operating_carrier_name")
            or leg.get("carrier")
            or "Unknown"
        )

        return FlightLegOption(
            id=leg_id,
            airline=airline,
            departure_airport=first_segment.get("departure_airport", ""),
            arrival_airport=last_segment.get("arrival_airport", ""),
            departure_time=first_segment.get("departure_time_local", ""),
            arrival_time=last_segment.get("arrival_time_local", ""),
            duration_minutes=leg.get("duration_minutes", 0),
            stops=len(segments) - 1,
            price=price
        )
