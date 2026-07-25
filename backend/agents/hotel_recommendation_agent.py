class HotelRecommendationAgent:
    RATING_SCALE = 10

    W_RATING = 100
    W_VALUE = 10

    def execute(self, hotels: list) -> list:
        ratings = [self._clamp_rating(hotel.get("guest_rating", 0)) for hotel in hotels]
        values = [self._value(hotel) for hotel in hotels]

        max_rating = max(ratings) if ratings else 0
        lo_value = min(values) if values else 0
        hi_value = max(values) if values else 0

        scored = []
        for hotel, rating, value in zip(hotels, ratings, values):
            try:
                rating_score = rating / max_rating if max_rating > 0 else 0.0
                value_score = (
                    (value - lo_value) / (hi_value - lo_value) if hi_value > lo_value else 1.0
                )

                total = self.W_RATING * rating_score + self.W_VALUE * value_score
            except (TypeError, ValueError, ZeroDivisionError):
                total = 0.0

            scored.append({"id": hotel.get("id"), "score": round(total, 4)})

        scored.sort(key=lambda entry: entry["score"], reverse=True)

        for rank, entry in enumerate(scored, start=1):
            entry["rank"] = rank

        return scored

    def _clamp_rating(self, rating) -> float:
        try:
            rating = float(rating)
        except (TypeError, ValueError):
            return 0.0

        return max(0.0, min(rating, self.RATING_SCALE))

    def _value(self, hotel: dict) -> float:
        price = hotel.get("total_price")
        rating = self._clamp_rating(hotel.get("guest_rating", 0))

        if not price or price <= 0:
            return 0.0

        return rating / price
