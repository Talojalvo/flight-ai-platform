interface DateFieldProps {
  label: string
  value: string | null
  onChange: (date: string) => void
  min?: string
}

export function DateField({ label, value, onChange, min }: DateFieldProps) {
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      <input
        type="date"
        className="field-input"
        value={value ?? ''}
        min={min}
        onChange={(event) => {
          if (event.target.value) {
            onChange(event.target.value)
          }
        }}
      />
    </label>
  )
}
