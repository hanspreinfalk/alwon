'use client'

import { useState, useEffect, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { format } from 'date-fns'
import {
  Play, Flag, CheckCircle, X, MessageSquare, Camera,
  WifiOff, Wifi, Send, ShieldAlert, Package, CreditCard,
  ShoppingCart, Search,
} from 'lucide-react'
import { toast } from 'sonner'
import { useEventStore, useFilterStore } from '@/lib/store'
import { useEventStream } from '@/lib/fake-socket'
import { severityColor } from '@/components/status-pill'
import { LiveIndicator } from '@/components/live-indicator'
import { friendlyEvent } from '@/lib/labels'
import type { StoreEvent, EventType } from '@/lib/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

const CATEGORIES = ['All', 'Loss prevention', 'Inventory', 'Checkout', 'Payments', 'Camera health']

const CATEGORY_TYPES: Record<string, EventType[]> = {
  'Loss prevention': ['pick-detected', 'tailgating', 'pick-without-pay', 'cart-tampering', 'walk-out'],
  'Inventory': ['low-stock', 'oos', 'misplacement'],
  'Checkout': ['checkout-init'],
  'Payments': ['payment-success', 'payment-failover'],
  'Camera health': ['camera-offline', 'camera-degraded'],
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  'Loss prevention': <ShieldAlert className="size-3.5" />,
  'Inventory': <Package className="size-3.5" />,
  'Checkout': <ShoppingCart className="size-3.5" />,
  'Payments': <CreditCard className="size-3.5" />,
  'Camera health': <Camera className="size-3.5" />,
}

const SEVERITIES = ['info', 'warning', 'flagged', 'resolved']
const SEV_LABELS: Record<string, string> = {
  info: 'Normal',
  warning: 'Heads up',
  flagged: 'Needs review',
  resolved: 'Resolved',
}

function SeverityDot({ severity }: { severity: string }) {
  return (
    <span
      className="inline-block size-2 rounded-full shrink-0"
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      style={{ background: severityColor(severity as any) }}
    />
  )
}

function SeverityBadge({ severity }: { severity: string }) {
  const variant: Record<string, 'secondary' | 'outline' | 'destructive' | 'default'> = {
    info: 'secondary',
    warning: 'outline',
    flagged: 'destructive',
    resolved: 'secondary',
  }
  return (
    <Badge variant={variant[severity] ?? 'secondary'} className="text-[10px] px-1.5 py-0 h-5">
      {SEV_LABELS[severity] ?? severity}
    </Badge>
  )
}

function CameraHealthDetail({ event }: { event: StoreEvent }) {
  const m = event.metadata ?? {}
  const isOffline = event.type === 'camera-offline'

  return (
    <div className="flex flex-col gap-4 px-4 pt-4">
      <div className="rounded-lg border bg-muted/30 p-5 flex flex-col items-center justify-center gap-3 text-center">
        <div
          className={cn(
            'flex size-12 items-center justify-center rounded-full',
            isOffline ? 'bg-red-500/10' : 'bg-amber-500/10'
          )}
        >
          {isOffline
            ? <WifiOff className="size-6 text-destructive" />
            : <Wifi className="size-6 text-amber-500" />
          }
        </div>
        <div>
          <p className="font-semibold text-sm">{isOffline ? 'Camera offline' : 'Degraded signal'}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{event.source} · {event.store}</p>
        </div>
        {m.duration && (
          <span
            className={cn(
              'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium',
              isOffline
                ? 'bg-red-500/10 text-red-600 dark:text-red-400'
                : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
            )}
          >
            {isOffline ? `Offline for ${m.duration}` : `Degraded for ${m.duration}`}
          </span>
        )}
      </div>

      <div className="rounded-lg border overflow-hidden">
        <table className="w-full text-sm">
          <tbody>
            {[
              ['Camera', event.source],
              ['Store', event.store],
              ['Detected', format(event.timestamp, 'MMM d · HH:mm:ss')],
              ...(m.signal ? [['Signal quality', `${m.signal}%`]] : []),
              ...(m.duration ? [['Duration', m.duration]] : []),
              ...(m.last_seen ? [['Last seen', m.last_seen]] : []),
              ...(m.issue ? [['Issue', m.issue]] : []),
            ].map(([key, value]) => (
              <tr key={key} className="border-b last:border-0">
                <td className="py-2.5 px-3 text-xs text-muted-foreground w-1/3">{key}</td>
                <td className="py-2.5 px-3 text-xs font-medium">{value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function EventDetailPanel({ event, onClose }: { event: StoreEvent; onClose: () => void }) {
  const [comment, setComment] = useState('')
  const isCameraEvent = event.type === 'camera-offline' || event.type === 'camera-degraded'
  const m = event.metadata ?? {}

  const handleFlag = () =>
    toast.warning('Flagged for review', {
      description: `${friendlyEvent(event.type)} · ${event.source} · ${event.store}`,
    })

  const handleResolve = () =>
    toast.success('Marked as resolved', {
      description: `${friendlyEvent(event.type)} · ${event.source} · ${event.store}`,
    })

  const handleDismiss = () =>
    toast('Dismissed', { description: 'Event will not appear in the review queue.' })

  const handleRestartCamera = () =>
    toast.info('Restart signal sent', {
      description: `Sent restart command to ${event.source}. Response expected within 30s.`,
    })

  const handleAlertManager = () =>
    toast.info('Store manager notified', {
      description: `${event.store} manager has been alerted about ${event.source}.`,
    })

  return (
    <motion.div
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 16 }}
      transition={{ duration: 0.2 }}
      className="flex h-full min-h-0 min-w-0 flex-col bg-card"
    >
      {/* Header */}
      <div className="flex shrink-0 items-start justify-between gap-3 border-b bg-muted/30 px-5 py-4">
        <div className="min-w-0">
          <h2 className="truncate text-lg font-semibold tracking-tight leading-tight">
            {friendlyEvent(event.type)}
          </h2>
          <p className="mt-1 font-mono text-xs text-muted-foreground">{event.id}</p>
        </div>
        <Button variant="ghost" size="icon-sm" onClick={onClose} className="shrink-0">
          <X />
        </Button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        {isCameraEvent ? (
          <CameraHealthDetail event={event} />
        ) : (
          <div className="px-5 pt-5">
            <div
              className={cn(
                'relative w-full overflow-hidden rounded-xl border bg-black shadow-sm',
                'aspect-video min-h-[min(44vh,420px)]',
              )}
            >
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  className="size-14 rounded-full shadow-md"
                  onClick={() => toast.info('Opening footage…', { description: event.source })}
                >
                  <Play className="size-6 ml-0.5" />
                </Button>
                <p className="font-mono text-xs text-white/50">{event.source}</p>
              </div>
              <div className="absolute bottom-0 left-0 right-0 flex items-center gap-2 border-t border-white/10 bg-black/80 px-4 py-3">
                <span className="font-mono text-[11px] text-white/45">00:00</span>
                <div className="relative h-1 flex-1 rounded-full bg-white/15">
                  <div className="h-full w-1/3 rounded-full bg-primary" />
                  <div className="absolute top-1/2 left-1/3 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-background bg-primary" />
                </div>
                <span className="font-mono text-[11px] text-white/45">01:30</span>
              </div>
            </div>
          </div>
        )}

        {/* Metadata for non-camera events */}
        {!isCameraEvent && (
          <div className="px-5 pt-5">
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Details</p>
            <Card className="gap-0 overflow-hidden py-0 shadow-none">
              <CardContent className="p-0">
                <table className="w-full text-sm">
                  <tbody>
                    {[
                      ['When', format(event.timestamp, 'MMM d · HH:mm:ss')],
                      ['Source', event.source],
                      ['Store', event.store],
                      ['Status', SEV_LABELS[event.severity] ?? event.severity],
                      ...(event.confidence != null ? [['Confidence', `${Math.round(event.confidence * 100)}%`]] : []),
                      ...(m.sku ? [['SKU', m.sku]] : []),
                      ...(m.value ? [['Est. value', m.value]] : []),
                      ...(m.amount ? [['Amount', m.amount]] : []),
                      ...(m.processor ? [['Processor', m.processor]] : []),
                      ...(m.items ? [['Items', m.items]] : []),
                      ...(m.persons ? [['Persons', m.persons]] : []),
                      ...(m.current && m.max ? [['Stock', `${m.current} / ${m.max}`]] : []),
                      ...(m.from && m.to ? [['Failover', `${m.from} → ${m.to}`]] : []),
                      ...(m.items_removed ? [['Items removed', m.items_removed]] : []),
                    ].map(([key, value]) => (
                      <tr key={key} className="border-b last:border-0">
                        <td className="w-[38%] px-4 py-2.5 text-xs text-muted-foreground">{key}</td>
                        <td className="px-4 py-2.5 text-sm font-medium">{value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-row gap-2 px-5 py-5">
          {isCameraEvent ? (
            <>
              <Button variant="outline" className="min-w-0 flex-1 gap-1.5 px-2 py-2 text-xs leading-tight sm:gap-2 sm:px-3 sm:text-sm" onClick={handleRestartCamera}>
                <Wifi className="size-4 shrink-0" />
                <span className="min-w-0 text-balance">Restart camera</span>
              </Button>
              <Button variant="secondary" className="min-w-0 flex-1 gap-1.5 px-2 py-2 text-xs leading-tight sm:gap-2 sm:px-3 sm:text-sm" onClick={handleAlertManager}>
                <Flag className="size-4 shrink-0" />
                <span className="min-w-0 text-balance">Alert manager</span>
              </Button>
              <Button variant="default" className="min-w-0 flex-1 gap-1.5 px-2 py-2 text-xs leading-tight sm:gap-2 sm:px-3 sm:text-sm" onClick={handleResolve}>
                <CheckCircle className="size-4 shrink-0" />
                <span className="min-w-0 text-balance">Mark resolved</span>
              </Button>
              <Button variant="ghost" className="min-w-0 flex-1 px-2 py-2 text-xs leading-tight text-muted-foreground hover:text-foreground sm:text-sm" onClick={handleDismiss}>
                <span className="min-w-0 text-balance">Not an issue</span>
              </Button>
            </>
          ) : (
            <>
              <Button variant="secondary" className="min-w-0 flex-1 gap-1.5 px-2 py-2 text-xs leading-tight sm:gap-2 sm:px-3 sm:text-sm" onClick={handleFlag}>
                <Flag className="size-4 shrink-0" />
                <span className="min-w-0 text-balance">Flag for review</span>
              </Button>
              <Button variant="default" className="min-w-0 flex-1 gap-1.5 px-2 py-2 text-xs leading-tight sm:gap-2 sm:px-3 sm:text-sm" onClick={handleResolve}>
                <CheckCircle className="size-4 shrink-0" />
                <span className="min-w-0 text-balance">Mark as resolved</span>
              </Button>
              <Button variant="ghost" className="min-w-0 flex-1 px-2 py-2 text-xs leading-tight text-muted-foreground hover:text-foreground sm:text-sm" onClick={handleDismiss}>
                <span className="min-w-0 text-balance">Not an issue</span>
              </Button>
            </>
          )}
        </div>

        {/* Notes */}
        <div className="px-5 pb-8">
          <Separator className="mb-4" />
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-3">Notes</p>
          <div className="rounded-lg border overflow-hidden">
            {[
              { author: 'Santiago G.', text: 'Confirmed from store walkthrough. Item not on shelf.', time: '14:32' },
              { author: 'Carlos R.', text: 'Reviewing footage now. High confidence pick.', time: '14:35' },
            ].map((note, i) => (
              <div key={i} className="px-3 py-3 border-b">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold">{note.author}</span>
                  <span className="font-mono text-[10px] text-muted-foreground">{note.time}</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{note.text}</p>
              </div>
            ))}
            <div className="flex items-center gap-2 px-3 py-2.5">
              <MessageSquare className="size-3.5 text-muted-foreground shrink-0" />
              <input
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Add a comment…"
                className="flex-1 text-xs bg-transparent outline-none placeholder:text-muted-foreground"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && comment.trim()) {
                    toast('Comment added.')
                    setComment('')
                  }
                }}
              />
              {comment.trim() && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  className="shrink-0"
                  onClick={() => {
                    toast('Comment added.')
                    setComment('')
                  }}
                >
                  <Send className="size-3.5" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default function EventsPage() {
  const { events, paused, pauseStream, resumeStream, selectedEventId, selectEvent } = useEventStore()
  const { search, setSearch } = useFilterStore()
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

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return
      const currentIdx = events.findIndex((ev) => ev.id === selectedEventId)
      if (e.key === 'j') {
        const next = events[currentIdx + 1]
        if (next) selectEvent(next.id)
      } else if (e.key === 'k') {
        const prev = currentIdx > 0 ? events[currentIdx - 1] : events[0]
        if (prev) selectEvent(prev.id)
      } else if (e.key === 'f' && selectedEventId) {
        toast.warning('Flagged for review.')
      } else if (e.key === 'r' && selectedEventId) {
        toast.success('Marked as resolved.')
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
    if (search) {
      const q = search.toLowerCase()
      if (
        !event.source.toLowerCase().includes(q) &&
        !event.type.toLowerCase().includes(q) &&
        !friendlyEvent(event.type).toLowerCase().includes(q) &&
        !event.store.toLowerCase().includes(q)
      ) return false
    }
    return true
  })

  const toggleSeverity = (s: string) => {
    setActiveSeverities((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    )
  }

  const categoryCounts: Record<string, number> = { All: events.length }
  CATEGORIES.slice(1).forEach((cat) => {
    const types = CATEGORY_TYPES[cat]
    categoryCounts[cat] = types ? events.filter((e) => types.includes(e.type)).length : 0
  })

  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 52px - 48px)' }}>
      {/* Page header */}
      <div className="flex flex-col gap-3 pb-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-[18px] font-semibold tracking-tight">Activity</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Everything happening in your stores, as it happens.
            </p>
          </div>
          <Button
            variant={paused ? 'secondary' : 'outline'}
            size="sm"
            onClick={() => paused ? resumeStream() : pauseStream()}
            className="gap-2 shrink-0 h-8 text-xs"
          >
            {paused ? <>▶ Resume</> : <><LiveIndicator /> Pause</>}
          </Button>
        </div>

        {/* Category tabs */}
        <div className="flex flex-wrap gap-1.5">
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat
            const count = categoryCounts[cat]
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  'inline-flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-lg border font-medium transition-colors',
                  isActive
                    ? 'bg-foreground text-background border-foreground'
                    : 'border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                {CATEGORY_ICONS[cat]}
                {cat}
                {count !== undefined && count > 0 && (
                  <span
                    className={cn(
                      'inline-flex items-center justify-center rounded-full text-[10px] min-w-[16px] h-4 px-1 font-semibold',
                      isActive
                        ? 'bg-background/20 text-background'
                        : 'bg-muted text-muted-foreground'
                    )}
                  >
                    {count > 99 ? '99+' : count}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* Severity filters + search */}
        <div className="flex flex-wrap items-center gap-2">
          {SEVERITIES.map((sev) => {
            const isActive = activeSeverities.includes(sev)
            return (
              <button
                key={sev}
                onClick={() => toggleSeverity(sev)}
                className={cn(
                  'inline-flex items-center gap-1.5 px-2 py-1 text-[11px] rounded-md border font-medium transition-colors',
                  isActive
                    ? 'bg-foreground text-background border-foreground'
                    : 'border-border text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <SeverityDot severity={sev} />
                {SEV_LABELS[sev]}
              </button>
            )
          })}

          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3 text-muted-foreground pointer-events-none" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search events…"
              className="pl-7 w-44 h-7 text-xs rounded-lg"
            />
          </div>

          <span className="text-[11px] text-muted-foreground ml-auto tabular-nums">
            {filteredEvents.length} {filteredEvents.length === 1 ? 'event' : 'events'}
          </span>
        </div>
      </div>

      {/* Split pane */}
      <div className="flex flex-1 min-h-0 rounded-xl border overflow-hidden" style={{ borderColor: 'var(--border)', background: 'var(--card)' }}>
        {/* Event list */}
        <div
          className={cn(
            'flex min-h-0 flex-col overflow-hidden transition-[width] duration-200 min-w-0',
            selectedEvent ? 'w-[42%]' : 'w-full'
          )}
        >
          <ScrollArea className="min-h-0 flex-1">
            <AnimatePresence initial={false}>
              {filteredEvents.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-2 py-20 text-muted-foreground">
                  <Camera className="size-8 opacity-20" />
                  <p className="text-sm">No events match this filter</p>
                </div>
              ) : (
                filteredEvents.slice(0, 200).map((event) => {
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
                        className={cn(
                          'group flex items-center gap-3 px-4 h-[50px] cursor-pointer transition-colors border-b',
                          'hover:bg-muted/40',
                          isSelected && 'bg-muted/40',
                          flashId === event.id && 'event-flash',
                        )}
                        style={{
                          borderColor: 'var(--border)',
                          borderLeft: isSelected
                            ? '2px solid var(--brand-accent)'
                            : '2px solid transparent',
                        }}
                      >
                        <span className="font-mono text-[11px] text-muted-foreground w-10 shrink-0 tabular-nums">
                          {format(event.timestamp, 'HH:mm')}
                        </span>
                        <SeverityDot severity={event.severity} />
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] truncate font-medium leading-tight">
                            {friendlyEvent(event.type)}
                          </p>
                          <p className="text-[11px] truncate text-muted-foreground mt-0.5">
                            {event.source} · {event.store}
                          </p>
                        </div>
                        <div className="hidden md:flex items-center gap-2 shrink-0">
                          {event.confidence != null && (
                            <span className="text-[11px] text-muted-foreground tabular-nums w-8 text-right">
                              {Math.round(event.confidence * 100)}%
                            </span>
                          )}
                          <SeverityBadge severity={event.severity} />
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                          <Button
                            variant="outline"
                            size="xs"
                            className="h-6 px-2 text-xs"
                            onClick={(e) => {
                              e.stopPropagation()
                              toast.warning('Flagged for review', {
                                description: `${friendlyEvent(event.type)} · ${event.source}`,
                              })
                            }}
                          >
                            <Flag className="size-3" />
                            Flag
                          </Button>
                          <Button
                            variant="secondary"
                            size="xs"
                            className="h-6 px-2 text-xs"
                            onClick={(e) => {
                              e.stopPropagation()
                              toast.success('Marked as resolved', {
                                description: `${friendlyEvent(event.type)} · ${event.source}`,
                              })
                            }}
                          >
                            <CheckCircle className="size-3" />
                            Resolve
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  )
                })
              )}
            </AnimatePresence>
          </ScrollArea>
        </div>

        {/* Detail panel */}
        <AnimatePresence>
          {selectedEvent && (
            <div
              className="flex h-full min-h-0 min-w-0 w-[58%] shrink-0 flex-col overflow-hidden border-l"
              style={{ borderColor: 'var(--border)' }}
            >
              <EventDetailPanel event={selectedEvent} onClose={() => selectEvent(null)} />
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
