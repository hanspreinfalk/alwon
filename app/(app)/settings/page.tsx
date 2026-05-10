'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { SectionHeader } from '@/components/section-header'
import { DETECTION_RULES } from '@/lib/mock-data'

type Tab = 'account' | 'team' | 'cameras' | 'rules' | 'integrations' | 'billing' | 'api-keys'

const TABS: { id: Tab; label: string }[] = [
  { id: 'account', label: 'Account' },
  { id: 'team', label: 'Team' },
  { id: 'cameras', label: 'Cameras' },
  { id: 'rules', label: 'Rules' },
  { id: 'integrations', label: 'Integrations' },
  { id: 'billing', label: 'Billing' },
  { id: 'api-keys', label: 'API Keys' },
]

function FormField({
  label,
  type = 'text',
  value,
  placeholder,
  help,
}: {
  label: string
  type?: string
  value?: string
  placeholder?: string
  help?: string
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="section-label">{label}</label>
      <input
        type={type}
        defaultValue={value}
        placeholder={placeholder}
        className="px-3 py-2 text-sm rounded-sm outline-none"
        style={{
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border-strong)',
          color: 'var(--fg)',
          maxWidth: 400,
        }}
        onFocus={(e) => { e.target.style.borderColor = 'var(--border-accent)' }}
        onBlur={(e) => { e.target.style.borderColor = 'var(--border-strong)' }}
      />
      {help && <p className="text-xs" style={{ color: 'var(--fg-dim)' }}>{help}</p>}
    </div>
  )
}

function AccountTab() {
  return (
    <div className="flex flex-col gap-6 max-w-lg">
      <FormField label="DISPLAY NAME" value="Elena Martinez" />
      <FormField label="EMAIL ADDRESS" type="email" value="elena.martinez@alwon.io" />
      <FormField label="ROLE" value="Store Manager" help="Contact your admin to change your role." />
      <FormField label="TIMEZONE" value="America/Lima" />
      <button
        onClick={() => toast('Settings saved.')}
        className="data-mono text-xs px-4 py-2 self-start transition-colors"
        style={{ background: 'var(--brand-accent)', color: '#fff' }}
        onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--brand-accent-hover)' }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--brand-accent)' }}
      >
        SAVE CHANGES
      </button>
    </div>
  )
}

function TeamTab() {
  const members = [
    { name: 'Elena Martinez', email: 'elena@alwon.io', role: 'Store Manager', status: 'active' },
    { name: 'Carlos Rodriguez', email: 'carlos@alwon.io', role: 'LP Analyst', status: 'active' },
    { name: 'Sofia Torres', email: 'sofia@alwon.io', role: 'Regional Ops', status: 'active' },
    { name: 'Diego Perez', email: 'diego@alwon.io', role: 'Cashier', status: 'inactive' },
  ]
  return (
    <div style={{ border: '1px solid var(--border)' }}>
      <div className="flex items-center gap-3 px-4 py-2" style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-elevated)' }}>
        <span className="section-label flex-1">NAME</span>
        <span className="section-label w-40">EMAIL</span>
        <span className="section-label w-28">ROLE</span>
        <span className="section-label w-20 text-right">STATUS</span>
      </div>
      {members.map((m) => (
        <div
          key={m.email}
          className="flex items-center gap-3 px-4"
          style={{ height: 44, borderBottom: '1px solid var(--border)' }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-hover)' }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
        >
          <span className="text-sm flex-1" style={{ color: 'var(--fg)' }}>{m.name}</span>
          <span className="data-mono text-xs w-40" style={{ color: 'var(--fg-dim)' }}>{m.email}</span>
          <span className="data-mono text-xs w-28" style={{ color: 'var(--fg-muted)' }}>{m.role}</span>
          <span className="w-20 flex justify-end">
            <span className="flex items-center gap-1">
              <span style={{ fontSize: 6, color: m.status === 'active' ? 'var(--success)' : 'var(--fg-dim)' }}>●</span>
              <span className="data-mono text-xs" style={{ color: 'var(--fg-dim)' }}>{m.status}</span>
            </span>
          </span>
        </div>
      ))}
    </div>
  )
}

