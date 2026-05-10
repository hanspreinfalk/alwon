'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { format } from 'date-fns'
import { Play, ShieldAlert, X } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { SectionHeader } from '@/components/section-header'
import { generateFlaggedIncidents, DETECTION_RULES } from '@/lib/mock-data'
import { friendlyEvent } from '@/lib/labels'
import type { FlaggedIncident } from '@/lib/types'
import { cn } from '@/lib/utils'

const incidents = generateFlaggedIncidents()
const openIncidents = incidents.filter((i) => i.status === 'open' || i.status === 'needs-context')
const resolvedIncidents = incidents.filter((i) => i.status === 'confirmed' || i.status === 'false-positive')

const STATUS_LABELS: Record<FlaggedIncident['status'], string> = {
  open: 'Open',
  'needs-context': 'Needs context',
  confirmed: 'Confirmed theft',
  'false-positive': 'Not an issue',
}

type Tab = 'queue' | 'resolved' | 'false-positives' | 'rules'

function IncidentDetailPanel({
  incident,
  onClose,
}: {
  incident: FlaggedIncident
  onClose: () => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 16 }}
      transition={{ duration: 0.2 }}
      className="flex h-full min-h-0 min-w-0 flex-col bg-card"
    >
      <div className="flex shrink-0 items-start justify-between gap-3 border-b bg-muted/30 px-5 py-4">
        <div className="min-w-0">
          <h2 className="truncate text-lg font-semibold tracking-tight leading-tight">
            {friendlyEvent(incident.type)}
          </h2>
          <p className="mt-1 font-mono text-xs text-muted-foreground">{incident.id}</p>
        </div>
        <Button variant="ghost" size="icon-sm" onClick={onClose} className="shrink-0">
          <X />
        </Button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
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
                onClick={() =>
                  toast.info('Opening footage…', {
                    description: `${incident.camera} · ${incident.store}`,
                  })
                }
              >
                <Play className="size-6 ml-0.5" />
              </Button>
              <p className="font-mono text-xs text-white/50">{incident.camera}</p>
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

        <div className="px-5 pt-5">
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Details</p>
          <Card className="gap-0 overflow-hidden py-0 shadow-none">
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <tbody>
                  {[
                    ['When', format(incident.timestamp, 'MMM d · HH:mm:ss')],
                    ['Camera', incident.camera],
                    ['Store', incident.store],
                    ['Linked event', incident.eventId],
                    ['Status', STATUS_LABELS[incident.status]],
                    ['Confidence', `${Math.round(incident.confidence * 100)}%`],
                    ...(incident.estimatedValue != null
                      ? [['Est. value', `~$${incident.estimatedValue.toFixed(2)}`]]
                      : []),
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
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{incident.description}</p>
        </div>

        <div className="flex flex-row gap-2 px-5 py-5">
          <Button
            variant="destructive"
            className="min-w-0 flex-1 px-2 py-2 text-xs leading-tight sm:px-3 sm:text-sm"
            onClick={() => {
              toast('Confirmed. Incident saved.')
              onClose()
            }}
          >
            <span className="min-w-0 text-balance">Yes, this is theft</span>
          </Button>
          <Button
            variant="outline"
            className="min-w-0 flex-1 px-2 py-2 text-xs leading-tight sm:px-3 sm:text-sm"
            onClick={() => {
              toast("Got it — won't flag this kind again.")
              onClose()
            }}
          >
            <span className="min-w-0 text-balance">Not an issue</span>
          </Button>
          <Button
            variant="secondary"
            className="min-w-0 flex-1 px-2 py-2 text-xs leading-tight sm:px-3 sm:text-sm"
            onClick={() => toast('Sent to someone who can decide.')}
          >
            <span className="min-w-0 text-balance">I&apos;m not sure</span>
          </Button>
        </div>
      </div>
    </motion.div>
  )
}

