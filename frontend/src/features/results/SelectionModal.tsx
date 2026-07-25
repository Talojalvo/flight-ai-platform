import { useEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

interface SelectionModalProps {
  title: string
  onCancel: () => void
  onConfirm: () => void
  confirmDisabled?: boolean
  children: ReactNode
}

// Portalled to document.body rather than rendered in place: ResultsPage sits
// under Framer Motion wrappers, and a transform on any ancestor would turn
// position:fixed into "fixed to that ancestor" instead of the viewport.
export function SelectionModal({ title, onCancel, onConfirm, confirmDisabled, children }: SelectionModalProps) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onCancel()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onCancel])

  return createPortal(
    <div className="selection-modal-backdrop" onClick={onCancel}>
      <div className="selection-modal" onClick={(event) => event.stopPropagation()} role="dialog" aria-modal="true" aria-label={title}>
        <div className="selection-modal-header">
          <h2>{title}</h2>
          <button type="button" className="selection-modal-close" onClick={onCancel} aria-label="Cancel">
            ×
          </button>
        </div>

        <div className="selection-modal-body">{children}</div>

        <div className="selection-modal-footer button-row">
          <button type="button" className="secondary-button" onClick={onCancel}>
            Cancel
          </button>
          <button type="button" className="primary-button" onClick={onConfirm} disabled={confirmDisabled}>
            Confirm
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