function CamerasTab() {
  const cameras = Array.from({ length: 30 }, (_, i) => ({
    id: `CAM-${String(i + 1).padStart(2, '0')}`,
    location: ['Entrance', 'Aisle A', 'Aisle B', 'Checkout', 'Storage', 'Exit'][i % 6],
    status: i === 4 || i === 17 ? 'offline' : 'online',
    lastPing: i === 4 || i === 17 ? '47m ago' : '< 1s',
  }))

  return (
    <div style={{ border: '1px solid var(--border)' }}>
      <div className="flex items-center gap-3 px-4 py-2" style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-elevated)' }}>
        <span className="section-label w-20">CAMERA</span>
        <span className="section-label flex-1">LOCATION</span>
        <span className="section-label w-20 text-right">STATUS</span>
        <span className="section-label w-24 text-right">LAST PING</span>
      </div>
      {cameras.map((cam) => (
        <div
          key={cam.id}
          className="flex items-center gap-3 px-4"
          style={{ height: 44, borderBottom: '1px solid var(--border)' }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-hover)' }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
        >
          <span className="data-mono text-xs w-20" style={{ color: 'var(--fg)' }}>{cam.id}</span>
          <span className="text-xs flex-1" style={{ color: 'var(--fg-muted)' }}>{cam.location}</span>
          <span className="w-20 flex justify-end">
            <span className="flex items-center gap-1">
              <span style={{ fontSize: 6, color: cam.status === 'online' ? 'var(--success)' : 'var(--danger)' }}>●</span>
              <span className="data-mono text-xs" style={{ color: cam.status === 'online' ? 'var(--success)' : 'var(--danger)' }}>
                {cam.status}
              </span>
            </span>
          </span>
          <span className="data-mono text-xs w-24 text-right" style={{ color: 'var(--fg-dim)' }}>{cam.lastPing}</span>
        </div>
      ))}
    </div>
  )
}

