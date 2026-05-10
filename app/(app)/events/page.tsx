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
          <p className="data-mono text-xs" style={{ color: 'var(--fg-dim)' }}>{event.id}</p>
          <p className="text-sm font-medium mt-0.5" style={{ color: 'var(--fg)' }}>{event.type}</p>
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
              <Play size={16} style={{ color: 'var(--accent)', marginLeft: 2 }} />
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
              <div className="h-full w-1/3" style={{ background: 'var(--accent)' }} />
            </div>
            <span className="data-mono text-xs" style={{ color: 'var(--fg-dim)' }}>01:30</span>
          </div>
        </div>
      </div>

      {/* Metadata */}
      <div className="px-4 py-4">
        <p className="section-label mb-2">EVENT DETAILS</p>
        <table className="w-full text-xs">
          <tbody>
            {[
              ['Event ID', event.id],
              ['Timestamp', format(event.timestamp, 'yyyy-MM-dd HH:mm:ss')],
              ['Source', event.source],
              ['Store', event.store],
              ['Severity', event.severity],
              ...(event.confidence ? [['Confidence', event.confidence.toFixed(2)]] : []),
              ...Object.entries(event.metadata ?? {}).map(([k, v]) => [k.toUpperCase(), v]),
            ].map(([key, value]) => (
              <tr key={key} style={{ borderBottom: '1px solid var(--border)' }}>
                <td className="section-label py-2 pr-4 w-1/2">{key}</td>
                <td className="data-mono py-2" style={{ color: 'var(--fg)' }}>{value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Actions */}
      <div className="px-4 pb-4 flex flex-col gap-2">
        <button
          onClick={() => toast('Event flagged. Review queue updated.')}
          className="flex items-center justify-center gap-2 py-2 text-xs data-mono transition-colors"
          style={{ border: '1px solid var(--warning)', color: 'var(--warning)' }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(251,191,36,0.08)' }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
        >
          <Flag size={13} /> FLAG FOR REVIEW
        </button>
        <button
          onClick={() => toast('Event resolved. Audit trail updated.')}
          className="flex items-center justify-center gap-2 py-2 text-xs data-mono transition-colors"
          style={{ border: '1px solid var(--success)', color: 'var(--success)' }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(74,222,128,0.08)' }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
        >
          <CheckCircle size={13} /> MARK RESOLVED
        </button>
        <button
          onClick={() => toast('Event dismissed.')}
          className="flex items-center justify-center gap-2 py-2 text-xs data-mono transition-colors"
          style={{ border: '1px solid var(--border-strong)', color: 'var(--fg-muted)' }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-hover)' }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
        >
          DISMISS
        </button>
      </div>

      {/* Comments */}
      <div className="px-4 pb-4">
        <p className="section-label mb-3">COMMENTS</p>
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
        toast('Event flagged. Review queue updated.')
      } else if (e.key === 'r' && selectedEventId) {
        toast('Event resolved. Audit trail updated.')
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
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold" style={{ color: 'var(--fg)' }}>
            Live <em>events</em>
          </h1>
          <button
            onClick={() => paused ? resumeStream() : pauseStream()}
            className="flex items-center gap-2 px-3 py-1.5 data-mono text-xs transition-colors"
            style={{
              border: `1px solid ${paused ? 'var(--success)' : 'var(--accent)'}`,
              color: paused ? 'var(--success)' : 'var(--accent)',
            }}
          >
            {paused ? (
              <><span style={{ fontSize: 8 }}>▶</span> RESUME</>
            ) : (
              <><LiveIndicator /> PAUSE STREAM</>
            )}
          </button>
        </div>

        {/* Category filters */}
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className="px-3 py-1 data-mono text-xs transition-colors"
              style={{
                border: `1px solid ${activeCategory === cat ? 'var(--accent)' : 'var(--border-strong)'}`,
                color: activeCategory === cat ? 'var(--accent)' : 'var(--fg-muted)',
                background: activeCategory === cat ? 'var(--accent-glow)' : 'transparent',
              }}
            >
              {cat.toUpperCase()}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Severity filters */}
          {SEVERITIES.map((sev) => (
            <button
              key={sev}
              onClick={() => toggleSeverity(sev)}
              className="flex items-center gap-1.5 px-2 py-1 data-mono text-xs transition-colors"
              style={{
                border: `1px solid ${activeSeverities.includes(sev) ? severityColor(sev as any) : 'var(--border)'}`,
                color: activeSeverities.includes(sev) ? 'var(--fg)' : 'var(--fg-dim)',
              }}
            >
              <span style={{ fontSize: 7, color: severityColor(sev as any) }}>●</span>
              {sev.toUpperCase()}
            </button>
          ))}

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search source, type..."
            className="px-3 py-1 text-xs rounded-sm outline-none"
            style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-strong)',
              color: 'var(--fg)',
              minWidth: 200,
            }}
            onFocus={(e) => { e.target.style.borderColor = 'var(--border-accent)' }}
            onBlur={(e) => { e.target.style.borderColor = 'var(--border-strong)' }}
          />

          <span className="data-mono text-xs ml-auto" style={{ color: 'var(--fg-dim)' }}>
            {filteredEvents.length} events · j/k navigate · f flag · r resolve
          </span>
        </div>
      </div>

      {/* Split pane */}
      <div
        className="flex flex-1 overflow-hidden"
        style={{ border: '1px solid var(--border)', background: 'var(--bg-panel)' }}
      >
        {/* Event table */}
        <div className="flex flex-col overflow-hidden" style={{ flex: selectedEvent ? '0 0 60%' : '1 1 100%' }}>
          {/* Column headers */}
          <div
            className="flex items-center gap-3 px-4 py-2 shrink-0"
            style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg)' }}
          >
            <span className="section-label w-16">TIME</span>
            <span className="section-label w-24">SOURCE</span>
            <span className="section-label flex-1">TYPE</span>
            <span className="section-label w-20">CONF</span>
            <span className="section-label w-20">STATUS</span>
            <span className="section-label w-24 text-right">ACTIONS</span>
          </div>

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
                        height: 44,
                        borderBottom: '1px solid var(--border)',
                        borderLeft: isSelected ? '2px solid var(--accent)' : '2px solid transparent',
                        background: isSelected ? 'var(--bg-hover)' : undefined,
                      }}
                      onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.background = 'var(--bg-hover)' }}
                      onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.background = 'transparent' }}
                    >
                      <span className="data-mono text-xs w-16 shrink-0" style={{ color: 'var(--fg-dim)' }}>
                        {format(event.timestamp, 'HH:mm:ss')}
                      </span>
                      <span className="flex items-center gap-1.5 w-24 shrink-0">
                        <span style={{ color: severityColor(event.severity), fontSize: 7 }}>●</span>
                        <span className="data-mono text-xs truncate" style={{ color: 'var(--fg)' }}>{event.source}</span>
                      </span>
                      <span className="text-xs flex-1 truncate" style={{ color: 'var(--fg-muted)' }}>{event.type}</span>
                      <span className="data-mono text-xs w-20 shrink-0" style={{ color: 'var(--fg-dim)' }}>
                        {event.confidence?.toFixed(2) ?? '—'}
                      </span>
                      <span className="flex items-center gap-1 w-20 shrink-0">
                        <span style={{ fontSize: 7, color: severityColor(event.severity) }}>●</span>
                        <span className="data-mono text-xs" style={{ color: 'var(--fg-muted)' }}>{event.severity}</span>
                      </span>
                      <div className="w-24 shrink-0 flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => { e.stopPropagation(); toast('Event flagged.') }}
                          className="data-mono text-xs"
                          style={{ color: 'var(--warning)' }}
                        >
                          f
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); toast('Event resolved. Audit trail updated.') }}
                          className="data-mono text-xs"
                          style={{ color: 'var(--success)' }}
                        >
                          r
                        </button>
                        <span className="data-mono text-xs" style={{ color: 'var(--accent)' }}>view →</span>
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
