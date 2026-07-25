import type { HotelOption } from '../../api/types'
import { formatPrice } from './format'

interface HotelCardProps {
  hotel: HotelOption
}

export function HotelCard({ hotel }: HotelCardProps) {
  const location = [hotel.address, hotel.city].filter(Boolean).join(', ')

  return (
    <div className="hotel-card">
      {hotel.image_url && (
        <img src={hotel.image_url} alt={hotel.hotel_name} className="hotel-card-image" loading="lazy" />
      )}
      <div className="hotel-card-body">
        <div className="hotel-card-row hotel-card-name">
          <span>{hotel.hotel_name}</span>
          <span className="flight-card-price">{formatPrice(hotel.total_price)}</span>
        </div>
        <div className="hotel-card-meta">
          {hotel.stars}★ · {hotel.guest_rating.toFixed(1)} rating
        </div>
        {location && <div className="hotel-card-location">{location}</div>}
      </div>
    </div>
  )
}