function IncidentRow({
  incident,
  selected,
  onSelect,
}: {
  incident: FlaggedIncident
  selected: boolean
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'flex w-full items-center gap-3 border-b px-4 py-3 text-left transition-colors hover:bg-muted/40',
        selected && 'bg-muted/40',
      )}
      style={{
        borderColor: 'var(--border)',
        borderLeft: selected ? '2px solid var(--foreground)' : '2px solid transparent',
      }}
    >
      <span className="w-12 shrink-0 font-mono text-[11px] tabular-nums text-muted-foreground">
        {format(incident.timestamp, 'HH:mm')}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-medium leading-tight">{friendlyEvent(incident.type)}</p>
        <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
          {incident.store} · {incident.camera}
        </p>
      </div>
      <div className="shrink-0 text-right">
        <p className="text-[11px] font-medium tabular-nums text-muted-foreground">
          {Math.round(incident.confidence * 100)}%
        </p>
        {incident.estimatedValue != null && (
          <p className="text-[10px] text-muted-foreground">~${incident.estimatedValue.toFixed(0)}</p>
        )}
      </div>
    </button>
  )
}

function IncidentsSplitView({
  incidents,
  selectedId,
  onSelectId,
}: {
  incidents: FlaggedIncident[]
  selectedId: string | null
  onSelectId: (id: string | null) => void
}) {
  const selected = selectedId ? incidents.find((i) => i.id === selectedId) : undefined

  return (
    <div
      className="flex min-h-0 flex-1 rounded-xl border overflow-hidden"
      style={{ borderColor: 'var(--border)', background: 'var(--card)' }}
    >
      <div
        className={cn(
          'flex min-h-0 min-w-0 flex-col overflow-hidden transition-[width] duration-200',
          selectedId ? 'h-full w-[42%] shrink-0' : 'w-full flex-1',
        )}
      >
        <ScrollArea className="min-h-0 flex-1">
          {incidents.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-16 text-muted-foreground">
              <ShieldAlert className="size-8 opacity-20" />
              <p className="text-sm">Nothing here yet</p>
            </div>
          ) : (
            incidents.map((incident) => (
              <IncidentRow
                key={incident.id}
                incident={incident}
                selected={selectedId === incident.id}
                onSelect={() =>
                  onSelectId(selectedId === incident.id ? null : incident.id)
                }
              />
            ))
          )}
        </ScrollArea>
      </div>

      {selected && (
        <div
          className="flex h-full min-h-0 min-w-0 w-[58%] shrink-0 flex-col overflow-hidden border-l"
          style={{ borderColor: 'var(--border)' }}
        >
          <IncidentDetailPanel incident={selected} onClose={() => onSelectId(null)} />
        </div>
      )}
    </div>
  )
}

function RulesTab() {
  const [rules, setRules] = useState(DETECTION_RULES)

  const toggleRule = (id: string) => {
    setRules((prev) => prev.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r)))
    toast('Rule updated.')
  }

  return (
    <Card className="p-0 gap-0 overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-2.5 border-b bg-muted/50">
        <span className="text-xs text-muted-foreground font-medium flex-1">What we watch for</span>
        <span className="text-xs text-muted-foreground font-medium w-28">Category</span>
        <span className="text-xs text-muted-foreground font-medium w-20 text-right">Today</span>
        <span className="text-xs text-muted-foreground font-medium w-16 text-right">On</span>
      </div>
      {rules.map((rule) => (
        <div
          key={rule.id}
          className="flex items-center gap-3 px-4 border-b hover:bg-muted/40 transition-colors"
          style={{ height: 44 }}
        >
          <span className="text-sm flex-1">{rule.name}</span>
          <span className="text-xs w-28 text-muted-foreground">{rule.category}</span>
          <span className="text-xs w-20 text-right text-muted-foreground tabular-nums">
            {rule.triggerCount.toLocaleString()}
          </span>
          <div className="w-16 flex justify-end">
            <button
              onClick={() => toggleRule(rule.id)}
              className="relative inline-flex items-center rounded-full transition-colors shrink-0"
              role="switch"
              aria-checked={rule.enabled}
              aria-label={rule.name}
              style={{ width: 32, height: 16 }}
            >
              <span
                className="absolute inset-0 rounded-full transition-colors"
                style={{
                  background: rule.enabled ? 'var(--foreground)' : 'var(--muted)',
                  border: '1px solid var(--border)',
                }}
              />
              <span
                className="absolute rounded-full bg-white transition-all"
                style={{ width: 10, height: 10, left: rule.enabled ? 18 : 2, zIndex: 1 }}
              />
            </button>
          </div>
        </div>
      ))}
    </Card>
  )
}

