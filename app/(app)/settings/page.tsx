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
  { id: 'rules', label: 'Alerts & rules' },
  { id: 'integrations', label: 'Connections' },
  { id: 'billing', label: 'Billing' },
  { id: 'api-keys', label: 'Developer keys' },
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
      <label className="text-sm" style={{ color: 'var(--fg)', fontWeight: 500 }}>{label}</label>
      <input
        type={type}
        defaultValue={value}
        placeholder={placeholder}
        className="px-3 py-2 text-sm rounded-md outline-none"
        style={{
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border-strong)',
          color: 'var(--fg)',
          maxWidth: 400,
        }}
        onFocus={(e) => { e.target.style.borderColor = 'var(--border-accent)' }}
        onBlur={(e) => { e.target.style.borderColor = 'var(--border-strong)' }}
      />
      {help && <p className="text-xs" style={{ color: 'var(--fg-muted)' }}>{help}</p>}
    </div>
  )
}

function AccountTab() {
  return (
    <div className="flex flex-col gap-6 max-w-lg">
      <FormField label="Your name" value="Elena Martinez" />
      <FormField label="Email" type="email" value="elena.martinez@alwon.io" />
      <FormField label="Role" value="Store Manager" help="Contact your admin to change your role." />
      <FormField label="Time zone" value="America/Lima" />
      <button
        onClick={() => toast('Saved.')}
        className="text-sm font-medium px-4 py-2 self-start rounded-md transition-colors"
        style={{ background: 'var(--brand-accent)', color: '#fff' }}
        onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--brand-accent-hover)' }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--brand-accent)' }}
      >
        Save changes
      </button>
    </div>
  )
}

