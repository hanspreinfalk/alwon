'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { Play } from 'lucide-react'
import { toast } from 'sonner'
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
    <div
      className="flex gap-4 p-4 transition-colors"
      style={{ borderRadius: 'var(--radius)', border: '1px solid var(--border)', background: 'var(--bg-panel)' }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--border-strong)' }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)' }}
    >
      {/* Thumbnail */}
      <div
        className="flex items-center justify-center rounded-sm shrink-0"
        style={{ width: 80, height: 56, background: '#000', border: '1px solid var(--border)' }}
      >
        <Play size={16} style={{ color: 'var(--fg-dim)', marginLeft: 2 }} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-sm font-medium" style={{ color: 'var(--fg)' }}>{friendlyEvent(incident.type)}</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--fg-muted)' }}>
              {incident.store} · {incident.camera} · {format(incident.timestamp, 'HH:mm')}
            </p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-xs" style={{ color: 'var(--danger)' }}>{Math.round(incident.confidence * 100)}% sure</p>
            {incident.estimatedValue && (
              <p className="text-xs" style={{ color: 'var(--fg-muted)' }}>
                about ${incident.estimatedValue.toFixed(2)}
              </p>
            )}
          </div>
        </div>

        <p className="text-sm mt-2" style={{ color: 'var(--fg-muted)' }}>{incident.description}</p>

        <div className="flex flex-wrap items-center gap-2 mt-3">
          <button
            onClick={() => toast('Confirmed. Incident saved.')}
            className="px-3 py-1.5 text-sm rounded-md transition-colors"
            style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid var(--danger)', color: 'var(--danger)' }}
          >
            Yes, this is theft
          </button>
          <button
            onClick={() => toast("Got it — won't flag this kind again.")}
            className="px-3 py-1.5 text-sm rounded-md transition-colors"
            style={{ border: '1px solid var(--border-strong)', color: 'var(--fg-muted)' }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--border-accent)' }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-strong)' }}
          >
            Not an issue
          </button>
          <button
            onClick={() => toast('Sent to someone who can decide.')}
            className="px-3 py-1.5 text-sm rounded-md transition-colors"
            style={{ border: '1px solid var(--border-strong)', color: 'var(--fg-muted)' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--warning)' }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--fg-muted)' }}
          >
            I&apos;m not sure
          </button>
        </div>
      </div>
    </div>
  )
}

function RulesTab() {
  const [rules, setRules] = useState(DETECTION_RULES)

  const toggleRule = (id: string) => {
    setRules((prev) => prev.map((r) => r.id === id ? { ...r, enabled: !r.enabled } : r))
    toast('Rule updated.')
  }

  return (
    <div style={{ borderRadius: 'var(--radius)', border: '1px solid var(--border)', background: 'var(--bg-panel)' }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-2.5" style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg)' }}>
        <span className="text-xs flex-1" style={{ color: 'var(--fg-muted)' }}>What we watch for</span>
        <span className="text-xs w-28" style={{ color: 'var(--fg-muted)' }}>Category</span>
        <span className="text-xs w-20 text-right" style={{ color: 'var(--fg-muted)' }}>Today</span>
        <span className="text-xs w-16 text-right" style={{ color: 'var(--fg-muted)' }}>On</span>
      </div>
      {rules.map((rule) => (
        <div
          key={rule.id}
          className="flex items-center gap-3 px-4 transition-colors"
          style={{ height: 44, borderBottom: '1px solid var(--border)' }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-hover)' }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
        >
          <span className="text-sm flex-1" style={{ color: 'var(--fg)' }}>{rule.name}</span>
          <span className="text-xs w-28" style={{ color: 'var(--fg-muted)' }}>{rule.category}</span>
          <span className="text-xs w-20 text-right" style={{ color: 'var(--fg-muted)', fontVariantNumeric: 'tabular-nums' }}>
            {rule.triggerCount.toLocaleString()}
          </span>
          <div className="w-16 flex justify-end">
            <button
              onClick={() => toggleRule(rule.id)}
              className="relative inline-flex items-center rounded-full transition-colors shrink-0"
              style={{
                width: 32,
                height: 16,
                background: rule.enabled ? 'var(--brand-accent)' : 'var(--bg-elevated)',
                border: '1px solid var(--border-strong)',
              }}
            >
              <span
                className="absolute rounded-full transition-transform"
                style={{
                  width: 10,
                  height: 10,
                  background: '#fff',
                  left: rule.enabled ? 18 : 2,
                }}
              />
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

export default function LossPreventionPage() {
  const [activeTab, setActiveTab] = useState<Tab>('queue')

  const tabs: { id: Tab; label: string }[] = [
    { id: 'queue', label: 'To review' },
    { id: 'resolved', label: 'Resolved' },
    { id: 'false-positives', label: 'Not issues' },
    { id: 'rules', label: 'Alerts & rules' },
  ]

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold" style={{ color: 'var(--fg)' }}>
          Security
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--fg-muted)' }}>
          Review incidents we&apos;ve flagged and decide what to do.
        </p>
      </div>

      {/* Stats row */}
      <div
        className="flex flex-wrap gap-0"
        style={{ borderRadius: 'var(--radius)', border: '1px solid var(--border)', background: 'var(--bg-panel)' }}
      >
        {[
          { label: 'To review', value: '247', sub: 'waiting for you' },
          { label: 'Resolved today', value: '89', sub: 'incidents closed' },
          { label: 'Theft prevented this week', value: '$14,820', sub: 'estimated value saved' },
          { label: 'Wrong alerts', value: '8.4%', sub: 'over the last 30 days' },
        ].map((stat, i, arr) => (
          <div
            key={stat.label}
            className="flex flex-col gap-1 p-5 flex-1"
            style={{ borderRight: i < arr.length - 1 ? '1px solid var(--border)' : undefined }}
          >
            <p className="text-xs" style={{ color: 'var(--fg-muted)' }}>{stat.label}</p>
            <p className="font-semibold" style={{ fontSize: '1.625rem', color: 'var(--fg)', fontVariantNumeric: 'tabular-nums' }}>{stat.value}</p>
            <p className="text-xs" style={{ color: 'var(--fg-muted)' }}>{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-0" style={{ borderBottom: '1px solid var(--border)' }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="px-4 py-2.5 text-sm transition-colors"
            style={{
              color: activeTab === tab.id ? 'var(--fg)' : 'var(--fg-muted)',
              borderBottom: activeTab === tab.id ? '2px solid var(--brand-accent)' : '2px solid transparent',
              marginBottom: -1,
              fontWeight: activeTab === tab.id ? 500 : 400,
            }}
          >
            {tab.label}
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
