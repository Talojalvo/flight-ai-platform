interface TravelerCountFieldProps {
  value: number
  onChange: (count: number) => void
  min?: number
  max?: number
}

export function TravelerCountField({ value, onChange, min = 1, max = 9 }: TravelerCountFieldProps) {
  return (
    <div className="field">
      <span className="field-label">Number of Travelers</span>
      <div className="stepper">
        <button type="button" onClick={() => onChange(Math.max(min, value - 1))} disabled={value <= min}>
          −
        </button>
        <span className="stepper-value">{value}</span>
        <button type="button" onClick={() => onChange(Math.min(max, value + 1))}>
          +
        </button>
      </div>
    </div>
  )
}
