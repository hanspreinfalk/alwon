import type { EventSeverity } from '@/lib/types'

const DOT_COLORS: Record<string, string> = {
  flagged: 'var(--danger)',
  resolved: 'var(--success)',
  investigating: 'var(--warning)',
  dismissed: 'var(--fg-dim)',
  info: 'var(--brand-accent)',
  warning: 'var(--warning)',
  online: 'var(--success)',
  degraded: 'var(--warning)',
  offline: 'var(--danger)',
  open: 'var(--warning)',
  confirmed: 'var(--danger)',
  'false-positive': 'var(--fg-dim)',
  'needs-context': 'var(--warning)',
}

interface StatusPillProps {
  status: string
  label?: string
}

export function StatusPill({ status, label }: StatusPillProps) {
  const color = DOT_COLORS[status] ?? 'var(--fg-muted)'
  const displayLabel = label ?? status

  return (
    <span className="inline-flex items-center gap-1.5">
      <span style={{ color, fontSize: 8, lineHeight: 1, flexShrink: 0 }}>●</span>
      <span className="section-label" style={{ color: 'var(--fg-muted)' }}>
        {displayLabel}
      </span>
    </span>
  )
}

export function severityColor(severity: EventSeverity): string {
  return DOT_COLORS[severity] ?? 'var(--fg-muted)'
}
