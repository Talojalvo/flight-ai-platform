interface ChoiceOption<T> {
  label: string
  value: T
}

interface ChoiceFieldProps<T> {
  label: string
  options: ChoiceOption<T>[]
  value: T | null
  onSelect: (value: T) => void
}

export function ChoiceField<T>({ label, options, value, onSelect }: ChoiceFieldProps<T>) {
  return (
    <div className="field">
      {label && <span className="field-label">{label}</span>}
      <div className="choice-group">
        {options.map((option) => (
          <button
            key={String(option.value)}
            type="button"
            className={option.value === value ? 'choice-button selected' : 'choice-button'}
            onClick={() => onSelect(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  )
}
