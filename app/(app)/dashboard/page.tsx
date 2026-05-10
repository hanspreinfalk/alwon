'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { format, isToday, subDays, isFuture, startOfDay } from 'date-fns'
import {
  Activity,
  Shield,
  Video,
  ShoppingBag,
  ArrowRight,
  Play,
  TrendingUp,
  TrendingDown,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Download,
  FileText,
  FileSpreadsheet,
  CheckSquare,
} from 'lucide-react'
import { EventStream } from '@/components/event-stream'
import { friendlyEvent } from '@/lib/labels'
import type { EventType } from '@/lib/types'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  getDashboardMetricsForDate,
  generateHeatmapDataForDate,
  generateVisitorDataForDate,
} from '@/lib/mock-data'
import { cn } from '@/lib/utils'

function formatHour(h: number) {
  if (h === 0) return '12 am'
  if (h < 12) return `${h} am`
  if (h === 12) return '12 pm'
  return `${h - 12} pm`
}

function BusiestTimesBar({ date }: { date: Date }) {
  const [hoveredHour, setHoveredHour] = useState<number | null>(null)

  const heatmapData = useMemo(() => generateHeatmapDataForDate(date), [date])
  const visitorData = useMemo(() => generateVisitorDataForDate(date), [date])

  const hourlyTotals = useMemo(() =>
    Array.from({ length: 24 }, (_, h) => ({
      hour: h,
      total: heatmapData.reduce((sum, row) => sum + (row[h] ?? 0), 0),
      visitors: visitorData[h] ?? 0,
    })),
    [heatmapData, visitorData]
  )
  const busiestHour = hourlyTotals.reduce(
    (best, cur) => (cur.total > best.total ? cur : best),
    hourlyTotals[0]
  )
  const maxVal = Math.max(...hourlyTotals.map((h) => h.total))
  const currentHour = new Date().getHours()

  return (
    <div>
      <p className="text-[11px] text-muted-foreground mb-3">
        Peak around <strong className="text-foreground">{formatHour(busiestHour.hour)}</strong>
        {' · '}
        <span>{busiestHour.visitors} visitors</span>
      </p>

      {/* Scroll horizontally on narrow viewports so 24 bars stay readable */}
      <div className="-mx-1 overflow-x-auto overflow-y-visible px-1 pb-1 [scrollbar-width:thin]">
        <div className="min-w-[520px]">
          {/* Chart area */}
          <div className="relative flex items-end gap-px" style={{ height: 88 }}>
        {hourlyTotals.map(({ hour, total, visitors }) => {
          const pct = maxVal > 0 ? total / maxVal : 0
          const isBusiest = hour === busiestHour.hour
          const isCurrent = isToday(date) && hour === currentHour
          const isHovered = hoveredHour === hour

          return (
            <div
              key={hour}
              className="relative flex-1 flex items-end h-full group"
              onMouseEnter={() => setHoveredHour(hour)}
              onMouseLeave={() => setHoveredHour(null)}
            >
              {/* Hover tooltip */}
              {isHovered && (
                <div
                  className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 z-20 pointer-events-none"
                  style={{ minWidth: 110 }}
                >
                  <div
                    className="rounded-lg px-2.5 py-2 text-left shadow-lg"
                    style={{
                      background: 'var(--bg-panel)',
                      border: '1px solid var(--border-strong)',
                      color: 'var(--fg)',
                    }}
                  >
                    <p className="text-[11px] font-semibold mb-1" style={{ color: 'var(--fg-muted)' }}>
                      {formatHour(hour)}
                    </p>
                    <p className="text-[13px] font-bold tabular-nums leading-tight">
                      {visitors.toLocaleString()}
                      <span className="text-[11px] font-normal text-muted-foreground ml-1">visitors</span>
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-0.5 tabular-nums">
                      {total.toLocaleString()} events
                    </p>
                    {/* Arrow */}
                    <div
                      className="absolute top-full left-1/2 -translate-x-1/2"
                      style={{
                        width: 0,
                        height: 0,
                        borderLeft: '5px solid transparent',
                        borderRight: '5px solid transparent',
                        borderTop: '5px solid var(--border-strong)',
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Bar */}
              <div
                className="w-full rounded-sm transition-opacity duration-75"
                style={{
                  height: `${Math.max(pct * 100, 4)}%`,
                  background: isBusiest || isCurrent
                    ? 'var(--brand-accent)'
                    : isHovered
                      ? `color-mix(in srgb, var(--brand-accent) ${Math.round((0.35 + pct * 0.45) * 100)}%, transparent)`
                      : `color-mix(in srgb, var(--brand-accent) ${Math.round((0.12 + pct * 0.45) * 100)}%, transparent)`,
                  opacity: isCurrent && !isBusiest ? 0.7 : 1,
                }}
              />
            </div>
          )
        })}
          </div>

          {/* X-axis labels */}
          <div className="mt-2 flex justify-between">
            {['12 am', '6 am', '12 pm', '6 pm', '11 pm'].map((l) => (
              <span key={l} className="text-[11px] text-muted-foreground">{l}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

const flaggedEvents = [
  { id: 'evt-001', type: 'pick-without-pay', camera: 'CAM-07', time: '2:27 pm',  value: '$84.50', conf: 0.94 },
  { id: 'evt-002', type: 'tailgating',        camera: 'CAM-14', time: '1:55 pm',  value: null,     conf: 0.88 },
  { id: 'evt-003', type: 'cart-tampering',    camera: 'CAM-03', time: '12:41 pm', value: '$22.00', conf: 0.91 },
  { id: 'evt-004', type: 'walk-out',          camera: 'CAM-09', time: '11:18 am', value: '$47.30', conf: 0.97 },
  { id: 'evt-005', type: 'pick-without-pay',  camera: 'CAM-02', time: '10:54 am', value: '$31.20', conf: 0.86 },
  { id: 'evt-006', type: 'tailgating',        camera: 'CAM-21', time: '9:38 am',  value: null,     conf: 0.82 },
]

const REPORT_SECTIONS = [
  { id: 'events',   label: 'Event log',         desc: 'All flagged and warning events' },
  { id: 'shrink',   label: 'Shrink & loss',      desc: 'Prevention savings by store' },
  { id: 'inventory',label: 'Inventory status',   desc: 'Stock levels and OOS incidents' },
  { id: 'payments', label: 'Payment summary',    desc: 'Success rates and failovers' },
  { id: 'cameras',  label: 'Camera health',      desc: 'Uptime and offline events' },
]

function DownloadReportDialog({
  open,
  onOpenChange,
  date,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  date: Date
}) {
  const [selected, setSelected] = useState<string[]>(['events', 'shrink'])
  const [format2, setFormat2] = useState<'pdf' | 'csv'>('pdf')

  const toggle = (id: string) =>
    setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl gap-0 p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle className="text-base font-semibold flex items-center gap-2">
            <Download size={16} style={{ color: 'var(--brand-accent)' }} />
            Download report
          </DialogTitle>
          <DialogDescription className="text-xs mt-1">
            {format(date, 'EEEE, MMMM d, yyyy')} · Choose what to include
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 py-4 flex flex-col gap-4">
          {/* Format picker */}
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">Format</p>
            <div className="flex gap-2">
              {([
                { value: 'pdf', label: 'PDF', Icon: FileText },
                { value: 'csv', label: 'CSV / Excel', Icon: FileSpreadsheet },
              ] as const).map(({ value, label, Icon }) => (
                <button
                  key={value}
                  onClick={() => setFormat2(value)}
                  className="flex items-center gap-2 flex-1 px-3 py-2.5 rounded-xl text-sm font-medium border transition-colors"
                  style={{
                    borderColor: format2 === value ? 'var(--brand-accent)' : 'var(--border)',
                    background: format2 === value ? 'var(--brand-accent-glow)' : 'transparent',
                    color: format2 === value ? 'var(--brand-accent)' : 'var(--fg-muted)',
                  }}
                >
                  <Icon size={14} />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Section checkboxes */}
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">Sections</p>
            <div className="flex flex-col gap-1">
              {REPORT_SECTIONS.map(({ id, label, desc }) => {
                const checked = selected.includes(id)
                return (
                  <button
                    key={id}
                    onClick={() => toggle(id)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors hover:bg-muted/50"
                  >
                    <div
                      className="flex items-center justify-center rounded-md shrink-0 size-5 transition-colors"
                      style={{
                        background: checked ? 'var(--brand-accent)' : 'transparent',
                        border: `1.5px solid ${checked ? 'var(--brand-accent)' : 'var(--border-strong)'}`,
                      }}
                    >
                      {checked && <CheckSquare size={11} color="#fff" strokeWidth={2.5} />}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium leading-tight">{label}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">{desc}</p>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col-reverse gap-2 border-t bg-muted/30 px-6 py-4 sm:flex-row">
          <Button variant="ghost" size="sm" className="text-xs w-full sm:w-auto" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            size="sm"
            className="w-full flex-1 gap-1.5 text-xs sm:w-auto"
            disabled={selected.length === 0}
            onClick={() => onOpenChange(false)}
            style={{ background: 'var(--brand-accent)', color: '#fff' }}
          >
            <Download size={13} />
            Download {format2.toUpperCase()} · {selected.length} section{selected.length !== 1 ? 's' : ''}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function DatePicker({ date, onChange }: { date: Date; onChange: (d: Date) => void }) {
  const [open, setOpen] = useState(false)
  const today = startOfDay(new Date())
  const isViewingToday = isToday(date)

  return (
    <div className="flex w-full flex-wrap items-center justify-center gap-1 sm:w-auto sm:justify-start">
      {/* Prev day */}
      <button
        onClick={() => onChange(subDays(date, 1))}
        className="flex items-center justify-center rounded-md h-8 w-8 border transition-colors hover:bg-muted text-muted-foreground hover:text-foreground"
        style={{ borderColor: 'var(--border)' }}
        title="Previous day"
      >
        <ChevronLeft size={14} />
      </button>

      {/* Calendar popover trigger */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            className={cn(
              'flex items-center gap-1.5 h-8 px-3 rounded-md border text-xs font-medium transition-colors',
              isViewingToday
                ? 'border-border text-muted-foreground hover:bg-muted hover:text-foreground'
                : 'border-brand-accent text-brand-accent hover:bg-brand-accent/5'
            )}
            style={{
              borderColor: isViewingToday ? 'var(--border)' : 'var(--brand-accent)',
              color: isViewingToday ? 'var(--fg-muted)' : 'var(--brand-accent)',
            }}
          >
            <CalendarDays size={12} />
            {isViewingToday ? 'Today' : format(date, 'MMM d, yyyy')}
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto max-w-[calc(100vw-2rem)] p-0 rounded-xl" align="center">
          <Calendar
            mode="single"
            selected={date}
            onSelect={(d) => {
              if (d) { onChange(d); setOpen(false) }
            }}
            disabled={(d) => isFuture(startOfDay(d))}
            defaultMonth={date}
          />
          {!isViewingToday && (
            <div className="border-t px-3 py-2">
              <button
                onClick={() => { onChange(today); setOpen(false) }}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                ← Back to today
              </button>
            </div>
          )}
        </PopoverContent>
      </Popover>

      {/* Next day — disabled if already today */}
      <button
        onClick={() => { if (!isViewingToday) onChange(subDays(date, -1)) }}
        disabled={isViewingToday}
        className="flex items-center justify-center rounded-md h-8 w-8 border transition-colors hover:bg-muted text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed"
        style={{ borderColor: 'var(--border)' }}
        title="Next day"
      >
        <ChevronRight size={14} />
      </button>
    </div>
  )
}

export default function DashboardPage() {
  const router = useRouter()
  const [selectedDate, setSelectedDate] = useState<Date>(startOfDay(new Date()))
  const [reportOpen, setReportOpen] = useState(false)

  const metrics = useMemo(() => getDashboardMetricsForDate(selectedDate), [selectedDate])
  const viewingToday = isToday(selectedDate)

  const statTiles = useMemo(() => [
    {
      label: viewingToday ? 'Activity today' : 'Activity',
      value: metrics.eventsProcessed.toLocaleString(),
      delta: metrics.eventsProcessedDelta,
      deltaLabel: 'vs prev. day',
      icon: Activity,
    },
    {
      label: 'Theft prevented',
      value: `$${metrics.shrinkPrevented.toLocaleString()}`,
      subtitle: 'saved',
      icon: Shield,
    },
    {
      label: 'Cameras online',
      value: `${metrics.activeCameras}/${metrics.totalCameras}`,
      subtitle: `${metrics.totalCameras - metrics.activeCameras} offline`,
      icon: Video,
      onClick: true,
    },
    {
      label: 'Walk-outs',
      value: String(metrics.walkouts),
      subtitle: `${metrics.walkoutPct}% of checkouts`,
      icon: ShoppingBag,
    },
  ] as const, [metrics, viewingToday])

  const greeting = useMemo(() => {
    if (viewingToday) {
      const hour = new Date().getHours()
      if (hour < 12) return 'Good morning, Santiago'
      if (hour < 18) return 'Good afternoon, Santiago'
      return 'Good evening, Santiago'
    }
    return `Overview for ${format(selectedDate, 'MMMM d, yyyy')}`
  }, [viewingToday, selectedDate])

  return (
    <>
    <DownloadReportDialog open={reportOpen} onOpenChange={setReportOpen} date={selectedDate} />
    <div className="flex flex-col gap-4 sm:gap-5 flex-1 min-h-0">

      {/* ── Header ─── */}
      <div className="flex flex-shrink-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div className="min-w-0">
          <h1 className="text-[17px] font-semibold tracking-tight sm:text-[18px]">{greeting}</h1>
          <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">
            {viewingToday
              ? `${format(selectedDate, 'EEEE, MMMM d')} · All your stores at a glance`
              : `${format(selectedDate, 'EEEE, MMMM d, yyyy')} · Historical view`
            }
          </p>
        </div>
        <div className="flex w-full flex-shrink-0 flex-col gap-2 sm:w-auto sm:flex-row sm:items-center sm:justify-end">
          <DatePicker date={selectedDate} onChange={setSelectedDate} />
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 rounded-lg text-xs sm:w-auto"
            onClick={() => setReportOpen(true)}
          >
            <Download size={13} />
            <span className="hidden min-[360px]:inline">Download report</span>
            <span className="min-[360px]:hidden">Report</span>
          </Button>
        </div>
      </div>

      {/* Past-date banner */}
      {!viewingToday && (
        <div
          className="flex flex-shrink-0 flex-col gap-2 rounded-xl border px-3 py-2.5 text-xs sm:flex-row sm:items-center sm:gap-3 sm:px-4"
          style={{
            background: 'var(--brand-accent-glow)',
            borderColor: 'var(--border-accent)',
            color: 'var(--brand-accent)',
          }}
        >
          <div className="flex min-w-0 items-start gap-2 sm:items-center">
            <CalendarDays size={13} className="mt-0.5 shrink-0 sm:mt-0" />
            <span className="leading-snug">
              Viewing historical data for <strong>{format(selectedDate, 'EEEE, MMMM d, yyyy')}</strong>.
              The live event stream below shows today&apos;s activity.
            </span>
          </div>
          <button
            type="button"
            onClick={() => setSelectedDate(startOfDay(new Date()))}
            className="shrink-0 self-start font-medium underline underline-offset-2 opacity-80 transition-opacity hover:opacity-100 sm:ml-auto sm:self-center"
          >
            Back to today
          </button>
        </div>
      )}

      {/* ── Stat tiles ─── */}
      <div className="grid flex-shrink-0 grid-cols-2 gap-2 sm:gap-3 md:grid-cols-4">
        {statTiles.map((tile) => {
          const Icon = tile.icon
          return (
            <div
              key={tile.label}
              onClick={'onClick' in tile && tile.onClick ? () => router.push('/settings?tab=cameras') : undefined}
              className={cn(
                'flex flex-col gap-2 rounded-xl bg-card p-3 ring-1 ring-foreground/10 sm:gap-3 sm:p-4',
                'onClick' in tile && tile.onClick ? 'cursor-pointer hover:bg-muted/30 transition-colors' : ''
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-medium leading-tight text-muted-foreground sm:text-xs">{tile.label}</span>
                <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                  <Icon size={14} />
                </div>
              </div>
              <div>
                <span className="text-xl font-bold tabular-nums leading-none tracking-tight sm:text-2xl">{tile.value}</span>
                {'delta' in tile && tile.delta !== undefined ? (
                  <p className={cn(
                    'flex items-center gap-0.5 text-xs mt-1.5',
                    tile.delta >= 0 ? 'text-green-600 dark:text-green-400' : 'text-destructive'
                  )}>
                    {tile.delta >= 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                    {tile.delta >= 0 ? '+' : ''}{tile.delta}% {tile.deltaLabel}
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground mt-1.5">{'subtitle' in tile ? tile.subtitle : ''}</p>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* ── Busiest times ─── */}
      <Card className="flex-shrink-0 rounded-xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Busiest times of day</CardTitle>
        </CardHeader>
        <CardContent className="px-3 pt-0 sm:px-6">
          <BusiestTimesBar date={selectedDate} />
        </CardContent>
      </Card>

      {/* ── Main grid ─── */}
      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-[3fr_2fr]">

        {/* Live event stream */}
        <Card className="gap-0 overflow-hidden rounded-xl p-0">
          <CardHeader className="flex-shrink-0 border-b px-4 pb-3 pt-4 sm:px-5">
            <div>
              <CardTitle className="text-sm font-semibold">
                {viewingToday ? "What's happening now" : 'Recent activity'}
              </CardTitle>
              <CardDescription className="mt-0.5 text-xs">Live activity across all your stores</CardDescription>
            </div>
            <CardAction>
              <Button variant="ghost" size="sm" asChild className="h-7 gap-1 text-xs text-muted-foreground hover:text-foreground">
                <Link href="/events">See all <ArrowRight size={12} /></Link>
              </Button>
            </CardAction>
          </CardHeader>
          <div className="h-[280px] overflow-hidden sm:h-[340px] lg:h-96">
            <EventStream limit={30} />
          </div>
        </Card>

        {/* Right panel — single merged card */}
        <Card className="flex-shrink-0 gap-0 overflow-hidden rounded-xl p-0">
          {/* Card header */}
          <CardHeader className="border-b px-4 py-3">
            <div>
              <CardTitle className="text-sm font-semibold">Needs attention</CardTitle>
              <CardDescription className="mt-0.5 text-xs">Flagged events that need review</CardDescription>
            </div>
            <CardAction>
              <Button variant="ghost" size="sm" asChild className="h-7 gap-1 text-xs text-muted-foreground hover:text-foreground">
                <Link href="/loss-prevention">Open all <ArrowRight size={12} /></Link>
              </Button>
            </CardAction>
          </CardHeader>

          {/* Section: flagged events */}
          <div className="flex flex-col">
            {flaggedEvents.map((item) => (
              <Link
                key={item.id}
                href={`/events/${item.id}`}
                className="flex min-h-[52px] items-center gap-2 border-b px-3 py-2.5 transition-colors hover:bg-muted/50 sm:gap-3 sm:px-4"
              >
                <div className="flex size-8 shrink-0 items-center justify-center rounded-md border border-destructive/15 bg-destructive/8 text-destructive">
                  <Play size={11} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium leading-tight">{friendlyEvent(item.type as EventType)}</p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">{item.camera} · {item.time}</p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-0.5">
                  <Badge variant="destructive" className="px-1.5 text-[10px] font-semibold">{Math.round(item.conf * 100)}%</Badge>
                  {item.value && <span className="text-[11px] text-muted-foreground">{item.value}</span>}
                </div>
              </Link>
            ))}
          </div>

        </Card>

      </div>
    </div>
    </>
  )
}