function IntegrationsTab() {
  const integrations = [
    { name: 'Stripe', status: 'connected', type: 'Payment' },
    { name: 'Mercado Pago', status: 'connected', type: 'Payment' },
    { name: 'Niubiz', status: 'connected', type: 'Payment' },
    { name: 'EBANX', status: 'connected', type: 'Payment' },
    { name: 'WhatsApp Business', status: 'connected', type: 'Messaging' },
    { name: 'Slack', status: 'disconnected', type: 'Alerts' },
    { name: 'PagerDuty', status: 'disconnected', type: 'Alerts' },
  ]
  return (
    <div className="flex flex-col gap-3">
      {integrations.map((int) => (
        <div
          key={int.name}
          className="flex items-center justify-between px-4 py-3"
          style={{ borderRadius: 'var(--radius)', border: '1px solid var(--border)', background: 'var(--bg-panel)' }}
        >
          <div>
            <p className="text-sm" style={{ color: 'var(--fg)' }}>{int.name}</p>
            <p className="section-label mt-0.5">{int.type}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5">
              <span style={{ fontSize: 6, color: int.status === 'connected' ? 'var(--success)' : 'var(--fg-dim)' }}>●</span>
              <span className="data-mono text-xs" style={{ color: int.status === 'connected' ? 'var(--success)' : 'var(--fg-dim)' }}>
                {int.status}
              </span>
            </span>
            <button
              className="px-3 py-1 data-mono text-xs transition-colors"
              style={{ border: '1px solid var(--border-strong)', color: 'var(--fg-muted)' }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--brand-accent)' }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-strong)' }}
            >
              {int.status === 'connected' ? 'CONFIGURE' : 'CONNECT'}
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

function ApiKeysTab() {
  return (
    <div className="flex flex-col gap-4 max-w-xl">
      <p className="text-sm" style={{ color: 'var(--fg-muted)' }}>
        API keys provide programmatic access to the Alwon platform. Keep them secret.
      </p>
      <div style={{ borderRadius: 'var(--radius)', border: '1px solid var(--border)', background: 'var(--bg-panel)' }}>
        <div className="flex items-center gap-3 px-4 py-2" style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg)' }}>
          <span className="section-label flex-1">KEY</span>
          <span className="section-label w-28">CREATED</span>
          <span className="section-label w-20 text-right">ACTIONS</span>
        </div>
        {[
          { key: 'alwon_live_sk_...f8a2', created: 'Jan 14, 2026' },
          { key: 'alwon_live_sk_...3c91', created: 'Mar 02, 2026' },
        ].map((apiKey) => (
          <div key={apiKey.key} className="flex items-center gap-3 px-4" style={{ height: 44, borderBottom: '1px solid var(--border)' }}>
            <span className="data-mono text-xs flex-1" style={{ color: 'var(--fg)' }}>{apiKey.key}</span>
            <span className="data-mono text-xs w-28" style={{ color: 'var(--fg-dim)' }}>{apiKey.created}</span>
            <button
              className="data-mono text-xs w-20 text-right transition-colors"
              style={{ color: 'var(--danger)' }}
              onClick={() => toast('API key revoked.')}
            >
              REVOKE
            </button>
          </div>
        ))}
      </div>
      <button
        onClick={() => toast('New API key generated. Copy it now — it will not be shown again.')}
        className="data-mono text-xs px-4 py-2 self-start transition-colors"
        style={{ border: '1px solid var(--border-strong)', color: 'var(--fg-muted)' }}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--brand-accent)'; e.currentTarget.style.color = 'var(--brand-accent)' }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-strong)'; e.currentTarget.style.color = 'var(--fg-muted)' }}
      >
        + GENERATE NEW KEY
      </button>
    </div>
  )
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('account')

  const content: Record<Tab, React.ReactNode> = {
    account: <AccountTab />,
    team: <TeamTab />,
    cameras: <CamerasTab />,
    rules: (
      <div className="flex flex-col gap-3">
        <p className="text-sm" style={{ color: 'var(--fg-muted)' }}>
          Detection rules are managed in the Loss Prevention module.
        </p>
      </div>
    ),
    integrations: <IntegrationsTab />,
    billing: (
      <div className="flex flex-col gap-4">
        {[
          { label: 'PLAN', value: 'Enterprise' },
          { label: 'BILLING CYCLE', value: 'Annual' },
          { label: 'NEXT INVOICE', value: 'Jun 01, 2026' },
          { label: 'STORES', value: '6 / unlimited' },
        ].map((item) => (
          <div key={item.label} className="flex justify-between py-3" style={{ borderBottom: '1px solid var(--border)', maxWidth: 400 }}>
            <span className="section-label">{item.label}</span>
            <span className="data-mono text-sm" style={{ color: 'var(--fg)' }}>{item.value}</span>
          </div>
        ))}
      </div>
    ),
    'api-keys': <ApiKeysTab />,
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold" style={{ color: 'var(--fg)' }}>
          <em>Settings</em>
        </h1>
      </div>

      {/* Tab bar */}
      <div className="flex gap-0" style={{ borderBottom: '1px solid var(--border)' }}>
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="px-4 py-2.5 data-mono text-xs transition-colors"
            style={{
              color: activeTab === tab.id ? 'var(--fg)' : 'var(--fg-muted)',
              borderBottom: activeTab === tab.id ? '2px solid var(--brand-accent)' : '2px solid transparent',
              marginBottom: -1,
            }}
          >
            {tab.label.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Content */}
      <div>
        {content[activeTab]}
      </div>
    </div>
  )
}
