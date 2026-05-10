'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { Play, ShieldAlert } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { SectionHeader } from '@/components/section-header'
import { generateFlaggedIncidents, DETECTION_RULES } from '@/lib/mock-data'
import { friendlyEvent } from '@/lib/labels'
import type { FlaggedIncident } from '@/lib/types'

const incidents = generateFlaggedIncidents()
const openIncidents = incidents.filter((i) => i.status === 'open' || i.status === 'needs-context')
const resolvedIncidents = incidents.filter((i) => i.status === 'confirmed' || i.status === 'false-positive')

type Tab = 'queue' | 'resolved' | 'false-positives' | 'rules'

function IncidentCard({ incident }: { incident: FlaggedIncident }) {
  return (
    <Card>
      <CardContent className="flex gap-4">
        {/* Thumbnail */}
        <div className="flex items-center justify-center rounded-md shrink-0 bg-black border" style={{ width: 80, height: 56 }}>
          <Play className="size-4 text-muted-foreground ml-0.5" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-sm font-semibold">{friendlyEvent(incident.type)}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {incident.store} · {incident.camera} · {format(incident.timestamp, 'HH:mm')}
              </p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-xs text-red-600 dark:text-red-400 font-medium">{Math.round(incident.confidence * 100)}% sure</p>
              {incident.estimatedValue && (
                <p className="text-xs text-muted-foreground">
                  ~${incident.estimatedValue.toFixed(2)}
                </p>
              )}
            </div>
          </div>

          <p className="text-sm text-muted-foreground mt-2">{incident.description}</p>

          <div className="flex flex-wrap items-center gap-2 mt-3">
            <Button
              size="sm"
              variant="destructive"
              className="h-8 text-xs"
              onClick={() => toast('Confirmed. Incident saved.')}
            >
              Yes, this is theft
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-8 text-xs"
              onClick={() => toast("Got it — won't flag this kind again.")}
            >
              Not an issue
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-8 text-xs text-amber-600 border-amber-200 hover:bg-amber-50 dark:text-amber-400 dark:border-amber-800 dark:hover:bg-amber-950"
              onClick={() => toast('Sent to someone who can decide.')}
            >
              I&apos;m not sure
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function RulesTab() {
  const [rules, setRules] = useState(DETECTION_RULES)

  const toggleRule = (id: string) => {
    setRules((prev) => prev.map((r) => r.id === id ? { ...r, enabled: !r.enabled } : r))
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
                style={{ background: rule.enabled ? 'var(--foreground)' : 'var(--muted)', border: '1px solid var(--border)' }}
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

  const tabs: { id: Tab; label: string; count?: number }[] = [
    { id: 'queue', label: 'To review', count: openIncidents.length },
    { id: 'resolved', label: 'Resolved', count: resolvedIncidents.length },
    { id: 'false-positives', label: 'Not issues' },
    { id: 'rules', label: 'Alerts & rules' },
  ]

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-[18px] font-semibold tracking-tight">Security</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Review incidents we&apos;ve flagged and decide what to do.
        </p>
      </div>

      {/* Stats row — plain divs matching home page stat tile style */}
      <div className="grid grid-cols-2 sm:grid-cols-4 rounded-xl overflow-hidden ring-1 ring-foreground/10">
        {[
          { label: 'To review', value: '247', sub: 'waiting for you', valueClass: '' },
          { label: 'Resolved today', value: '89', sub: 'incidents closed', valueClass: '' },
          { label: 'Theft prevented', value: '$14,820', sub: 'estimated value saved', valueClass: 'text-green-600 dark:text-green-400' },
          { label: 'Wrong alerts', value: '8.4%', sub: 'over 30 days', valueClass: '' },
        ].map((stat, i, arr) => (
          <div
            key={stat.label}
            className={`flex flex-col gap-1 p-4 bg-card ${i < arr.length - 1 ? 'border-r' : ''}`}
          >
            <p className="text-xs text-muted-foreground font-medium">{stat.label}</p>
            <p className={`text-[1.625rem] font-semibold tabular-nums leading-tight ${stat.valueClass}`}>{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-0 border-b">
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
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium tabular-nums ${activeTab === tab.id ? 'bg-foreground text-background' : 'bg-muted text-muted-foreground'}`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'queue' && (
        <div className="flex flex-col gap-3">
          <SectionHeader
            title="Things to review"
            description={`${openIncidents.length} incidents waiting for your decision`}
          />
          {openIncidents.map((incident) => (
            <IncidentCard key={incident.id} incident={incident} />
          ))}
        </div>
      )}

      {activeTab === 'resolved' && (
        <div className="flex flex-col gap-3">
          <SectionHeader
            title="Recently resolved"
            description={`${resolvedIncidents.length} incidents handled today`}
          />
          {resolvedIncidents.map((incident) => (
            <IncidentCard key={incident.id} incident={incident} />
          ))}
        </div>
      )}

      {activeTab === 'false-positives' && (
        <div className="flex flex-col gap-3">
          <SectionHeader
            title="Not real issues"
            description="Events you marked as false alarms"
          />
          {incidents
            .filter((i) => i.status === 'false-positive')
            .map((incident) => (
              <IncidentCard key={incident.id} incident={incident} />
            ))}
        </div>
      )}

      {activeTab === 'rules' && (
        <div className="flex flex-col gap-3">
          <SectionHeader
            title="Alerts & rules"
            description="Turn alerts on or off. We'll notify you when these things happen."
          />
          <RulesTab />
        </div>
      )}
    </div>
  )
}
