export interface TripRequestPayload {
  origin: string
  destination: string
  departure_date: string
  return_date: string
  travelers: number
  include_hotel: boolean
}

export interface FlightLegOption {
  id: string
  airline: string
  departure_airport: string
  arrival_airport: string
  departure_time: string
  arrival_time: string
  duration_minutes: number
  stops: number
  price: number
}

export interface HotelOption {
  id: string
  hotel_name: string
  stars: number
  guest_rating: number
  total_price: number
  travelers: number
  rooms: number
  check_in: string
  check_out: string
  image_url: string | null
  city: string | null
  address: string | null
}

export type AgentTypeKind = 'Internal' | 'External'
export type AgentRuntimeStatus = 'Online' | 'Offline' | 'Busy'
export type AgentHealthStatus = 'Healthy' | 'Unhealthy' | 'Unknown'

export interface AgentInfo {
  id: string
  name: string
  type: AgentTypeKind
  description: string
  status: AgentRuntimeStatus
  health: AgentHealthStatus
  enabled: boolean
  last_execution_time: string | null
  avg_response_time_ms: number | null
  endpoint?: string
  last_error?: string
}

export interface AgentHistoryEntry {
  timestamp: string
  operation: string
  duration_ms: number
  status: 'Success' | 'Failed'
}

export interface RecommendationEntry {
  id: string
  score: number
  rank: number
}

export interface TripPlanResult {
  flights: {
    outbound: FlightLegOption[]
    return_flights: FlightLegOption[]
  }
  hotels: HotelOption[]
  recommendations: {
    flights: {
      outbound: RecommendationEntry[]
      return_flights: RecommendationEntry[]
    }
    hotels: RecommendationEntry[]
  }
}
