class HotelRecommendationAgent:
    RATING_SCALE = 10

    # Rating and price are scored independently (each normalized to the
    # batch's own range) rather than blended into a rating/price "value"
    # metric, which would double-count rating. Rating outweighs price 3:1,
    # mirroring FlightRecommendationAgent's time:price ratio.
    W_RATING = 100
    W_PRICE = 33

    def execute(self, hotels: list) -> list:
        ratings = [self._clamp_rating(hotel.get("guest_rating", 0)) for hotel in hotels]
        prices = [hotel.get("total_price", 0) or 0 for hotel in hotels]

        max_rating = max(ratings) if ratings else 0
        lo_price = min(prices) if prices else 0
        hi_price = max(prices) if prices else 0

        scored = []
        for hotel, rating in zip(hotels, ratings):
            try:
                rating_score = rating / max_rating if max_rating > 0 else 0.0
                price = hotel.get("total_price", hi_price) or hi_price
                price_score = (
                    (hi_price - price) / (hi_price - lo_price) if hi_price > lo_price else 1.0
                )

                total = self.W_RATING * rating_score + self.W_PRICE * price_score
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
