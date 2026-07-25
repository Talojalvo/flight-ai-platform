from datetime import datetime


class FlightRecommendationAgent:
    OUTBOUND_TARGET_MIN = 8 * 60
    RETURN_TARGET_MIN = 22 * 60

    # Direct is a de facto veto: its max-possible loss (100) still beats the
    # best a connecting flight can score from time+price alone (15+5=20).
    # Among flights with the same stop count, time outweighs price 3:1.
    W_DIRECT = 100
    W_TIME = 15
    W_PRICE = 5

    def execute(self, flights: dict) -> dict:
        return {
            "outbound": self._rank(flights.get("outbound", []), self.OUTBOUND_TARGET_MIN),
            "return_flights": self._rank(flights.get("return_flights", []), self.RETURN_TARGET_MIN)
        }

    def _rank(self, legs: list, target_min: int) -> list:
        prices = [leg.get("price", 0) or 0 for leg in legs]
        lo = min(prices) if prices else 0
        hi = max(prices) if prices else 0

        scored = []
        for leg in legs:
            try:
                direct_score = 1.0 if leg.get("stops", 1) == 0 else 0.0
                time_score = self._time_score(leg.get("departure_time", ""), target_min)
                price = leg.get("price", hi) or hi
                price_score = (hi - price) / (hi - lo) if hi > lo else 1.0

                total = (
                    self.W_DIRECT * direct_score
                    + self.W_TIME * time_score
                    + self.W_PRICE * price_score
                )
            except (TypeError, ValueError):
                total = 0.0

            scored.append({"id": leg.get("id"), "score": round(total, 4)})

        scored.sort(key=lambda entry: entry["score"], reverse=True)

        for rank, entry in enumerate(scored, start=1):
            entry["rank"] = rank

        return scored

    def _time_score(self, departure_time: str, target_min: int) -> float:
        try:
            parsed = datetime.fromisoformat(departure_time)
            minutes = parsed.hour * 60 + parsed.minute
        except (ValueError, TypeError):
            return 0.0

        diff = abs(minutes - target_min)
        diff = min(diff, 1440 - diff)

        return 1 - (diff / 720)