function TeamTab() {
  const members = [
    { name: 'Elena Martinez', email: 'elena@alwon.io', role: 'Store Manager', status: 'active' },
    { name: 'Carlos Rodriguez', email: 'carlos@alwon.io', role: 'Security', status: 'active' },
    { name: 'Sofia Torres', email: 'sofia@alwon.io', role: 'Regional Ops', status: 'active' },
    { name: 'Diego Perez', email: 'diego@alwon.io', role: 'Cashier', status: 'inactive' },
  ]
  return (
    <div style={{ borderRadius: 'var(--radius)', border: '1px solid var(--border)', overflow: 'hidden' }}>
      <div className="flex items-center gap-3 px-4 py-2.5" style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-elevated)' }}>
        <span className="text-xs flex-1" style={{ color: 'var(--fg-muted)' }}>Person</span>
        <span className="text-xs w-40" style={{ color: 'var(--fg-muted)' }}>Email</span>
        <span className="text-xs w-28" style={{ color: 'var(--fg-muted)' }}>Role</span>
        <span className="text-xs w-20 text-right" style={{ color: 'var(--fg-muted)' }}>Status</span>
      </div>
      {members.map((m) => (
        <div
          key={m.email}
          className="flex items-center gap-3 px-4"
          style={{ height: 48, borderBottom: '1px solid var(--border)' }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-hover)' }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
        >
          <span className="text-sm flex-1" style={{ color: 'var(--fg)' }}>{m.name}</span>
          <span className="text-xs w-40" style={{ color: 'var(--fg-muted)' }}>{m.email}</span>
          <span className="text-sm w-28" style={{ color: 'var(--fg-muted)' }}>{m.role}</span>
          <span className="w-20 flex justify-end">
            <span className="flex items-center gap-1.5">
              <span style={{ fontSize: 7, color: m.status === 'active' ? 'var(--success)' : 'var(--fg-muted)' }}>●</span>
              <span className="text-xs" style={{ color: 'var(--fg-muted)' }}>{m.status === 'active' ? 'Active' : 'Inactive'}</span>
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
    lastPing: i === 4 || i === 17 ? '47 min ago' : 'just now',
  }))

  return (
    <div style={{ borderRadius: 'var(--radius)', border: '1px solid var(--border)', overflow: 'hidden' }}>
      <div className="flex items-center gap-3 px-4 py-2.5" style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-elevated)' }}>
        <span className="text-xs w-20" style={{ color: 'var(--fg-muted)' }}>Camera</span>
        <span className="text-xs flex-1" style={{ color: 'var(--fg-muted)' }}>Where</span>
        <span className="text-xs w-20 text-right" style={{ color: 'var(--fg-muted)' }}>Status</span>
        <span className="text-xs w-24 text-right" style={{ color: 'var(--fg-muted)' }}>Last seen</span>
      </div>
      {cameras.map((cam) => (
        <div
          key={cam.id}
          className="flex items-center gap-3 px-4"
          style={{ height: 48, borderBottom: '1px solid var(--border)' }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-hover)' }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
        >
          <span className="data-mono text-xs w-20" style={{ color: 'var(--fg)' }}>{cam.id}</span>
          <span className="text-sm flex-1" style={{ color: 'var(--fg-muted)' }}>{cam.location}</span>
          <span className="w-20 flex justify-end">
            <span className="flex items-center gap-1.5">
              <span style={{ fontSize: 7, color: cam.status === 'online' ? 'var(--success)' : 'var(--danger)' }}>●</span>
              <span className="text-xs" style={{ color: cam.status === 'online' ? 'var(--success)' : 'var(--danger)' }}>
                {cam.status === 'online' ? 'Online' : 'Offline'}
              </span>
            </span>
          </span>
          <span className="text-xs w-24 text-right" style={{ color: 'var(--fg-muted)' }}>{cam.lastPing}</span>
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
            <p className="text-sm font-medium" style={{ color: 'var(--fg)' }}>{int.name}</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--fg-muted)' }}>{int.type}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5">
              <span style={{ fontSize: 7, color: int.status === 'connected' ? 'var(--success)' : 'var(--fg-muted)' }}>●</span>
              <span className="text-xs" style={{ color: int.status === 'connected' ? 'var(--success)' : 'var(--fg-muted)' }}>
                {int.status === 'connected' ? 'Connected' : 'Not connected'}
              </span>
            </span>
            <button
              className="px-3 py-1.5 text-sm rounded-md transition-colors"
              style={{ border: '1px solid var(--border-strong)', color: 'var(--fg-muted)' }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--brand-accent)' }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-strong)' }}
            >
              {int.status === 'connected' ? 'Settings' : 'Connect'}
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
        These keys let other tools connect to your Alwon account. Keep them private.
      </p>
      <div style={{ borderRadius: 'var(--radius)', border: '1px solid var(--border)', background: 'var(--bg-panel)', overflow: 'hidden' }}>
        <div className="flex items-center gap-3 px-4 py-2.5" style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg)' }}>
          <span className="text-xs flex-1" style={{ color: 'var(--fg-muted)' }}>Key</span>
          <span className="text-xs w-28" style={{ color: 'var(--fg-muted)' }}>Created</span>
          <span className="text-xs w-20 text-right" style={{ color: 'var(--fg-muted)' }}></span>
        </div>
        {[
          { key: 'alwon_live_sk_...f8a2', created: 'Jan 14, 2026' },
          { key: 'alwon_live_sk_...3c91', created: 'Mar 02, 2026' },
        ].map((apiKey) => (
          <div key={apiKey.key} className="flex items-center gap-3 px-4" style={{ height: 48, borderBottom: '1px solid var(--border)' }}>
            <span className="data-mono text-xs flex-1" style={{ color: 'var(--fg)' }}>{apiKey.key}</span>
            <span className="text-xs w-28" style={{ color: 'var(--fg-muted)' }}>{apiKey.created}</span>
            <button
              className="text-sm w-20 text-right transition-colors"
              style={{ color: 'var(--danger)' }}
              onClick={() => toast('Key removed.')}
            >
              Remove
            </button>
          </div>
        ))}
      </div>
      <button
        onClick={() => toast('New key created. Copy it now — it won\'t be shown again.')}
        className="text-sm px-4 py-2 self-start rounded-md transition-colors"
        style={{ border: '1px solid var(--border-strong)', color: 'var(--fg-muted)' }}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--brand-accent)'; e.currentTarget.style.color = 'var(--brand-accent)' }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-strong)'; e.currentTarget.style.color = 'var(--fg-muted)' }}
      >
        + Create new key
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
          You can manage alerts and rules from the Security page.
        </p>
      </div>
    ),
    integrations: <IntegrationsTab />,
    billing: (
      <div className="flex flex-col gap-4">
        {[
          { label: 'Your plan', value: 'Enterprise' },
          { label: 'Billing', value: 'Yearly' },
          { label: 'Next invoice', value: 'Jun 01, 2026' },
          { label: 'Stores included', value: '6 / unlimited' },
        ].map((item) => (
          <div key={item.label} className="flex justify-between py-3" style={{ borderBottom: '1px solid var(--border)', maxWidth: 400 }}>
            <span className="text-sm" style={{ color: 'var(--fg-muted)' }}>{item.label}</span>
            <span className="text-sm" style={{ color: 'var(--fg)' }}>{item.value}</span>
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
          Settings
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--fg-muted)' }}>
          Manage your account, team, and how Alwon works for you.
        </p>
      </div>

      {/* Tab bar */}
      <div className="flex gap-0 overflow-x-auto" style={{ borderBottom: '1px solid var(--border)' }}>
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="px-4 py-2.5 text-sm transition-colors whitespace-nowrap"
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

      {/* Content */}
      <div>
        {content[activeTab]}
      </div>
    </div>
  )
}
