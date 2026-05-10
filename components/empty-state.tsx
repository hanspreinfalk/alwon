import type { ReactNode } from 'react'

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="grid-bg flex flex-col items-center justify-center py-24 px-8 text-center">
      {icon && (
        <div className="mb-4" style={{ color: 'var(--fg-dim)', opacity: 0.5 }}>
          {icon}
        </div>
      )}
      <p className="text-base font-medium mb-1" style={{ color: 'var(--fg)' }}>{title}</p>
      {description && (
        <p style={{ color: 'var(--fg-muted)', fontSize: '0.875rem' }}>{description}</p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}
