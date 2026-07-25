interface BackButtonProps {
  onClick: () => void
}

export function BackButton({ onClick }: BackButtonProps) {
  return (
    <button type="button" className="secondary-button" onClick={onClick}>
      Back
    </button>
  )
}
