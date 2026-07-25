interface ContinueButtonProps {
  disabled: boolean
  onClick: () => void
  label?: string
}

export function ContinueButton({ disabled, onClick, label = 'Continue' }: ContinueButtonProps) {
  return (
    <button type="button" className="primary-button" disabled={disabled} onClick={onClick}>
      {label}
    </button>
  )
}
