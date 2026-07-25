import { AIRPORTS } from '../airports'

interface AirportSelectFieldProps {
  label: string
  value: string | null
  onSelect: (code: string) => void
  excludeCode?: string | null
}

export function AirportSelectField({ label, value, onSelect, excludeCode }: AirportSelectFieldProps) {
  const options = AIRPORTS.filter((airport) => airport.code !== excludeCode)

  return (
    <label className="field">
      <span className="field-label">{label}</span>
      <select
        className="field-select"
        value={value ?? ''}
        onChange={(event) => onSelect(event.target.value)}
      >
        <option value="" disabled>
          Select an airport
        </option>
        {options.map((airport) => (
          <option key={airport.code} value={airport.code}>
            {airport.city} ({airport.code})
          </option>
        ))}
      </select>
    </label>
  )
}
