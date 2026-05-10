import type { ReactNode } from 'react'

interface SectionHeaderProps {
  number: string
  title: string
  action?: ReactNode
}

export function SectionHeader({ number, title, action }: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex items-center gap-2">
        <span style={{ color: 'var(--brand-accent)', fontSize: 8, lineHeight: 1 }}>●</span>
        <span className="section-label">
          {number} / {title}
        </span>
      </div>
      {action && (
        <div className="section-label" style={{ color: 'var(--fg-muted)' }}>
          {action}
        </div>
      )}
    </div>
  )
}
