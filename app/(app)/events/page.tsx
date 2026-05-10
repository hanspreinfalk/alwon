'use client'

import { useState, useEffect, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { format } from 'date-fns'
import { Play, Flag, CheckCircle, X, MessageSquare } from 'lucide-react'
import { toast } from 'sonner'
import { useEventStore, useFilterStore } from '@/lib/store'
import { useEventStream } from '@/lib/fake-socket'
import { severityColor } from '@/components/status-pill'
import { LiveIndicator } from '@/components/live-indicator'
import { friendlyEvent } from '@/lib/labels'
import type { StoreEvent, EventType } from '@/lib/types'

const CATEGORIES = ['All', 'Loss prevention', 'Inventory', 'Checkout', 'Payments', 'Camera health']

const CATEGORY_TYPES: Record<string, EventType[]> = {
  'Loss prevention': ['pick-detected', 'tailgating', 'pick-without-pay', 'cart-tampering', 'walk-out'],
  'Inventory': ['low-stock', 'oos', 'misplacement'],
  'Checkout': ['checkout-init'],
  'Payments': ['payment-success', 'payment-failover'],
  'Camera health': [],
}

const SEVERITIES = ['info', 'warning', 'flagged', 'resolved']
const SEV_LABELS: Record<string, string> = {
  info: 'Normal',
  warning: 'Heads up',
  flagged: 'Needs review',
  resolved: 'Resolved',
}

function metaSummary(event: StoreEvent): string {
  const m = event.metadata ?? {}
  if (m.conf) return `conf ${m.conf}`
  if (m.eta) return `eta ${m.eta}`
  if (m.amount) return m.amount
  if (m.value) return m.value
  return ''
}

function EventDetailPanel({ event, onClose }: { event: StoreEvent; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 16 }}
      transition={{ duration: 0.2 }}
      className="flex flex-col h-full overflow-y-auto"
      style={{ background: 'var(--bg-panel)', borderLeft: '1px solid var(--border)' }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 sticky top-0"
        style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-panel)' }}
      >
        <div>
          <p className="text-base font-medium" style={{ color: 'var(--fg)' }}>{friendlyEvent(event.type)}</p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--fg-muted)' }}>{event.id}</p>
        </div>
        <button onClick={onClose} style={{ color: 'var(--fg-dim)' }}>
          <X size={16} />
        </button>
      </div>

      {/* Video mock */}
      <div className="px-4 pt-4">
        <div
          className="relative rounded-sm overflow-hidden"
          style={{
            aspectRatio: '16/9',
            background: '#000',
            border: '1px solid var(--border)',
          }}
        >
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
            <div
              className="flex items-center justify-center rounded-full cursor-pointer transition-colors"
              style={{ width: 44, height: 44, background: 'rgba(6,144,252,0.15)', border: '1px solid var(--border-accent)' }}
            >
              <Play size={16} style={{ color: 'var(--brand-accent)', marginLeft: 2 }} />
            </div>
            <p className="data-mono text-xs" style={{ color: 'var(--fg-dim)' }}>{event.source}</p>
          </div>
          {/* Timeline scrubber */}
          <div
            className="absolute bottom-0 left-0 right-0 flex items-center gap-2 px-3 py-2"
            style={{ background: 'rgba(0,0,0,0.7)' }}
          >
            <span className="data-mono text-xs" style={{ color: 'var(--fg-dim)' }}>00:00</span>
            <div className="flex-1 h-px" style={{ background: 'var(--border-strong)' }}>
              <div className="h-full w-1/3" style={{ background: 'var(--brand-accent)' }} />
            </div>
            <span className="data-mono text-xs" style={{ color: 'var(--fg-dim)' }}>01:30</span>
          </div>
        </div>
      </div>

      {/* Metadata */}
      <div className="px-4 py-4">
        <p className="text-sm font-medium mb-2" style={{ color: 'var(--fg)' }}>Details</p>
        <table className="w-full text-sm">
          <tbody>
            {[
              ['When', format(event.timestamp, 'MMM d · HH:mm:ss')],
              ['Where', event.source],
              ['Store', event.store],
              ['Status', SEV_LABELS[event.severity]],
              ...(event.confidence ? [['Confidence', `${Math.round(event.confidence * 100)}% sure`]] : []),
            ].map(([key, value]) => (
              <tr key={key} style={{ borderBottom: '1px solid var(--border)' }}>
                <td className="py-2 pr-4 w-2/5 text-xs" style={{ color: 'var(--fg-muted)' }}>{key}</td>
                <td className="py-2" style={{ color: 'var(--fg)' }}>{value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Actions */}
      <div className="px-4 pb-4 flex flex-col gap-2">
        <button
          onClick={() => toast('Marked for review.')}
          className="flex items-center justify-center gap-2 py-2 text-sm rounded-md transition-colors"
          style={{ border: '1px solid var(--warning)', color: 'var(--warning)' }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(251,191,36,0.08)' }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
        >
          <Flag size={14} /> Flag for review
        </button>
        <button
          onClick={() => toast('Marked as resolved.')}
          className="flex items-center justify-center gap-2 py-2 text-sm rounded-md transition-colors"
          style={{ border: '1px solid var(--success)', color: 'var(--success)' }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(74,222,128,0.08)' }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
        >
          <CheckCircle size={14} /> Mark as resolved
        </button>
        <button
          onClick={() => toast('Dismissed.')}
          className="flex items-center justify-center gap-2 py-2 text-sm rounded-md transition-colors"
          style={{ border: '1px solid var(--border-strong)', color: 'var(--fg-muted)' }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-hover)' }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
        >
          Not an issue
        </button>
      </div>

      {/* Comments */}
      <div className="px-4 pb-4">
        <p className="text-sm font-medium mb-3" style={{ color: 'var(--fg)' }}>Notes</p>
        <div className="flex flex-col gap-2">
          {[
            { author: 'Elena M.', text: 'Confirmed from store walkthrough. Item not on shelf.', time: '14:32' },
            { author: 'Carlos R.', text: 'Reviewing footage now. High confidence pick.', time: '14:35' },
          ].map((comment, i) => (
            <div
              key={i}
              className="px-3 py-2"
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium" style={{ color: 'var(--fg)' }}>{comment.author}</span>
                <span className="data-mono text-xs" style={{ color: 'var(--fg-dim)' }}>{comment.time}</span>
              </div>
              <p className="text-xs" style={{ color: 'var(--fg-muted)' }}>{comment.text}</p>
            </div>
          ))}
          <div
            className="flex items-center gap-2 mt-1"
            style={{ border: '1px solid var(--border)', background: 'var(--bg-elevated)' }}
          >
            <MessageSquare size={12} className="ml-3" style={{ color: 'var(--fg-dim)' }} />
            <input
              placeholder="Add a comment..."
              className="flex-1 py-2 pr-3 text-xs bg-transparent outline-none"
              style={{ color: 'var(--fg)' }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default function EventsPage() {
  const { events, paused, pauseStream, resumeStream, selectedEventId, selectEvent } = useEventStore()
  const { categories, severities, search, setCategories, setSeverities, setSearch } = useFilterStore()
  const [activeCategory, setActiveCategory] = useState('All')
  const [activeSeverities, setActiveSeverities] = useState<string[]>([])
  const [flashId, setFlashId] = useState<string | null>(null)
  const prevTopId = { current: null as string | null }

  useEventStream()

  useEffect(() => {
    const topEvent = events[0]
    if (topEvent && topEvent.id !== prevTopId.current) {
      setFlashId(topEvent.id)
      prevTopId.current = topEvent.id
      const t = setTimeout(() => setFlashId(null), 800)
      return () => clearTimeout(t)
    }
  }, [events])

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const currentIdx = events.findIndex((ev) => ev.id === selectedEventId)
      if (e.key === 'j') {
        const next = events[currentIdx + 1]
        if (next) selectEvent(next.id)
      } else if (e.key === 'k') {
        const prev = currentIdx > 0 ? events[currentIdx - 1] : events[0]
        if (prev) selectEvent(prev.id)
      } else if (e.key === 'Enter' && selectedEventId) {
        // Already shown in panel
      } else if (e.key === 'f' && selectedEventId) {
        toast('Marked for review.')
      } else if (e.key === 'r' && selectedEventId) {
        toast('Marked as resolved.')
      } else if (e.key === 'Escape') {
        selectEvent(null)
      }
    },
    [events, selectedEventId, selectEvent]
  )

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  const selectedEvent = events.find((e) => e.id === selectedEventId)

  const filteredEvents = events.filter((event) => {
    if (activeCategory !== 'All') {
      const types = CATEGORY_TYPES[activeCategory]
      if (types && !types.includes(event.type)) return false
    }
    if (activeSeverities.length > 0 && !activeSeverities.includes(event.severity)) return false
    if (search && !event.source.toLowerCase().includes(search.toLowerCase()) &&
        !event.type.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const toggleSeverity = (s: string) => {
    setActiveSeverities((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s])
  }

  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 56px - 48px)' }}>
      {/* Page header + filters */}
      <div className="flex flex-col gap-3 pb-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold" style={{ color: 'var(--fg)' }}>
              Activity
            </h1>
            <p className="text-sm mt-1" style={{ color: 'var(--fg-muted)' }}>
              Everything happening in your stores, as it happens.
            </p>
          </div>
          <button
            onClick={() => paused ? resumeStream() : pauseStream()}
            className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-md transition-colors"
            style={{
              border: `1px solid ${paused ? 'var(--success)' : 'var(--brand-accent)'}`,
              color: paused ? 'var(--success)' : 'var(--brand-accent)',
            }}
          >
            {paused ? (
              <>▶ Resume</>
            ) : (
              <><LiveIndicator /> Pause</>
            )}
          </button>
        </div>

        {/* Category filters */}
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className="px-3 py-1.5 text-sm rounded-md transition-colors"
              style={{
                border: `1px solid ${activeCategory === cat ? 'var(--brand-accent)' : 'var(--border-strong)'}`,
                color: activeCategory === cat ? 'var(--brand-accent)' : 'var(--fg-muted)',
                background: activeCategory === cat ? 'var(--brand-accent-glow)' : 'transparent',
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Severity filters */}
          {SEVERITIES.map((sev) => (
            <button
              key={sev}
              onClick={() => toggleSeverity(sev)}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-md transition-colors"
              style={{
                border: `1px solid ${activeSeverities.includes(sev) ? severityColor(sev as any) : 'var(--border)'}`,
                color: activeSeverities.includes(sev) ? 'var(--fg)' : 'var(--fg-muted)',
              }}
            >
              <span style={{ fontSize: 7, color: severityColor(sev as any) }}>●</span>
              {SEV_LABELS[sev]}
            </button>
          ))}

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search…"
            className="px-3 py-1 text-sm rounded-md outline-none"
            style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-strong)',
              color: 'var(--fg)',
              minWidth: 200,
            }}
            onFocus={(e) => { e.target.style.borderColor = 'var(--border-accent)' }}
            onBlur={(e) => { e.target.style.borderColor = 'var(--border-strong)' }}
          />

          <span className="text-xs ml-auto" style={{ color: 'var(--fg-muted)' }}>
            {filteredEvents.length} {filteredEvents.length === 1 ? 'event' : 'events'} shown
          </span>
        </div>
      </div>

      {/* Split pane */}
      <div
        className="flex flex-1 overflow-hidden"
        style={{ borderRadius: 'var(--radius)', border: '1px solid var(--border)', background: 'var(--bg-panel)' }}
      >
        {/* Event table */}
        <div className="flex flex-col overflow-hidden" style={{ flex: selectedEvent ? '0 0 60%' : '1 1 100%' }}>
          {/* Rows */}
          <div className="overflow-y-auto flex-1">
            <AnimatePresence initial={false}>
              {filteredEvents.slice(0, 200).map((event) => {
                const isSelected = selectedEventId === event.id
                return (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <div
                      onClick={() => selectEvent(isSelected ? null : event.id)}
                      className={`group flex items-center gap-3 px-4 cursor-pointer transition-colors duration-150 ${flashId === event.id ? 'event-flash' : ''}`}
                      style={{
                        height: 52,
                        borderBottom: '1px solid var(--border)',
                        borderLeft: isSelected ? '2px solid var(--brand-accent)' : '2px solid transparent',
                        background: isSelected ? 'var(--bg-hover)' : undefined,
                      }}
                      onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.background = 'var(--bg-hover)' }}
                      onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.background = 'transparent' }}
                    >
                      <span className="data-mono text-xs w-14 shrink-0" style={{ color: 'var(--fg-muted)' }}>
                        {format(event.timestamp, 'HH:mm')}
                      </span>
                      <span style={{ color: severityColor(event.severity), fontSize: 8 }}>●</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm truncate" style={{ color: 'var(--fg)' }}>{friendlyEvent(event.type)}</p>
                        <p className="text-xs truncate" style={{ color: 'var(--fg-muted)' }}>
                          {event.source} · {event.store}
                        </p>
                      </div>
                      {event.confidence !== undefined && (
                        <span className="text-xs shrink-0 w-20 text-right" style={{ color: 'var(--fg-muted)' }}>
                          {Math.round(event.confidence * 100)}% sure
                        </span>
                      )}
                      <span className="text-xs shrink-0 w-24 hidden md:inline" style={{ color: 'var(--fg-muted)' }}>
                        {SEV_LABELS[event.severity]}
                      </span>
                      <div className="shrink-0 flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => { e.stopPropagation(); toast('Marked for review.') }}
                          className="text-xs"
                          style={{ color: 'var(--warning)' }}
                        >
                          Flag
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); toast('Marked as resolved.') }}
                          className="text-xs"
                          style={{ color: 'var(--success)' }}
                        >
                          Resolve
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        </div>

        {/* Detail panel */}
        <AnimatePresence>
          {selectedEvent && (
            <div style={{ flex: '0 0 40%', overflow: 'hidden' }}>
              <EventDetailPanel event={selectedEvent} onClose={() => selectEvent(null)} />
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
