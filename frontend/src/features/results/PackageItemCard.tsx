import type { ReactNode } from 'react'

interface PackageItemCardProps {
  label: string
  changeLabel: string
  isChanged: boolean
  onChangeClick: () => void
  children: ReactNode
}

export function PackageItemCard({ label, changeLabel, isChanged, onChangeClick, children }: PackageItemCardProps) {
  return (
    <div className="package-item-card">
      <div className="package-item-card-header">
        <span className="package-item-card-label">{label}</span>
        {isChanged && <span className="package-changed-badge">Changed by you</span>}
      </div>

      {children}

      <button type="button" className="package-change-button" onClick={onChangeClick}>
        {changeLabel}
      </button>
    </div>
  )
}
