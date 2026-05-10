'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
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
      <Label className="text-sm font-medium">{label}</Label>
      <Input
        type={type}
        defaultValue={value}
        placeholder={placeholder}
        className="max-w-sm"
      />
      {help && <p className="text-xs text-muted-foreground">{help}</p>}
    </div>
  )
}

function AccountTab() {
  return (
    <div className="flex flex-col gap-6 max-w-lg">
      <FormField label="Your name" value="Santiago Garces" />
      <FormField label="Email" type="email" value="santiago.garces@alwon.io" />
      <FormField label="Role" value="Store Manager" help="Contact your admin to change your role." />
      <FormField label="Time zone" value="America/Lima" />
      <Button onClick={() => toast('Saved.')} className="self-start">
        Save changes
      </Button>
    </div>
  )
}

function TeamTab() {
  const members = [
    { name: 'Santiago Garces', email: 'santiago@alwon.io', role: 'Store Manager', status: 'active' },
    { name: 'Carlos Rodriguez', email: 'carlos@alwon.io', role: 'Security', status: 'active' },
    { name: 'Sofia Torres', email: 'sofia@alwon.io', role: 'Regional Ops', status: 'active' },
    { name: 'Diego Perez', email: 'diego@alwon.io', role: 'Cashier', status: 'inactive' },
  ]
  return (
    <Card className="p-0 gap-0 overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-2.5 border-b bg-muted/50">
        <span className="text-xs text-muted-foreground font-medium flex-1">Person</span>
        <span className="text-xs text-muted-foreground font-medium w-40">Email</span>
        <span className="text-xs text-muted-foreground font-medium w-28">Role</span>
        <span className="text-xs text-muted-foreground font-medium w-20 text-right">Status</span>
      </div>
      {members.map((m) => (
        <div
          key={m.email}
          className="flex items-center gap-3 px-4 border-b hover:bg-muted/40 transition-colors"
          style={{ height: 48 }}
        >
          <span className="text-sm font-medium flex-1">{m.name}</span>
          <span className="text-xs w-40 text-muted-foreground">{m.email}</span>
          <span className="text-sm w-28 text-muted-foreground">{m.role}</span>
          <span className="w-20 flex justify-end">
            <span className="flex items-center gap-1.5">
              <span className={`size-1.5 rounded-full shrink-0 ${m.status === 'active' ? 'bg-green-500' : 'bg-muted-foreground'}`} />
              <span className="text-xs text-muted-foreground">{m.status === 'active' ? 'Active' : 'Inactive'}</span>
            </span>
          </span>
        </div>
      ))}
    </Card>
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
    <Card className="p-0 gap-0 overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-2.5 border-b bg-muted/50">
        <span className="text-xs text-muted-foreground font-medium w-20">Camera</span>
        <span className="text-xs text-muted-foreground font-medium flex-1">Where</span>
        <span className="text-xs text-muted-foreground font-medium w-20 text-right">Status</span>
        <span className="text-xs text-muted-foreground font-medium w-24 text-right">Last seen</span>
      </div>
      {cameras.map((cam) => (
        <div
          key={cam.id}
          className="flex items-center gap-3 px-4 border-b hover:bg-muted/40 transition-colors"
          style={{ height: 48 }}
        >
          <span className="font-mono text-xs w-20 font-medium">{cam.id}</span>
          <span className="text-sm flex-1 text-muted-foreground">{cam.location}</span>
          <span className="w-20 flex justify-end">
            <span className="flex items-center gap-1.5">
              <span className={`size-1.5 rounded-full shrink-0 ${cam.status === 'online' ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className={`text-xs ${cam.status === 'online' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {cam.status === 'online' ? 'Online' : 'Offline'}
              </span>
            </span>
          </span>
          <span className="text-xs w-24 text-right text-muted-foreground">{cam.lastPing}</span>
        </div>
      ))}
    </Card>
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
        <Card key={int.name}>
          <CardContent className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">{int.name}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{int.type}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5">
                <span className={`size-1.5 rounded-full shrink-0 ${int.status === 'connected' ? 'bg-green-500' : 'bg-muted-foreground'}`} />
                <span className={`text-xs ${int.status === 'connected' ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}`}>
                  {int.status === 'connected' ? 'Connected' : 'Not connected'}
                </span>
              </span>
              <Button variant="outline" size="sm" className="h-8 text-xs">
                {int.status === 'connected' ? 'Settings' : 'Connect'}
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
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

function ApiKeysTab() {
  return (
    <div className="flex flex-col gap-4 max-w-xl">
      <p className="text-sm text-muted-foreground">
        These keys let other tools connect to your Alwon account. Keep them private.
      </p>
      <Card className="p-0 gap-0 overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-2.5 border-b bg-muted/50">
          <span className="text-xs text-muted-foreground font-medium flex-1">Key</span>
          <span className="text-xs text-muted-foreground font-medium w-28">Created</span>
          <span className="w-20" />
        </div>
        {[
          { key: 'alwon_live_sk_...f8a2', created: 'Jan 14, 2026' },
          { key: 'alwon_live_sk_...3c91', created: 'Mar 02, 2026' },
        ].map((apiKey) => (
          <div key={apiKey.key} className="flex items-center gap-3 px-4 border-b last:border-0" style={{ height: 48 }}>
            <span className="font-mono text-xs flex-1 font-medium">{apiKey.key}</span>
            <span className="text-xs w-28 text-muted-foreground">{apiKey.created}</span>
            <Button
              variant="ghost"
              size="sm"
              className="w-20 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={() => toast('Key removed.')}
            >
              Remove
            </Button>
          </div>
        ))}
      </Card>
      <Button
        variant="outline"
        className="self-start"
        onClick={() => toast("New key created. Copy it now — it won't be shown again.")}
      >
        + Create new key
      </Button>
    </div>
  )
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('account')

  const content: Record<Tab, React.ReactNode> = {
    account: <AccountTab />,
    team: <TeamTab />,
    cameras: <CamerasTab />,
    rules: <RulesTab />,
    integrations: <IntegrationsTab />,
    billing: (
      <div className="flex flex-col gap-0 max-w-sm">
        {[
          { label: 'Your plan', value: 'Enterprise' },
          { label: 'Billing', value: 'Yearly' },
          { label: 'Next invoice', value: 'Jun 01, 2026' },
          { label: 'Stores included', value: '6 / unlimited' },
        ].map((item) => (
          <div key={item.label} className="flex justify-between py-3 border-b">
            <span className="text-sm text-muted-foreground">{item.label}</span>
            <span className="text-sm font-medium">{item.value}</span>
          </div>
        ))}
      </div>
    ),
    'api-keys': <ApiKeysTab />,
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-[18px] font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Manage your account, team, and how Alwon works for you.
        </p>
      </div>

      {/* Tab bar */}
      <div className="flex gap-0 overflow-x-auto border-b">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="px-4 py-2.5 text-sm transition-colors whitespace-nowrap"
            style={{
              borderBottom: activeTab === tab.id ? '2px solid var(--foreground)' : '2px solid transparent',
              marginBottom: -1,
              fontWeight: activeTab === tab.id ? 500 : 400,
            }}
          >
            <span className={activeTab === tab.id ? 'text-foreground' : 'text-muted-foreground'}>
              {tab.label}
            </span>
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
