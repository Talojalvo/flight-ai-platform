export interface Airport {
  code: string
  city: string
  country: string
}

export const AIRPORTS: Airport[] = [
  { code: 'JFK', city: 'New York', country: 'USA' },
  { code: 'LAX', city: 'Los Angeles', country: 'USA' },
  { code: 'TLV', city: 'Tel Aviv', country: 'Israel' },
  { code: 'FCO', city: 'Rome', country: 'Italy' },
  { code: 'LHR', city: 'London', country: 'UK' },
  { code: 'CDG', city: 'Paris', country: 'France' },
  { code: 'AMS', city: 'Amsterdam', country: 'Netherlands' },
  { code: 'BCN', city: 'Barcelona', country: 'Spain' },
  { code: 'DXB', city: 'Dubai', country: 'UAE' },
  { code: 'IST', city: 'Istanbul', country: 'Turkey' }
]
