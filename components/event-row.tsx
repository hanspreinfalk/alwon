'use client'

import Link from 'next/link'
import { format } from 'date-fns'
import type { StoreEvent } from '@/lib/types'
import { severityColor } from './status-pill'
import { friendlyEvent, EVENT_ACTIONS } from '@/lib/labels'

interface EventRowProps {
  event: StoreEvent
  isSelected?: boolean
  onClick?: () => void
  actionHref?: string
  flash?: boolean
}

function metaSummary(event: StoreEvent): string {
  const m = event.metadata ?? {}
  if (m.value) return m.value
  if (m.amount) return m.amount
  if (m.eta) return `in ${m.eta}`
  if (m.conf) return `${Math.round(parseFloat(m.conf) * 100)}% sure`
  if (m.since) return m.since
  return ''
}

export function EventRow({ event, isSelected, onClick, flash }: EventRowProps) {
  const color = severityColor(event.severity)
  const meta = metaSummary(event)
  const action = EVENT_ACTIONS[event.type] ?? 'Open'

  return (
    <div
      onClick={onClick}
      className={`group flex items-center gap-3 px-4 cursor-pointer transition-colors duration-150 ${
        flash ? 'event-flash' : ''
      } ${isSelected ? '' : 'hover:bg-[var(--bg-hover)]'}`}
      style={{
        height: 48,
        borderLeft: isSelected ? `2px solid var(--brand-accent)` : '2px solid transparent',
        backgroundColor: isSelected ? 'var(--bg-hover)' : undefined,
      }}
    >
      {/* timestamp — friendly time */}
      <span
        className="data-mono text-xs shrink-0 w-14"
        style={{ color: 'var(--fg-dim)' }}
      >
        {format(event.timestamp, 'HH:mm')}
      </span>

      {/* severity dot */}
      <span style={{ color, fontSize: 8, lineHeight: 1, flexShrink: 0 }}>●</span>

      {/* friendly event name */}
      <span className="text-sm flex-1 truncate" style={{ color: 'var(--fg)' }}>
        {friendlyEvent(event.type)}
      </span>

      {/* source — small, muted */}
      <span className="text-xs shrink-0 hidden sm:inline" style={{ color: 'var(--fg-muted)' }}>
        {event.source}
      </span>

      {/* meta */}
      {meta && (
        <span
          className="text-xs w-24 text-right shrink-0 hidden md:inline"
          style={{ color: 'var(--fg-dim)' }}
        >
          {meta}
        </span>
      )}

      {/* action — appears on hover */}
      <Link
        href={`/events/${event.id}`}
        onClick={(e) => e.stopPropagation()}
        className="text-xs font-medium shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-150"
        style={{ color: 'var(--brand-accent)', width: 60, textAlign: 'right' }}
      >
        {action} →
      </Link>
    </div>
  )
}
