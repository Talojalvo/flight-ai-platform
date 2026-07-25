import type { ReactNode } from 'react'

interface SelectableCardProps {
  name: string
  value: string
  checked: boolean
  onChange: (value: string) => void
  children: ReactNode
}

// A native radio input styled as a full card. Grouping by `name` gives
// correct single-select semantics for free (not a checkbox), and the input
// stays focusable/keyboard-operable — just visually hidden, not display:none.
export function SelectableCard({ name, value, checked, onChange, children }: SelectableCardProps) {
  return (
    <label className={checked ? 'selectable-card selected' : 'selectable-card'}>
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={() => onChange(value)}
        className="selectable-card-input"
      />
      {children}
    </label>
  )
}