export default function LossPreventionPage() {
  const [activeTab, setActiveTab] = useState<Tab>('queue')
  const [selectedId, setSelectedId] = useState<string | null>(null)

  useEffect(() => {
    setSelectedId(null)
  }, [activeTab])

  const tabs: { id: Tab; label: string; count?: number }[] = [
    { id: 'queue', label: 'To review', count: openIncidents.length },
    { id: 'resolved', label: 'Resolved', count: resolvedIncidents.length },
    { id: 'false-positives', label: 'Not issues' },
    { id: 'rules', label: 'Alerts & rules' },
  ]

  const tabIncidents: FlaggedIncident[] =
    activeTab === 'queue'
      ? openIncidents
      : activeTab === 'resolved'
        ? resolvedIncidents
        : activeTab === 'false-positives'
          ? incidents.filter((i) => i.status === 'false-positive')
          : []

  return (
    <div className="flex flex-col gap-6" style={{ height: 'calc(100vh - 52px - 48px)' }}>
      {/* Header */}
      <div className="shrink-0">
        <h1 className="text-[18px] font-semibold tracking-tight">Security</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Review incidents we&apos;ve flagged and decide what to do.
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 shrink-0 sm:grid-cols-4 rounded-xl overflow-hidden ring-1 ring-foreground/10">
        {[
          { label: 'To review', value: '247', sub: 'waiting for you', valueClass: '' },
          { label: 'Resolved today', value: '89', sub: 'incidents closed', valueClass: '' },
          {
            label: 'Theft prevented',
            value: '$14,820',
            sub: 'estimated value saved',
            valueClass: 'text-green-600 dark:text-green-400',
          },
          { label: 'Wrong alerts', value: '8.4%', sub: 'over 30 days', valueClass: '' },
        ].map((stat, i, arr) => (
          <div
            key={stat.label}
            className={`flex flex-col gap-1 p-4 bg-card ${i < arr.length - 1 ? 'border-r' : ''}`}
          >
            <p className="text-xs text-muted-foreground font-medium">{stat.label}</p>
            <p className={`text-[1.625rem] font-semibold tabular-nums leading-tight ${stat.valueClass}`}>
              {stat.value}
            </p>
            <p className="text-xs text-muted-foreground">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex shrink-0 gap-0 border-b">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="flex items-center gap-1.5 px-4 py-2.5 text-sm transition-colors"
            style={{
              borderBottom: activeTab === tab.id ? '2px solid var(--foreground)' : '2px solid transparent',
              marginBottom: -1,
              fontWeight: activeTab === tab.id ? 500 : 400,
            }}
          >
            <span className={activeTab === tab.id ? 'text-foreground' : 'text-muted-foreground'}>{tab.label}</span>
            {tab.count !== undefined && tab.count > 0 && (
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium tabular-nums ${activeTab === tab.id ? 'bg-foreground text-background' : 'bg-muted text-muted-foreground'}`}
              >
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex min-h-0 flex-1 flex-col gap-3">
        {activeTab === 'rules' ? (
          <>
            <SectionHeader
              title="Alerts & rules"
              description="Turn alerts on or off. We'll notify you when these things happen."
            />
            <RulesTab />
          </>
        ) : (
          <>
            <div className="shrink-0">
              {activeTab === 'queue' && (
                <SectionHeader
                  title="Things to review"
                  description={`${openIncidents.length} incidents waiting for your decision · click a row to open footage`}
                />
              )}
              {activeTab === 'resolved' && (
                <SectionHeader
                  title="Recently resolved"
                  description={`${resolvedIncidents.length} incidents handled today · click a row to review`}
                />
              )}
              {activeTab === 'false-positives' && (
                <SectionHeader
                  title="Not real issues"
                  description="Events you marked as false alarms · click a row for details"
                />
              )}
            </div>
            <IncidentsSplitView
              incidents={tabIncidents}
              selectedId={selectedId}
              onSelectId={setSelectedId}
            />
          </>
        )}
      </div>
    </div>
  )
}
