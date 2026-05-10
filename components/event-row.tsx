'use client'

import Link from 'next/link'
import { format } from 'date-fns'
import type { StoreEvent } from '@/lib/types'
import { severityColor } from './status-pill'

interface EventRowProps {
  event: StoreEvent
  isSelected?: boolean
  onClick?: () => void
  actionHref?: string
  flash?: boolean
}

const ACTION_LABELS: Record<string, string> = {
  'pick-detected': 'view →',
  'tailgating': 'investigate →',
  'pick-without-pay': 'investigate →',
  'low-stock': 'restock →',
  'oos': 'restock →',
  'misplacement': 'view →',
  'checkout-init': 'view →',
  'walk-out': 'investigate →',
  'payment-success': 'view →',
  'payment-failover': 'investigate →',
  'cart-tampering': 'investigate →',
}

function metaSummary(event: StoreEvent): string {
  const m = event.metadata ?? {}
  if (m.conf) return `conf ${m.conf}`
  if (m.eta) return `eta ${m.eta}`
  if (m.amount) return m.amount
  if (m.value) return m.value
  if (m.since) return m.since
  return ''
}

export function EventRow({ event, isSelected, onClick, flash }: EventRowProps) {
  const color = severityColor(event.severity)
  const meta = metaSummary(event)
  const action = ACTION_LABELS[event.type] ?? 'view →'

  return (
    <div
      onClick={onClick}
      className={`group flex items-center gap-3 px-4 cursor-pointer transition-colors duration-150 ${
        flash ? 'event-flash' : ''
      } ${isSelected ? '' : 'hover:bg-[var(--bg-hover)]'}`}
      style={{
        height: 44,
        borderLeft: isSelected ? `2px solid var(--brand-accent)` : '2px solid transparent',
        backgroundColor: isSelected ? 'var(--bg-hover)' : undefined,
      }}
    >
      {/* timestamp */}
      <span
        className="data-mono text-xs shrink-0 w-16"
        style={{ color: 'var(--fg-dim)' }}
      >
        {format(event.timestamp, 'HH:mm:ss')}
      </span>

      {/* source dot + label */}
      <span className="flex items-center gap-1.5 w-24 shrink-0">
        <span style={{ color, fontSize: 7, lineHeight: 1 }}>●</span>
        <span className="data-mono text-xs truncate" style={{ color: 'var(--fg)' }}>
          {event.source}
        </span>
      </span>

      {/* event type */}
      <span className="text-xs flex-1 truncate" style={{ color: 'var(--fg-muted)' }}>
        {event.type}
      </span>

      {/* meta */}
      <span
        className="data-mono text-xs w-24 text-right shrink-0"
        style={{ color: 'var(--fg-dim)' }}
      >
        {meta}
      </span>

      {/* action — appears on hover */}
      <Link
        href={`/events/${event.id}`}
        onClick={(e) => e.stopPropagation()}
        className="data-mono text-xs shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-150"
        style={{ color: 'var(--brand-accent)', width: 88, textAlign: 'right' }}
      >
        {action}
      </Link>
    </div>
  )
}
