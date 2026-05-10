'use client'

import { Suspense, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { Plus, Search, UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DETECTION_RULES } from '@/lib/mock-data'

type Tab = 'account' | 'team' | 'cameras' | 'rules' | 'integrations' | 'billing'

const INVITE_ROLES = [
  'Store Manager',
  'Regional Ops',
  'Security',
  'Cashier',
  'Store Staff',
  'Admin',
] as const

const TIMEZONE_OPTIONS: { value: string; label: string }[] = [
  { value: 'Pacific/Honolulu', label: 'Pacific/Honolulu' },
  { value: 'America/Anchorage', label: 'America/Anchorage' },
  { value: 'America/Los_Angeles', label: 'America/Los Angeles' },
  { value: 'America/Denver', label: 'America/Denver' },
  { value: 'America/Chicago', label: 'America/Chicago' },
  { value: 'America/New_York', label: 'America/New York' },
  { value: 'America/Sao_Paulo', label: 'America/São Paulo' },
  { value: 'America/Bogota', label: 'America/Bogotá' },
  { value: 'America/Lima', label: 'America/Lima' },
  { value: 'America/Santiago', label: 'America/Santiago' },
  { value: 'America/Buenos_Aires', label: 'America/Buenos Aires' },
  { value: 'Europe/London', label: 'Europe/London' },
  { value: 'Europe/Paris', label: 'Europe/Paris' },
  { value: 'Europe/Berlin', label: 'Europe/Berlin' },
  { value: 'Europe/Madrid', label: 'Europe/Madrid' },
  { value: 'Africa/Johannesburg', label: 'Africa/Johannesburg' },
  { value: 'Asia/Dubai', label: 'Asia/Dubai' },
  { value: 'Asia/Kolkata', label: 'Asia/Kolkata' },
  { value: 'Asia/Bangkok', label: 'Asia/Bangkok' },
  { value: 'Asia/Singapore', label: 'Asia/Singapore' },
  { value: 'Asia/Tokyo', label: 'Asia/Tokyo' },
  { value: 'Asia/Seoul', label: 'Asia/Seoul' },
  { value: 'Australia/Sydney', label: 'Australia/Sydney' },
  { value: 'Pacific/Auckland', label: 'Pacific/Auckland' },
  { value: 'UTC', label: 'UTC' },
]

const TABS: { id: Tab; label: string }[] = [
  { id: 'account', label: 'Account' },
  { id: 'team', label: 'Team' },
  { id: 'cameras', label: 'Cameras' },
  { id: 'rules', label: 'Alerts & rules' },
  { id: 'integrations', label: 'Connections' },
  { id: 'billing', label: 'Billing' },
]

const VALID_TABS = new Set<Tab>(TABS.map((t) => t.id))

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
  const [timezone, setTimezone] = useState('America/Lima')

  return (
    <div className="flex flex-col gap-6 max-w-lg">
      <FormField label="Your name" value="Santiago Garces" />
      <FormField label="Email" type="email" value="santiago.garces@alwon.io" />
      <FormField label="Role" value="Store Manager" help="Contact your admin to change your role." />
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="account-timezone" className="text-sm font-medium">
          Time zone
        </Label>
        <Select value={timezone} onValueChange={setTimezone}>
          <SelectTrigger id="account-timezone" className="w-full max-w-sm">
            <SelectValue placeholder="Select time zone" />
          </SelectTrigger>
          <SelectContent position="popper" className="max-h-72 w-[var(--radix-select-trigger-width)]">
            {TIMEZONE_OPTIONS.map((tz) => (
              <SelectItem key={tz.value} value={tz.value}>
                {tz.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Button onClick={() => toast('Saved.')} className="self-start">
        Save changes
      </Button>
    </div>
  )
}

const TEAM_MEMBERS = [
  { name: 'Santiago Garces', email: 'santiago@alwon.io', role: 'Store Manager', status: 'active' as const },
  { name: 'Carlos Rodriguez', email: 'carlos@alwon.io', role: 'Security', status: 'active' as const },
  { name: 'Sofia Torres', email: 'sofia@alwon.io', role: 'Regional Ops', status: 'active' as const },
  { name: 'Diego Perez', email: 'diego@alwon.io', role: 'Cashier', status: 'inactive' as const },
]

function TeamTab() {
  const [query, setQuery] = useState('')
  const [inviteOpen, setInviteOpen] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<string>(INVITE_ROLES[4])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return TEAM_MEMBERS
    return TEAM_MEMBERS.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q) ||
        m.role.toLowerCase().includes(q) ||
        m.status.includes(q)
    )
  }, [query])

  const sendInvite = () => {
    const email = inviteEmail.trim()
    if (!email) {
      toast.error('Enter an email address.')
      return
    }
    toast.success(`Invitation sent to ${email} (${inviteRole})`)
    setInviteOpen(false)
    setInviteEmail('')
    setInviteRole(INVITE_ROLES[4])
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-md flex-1">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, email, or role…"
            className="pl-9"
            aria-label="Search team"
          />
        </div>
        <Button type="button" className="shrink-0 gap-1.5" onClick={() => setInviteOpen(true)}>
          <UserPlus className="size-4" />
          Invite
        </Button>
      </div>

      <Card className="p-0 gap-0 overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-2.5 border-b bg-muted/50">
          <span className="text-xs text-muted-foreground font-medium flex-1">Person</span>
          <span className="text-xs text-muted-foreground font-medium w-40">Email</span>
          <span className="text-xs text-muted-foreground font-medium w-28">Role</span>
          <span className="text-xs text-muted-foreground font-medium w-20 text-right">Status</span>
        </div>
        {filtered.length === 0 ? (
          <div className="px-4 py-10 text-center text-sm text-muted-foreground">No people match your search.</div>
        ) : (
          filtered.map((m) => (
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
          ))
        )}
      </Card>

      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite someone</DialogTitle>
            <DialogDescription>They will receive an email with a link to join your workspace.</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="invite-email">Email</Label>
              <Input
                id="invite-email"
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="name@company.com"
                autoComplete="email"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="invite-role">Role</Label>
              <Select value={inviteRole} onValueChange={setInviteRole}>
                <SelectTrigger id="invite-role" className="w-full">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent position="popper">
                  {INVITE_ROLES.map((role) => (
                    <SelectItem key={role} value={role}>
                      {role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setInviteOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={sendInvite}>
              Send invite
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

type CameraRow = {
  id: string
  location: string
  status: 'online' | 'offline'
  lastPing: string
}

function buildInitialCameras(): CameraRow[] {
  return Array.from({ length: 30 }, (_, i) => ({
    id: `CAM-${String(i + 1).padStart(2, '0')}`,
    location: ['Entrance', 'Aisle A', 'Aisle B', 'Checkout', 'Storage', 'Exit'][i % 6],
    status: i === 4 || i === 17 ? 'offline' : 'online',
    lastPing: i === 4 || i === 17 ? '47 min ago' : 'just now',
  }))
}

function CamerasTab() {
  const [cameras, setCameras] = useState<CameraRow[]>(buildInitialCameras)
  const [query, setQuery] = useState('')
  const [addOpen, setAddOpen] = useState(false)
  const [newLocation, setNewLocation] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return cameras
    return cameras.filter(
      (c) =>
        c.id.toLowerCase().includes(q) ||
        c.location.toLowerCase().includes(q) ||
        c.status.includes(q)
    )
  }, [cameras, query])

  const nextCameraId = useMemo(() => {
    let max = 0
    for (const c of cameras) {
      const m = /^CAM-(\d+)$/i.exec(c.id)
      if (m) max = Math.max(max, parseInt(m[1], 10))
    }
    return `CAM-${String(max + 1).padStart(2, '0')}`
  }, [cameras])

  const addCamera = () => {
    const location = newLocation.trim() || 'Unassigned'
    setCameras((prev) => [
      ...prev,
      {
        id: nextCameraId,
        location,
        status: 'online',
        lastPing: 'just now',
      },
    ])
    toast.success(`Added ${nextCameraId}`)
    setAddOpen(false)
    setNewLocation('')
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-md flex-1">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search camera ID or location…"
            className="pl-9"
            aria-label="Search cameras"
          />
        </div>
        <Button type="button" variant="outline" className="shrink-0 gap-1.5" onClick={() => setAddOpen(true)}>
          <Plus className="size-4" />
          Add camera
        </Button>
      </div>

      <Card className="p-0 gap-0 overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-2.5 border-b bg-muted/50">
          <span className="text-xs text-muted-foreground font-medium w-20">Camera</span>
          <span className="text-xs text-muted-foreground font-medium flex-1">Where</span>
          <span className="text-xs text-muted-foreground font-medium w-20 text-right">Status</span>
          <span className="text-xs text-muted-foreground font-medium w-24 text-right">Last seen</span>
        </div>
        {filtered.length === 0 ? (
          <div className="px-4 py-10 text-center text-sm text-muted-foreground">No cameras match your search.</div>
        ) : (
          filtered.map((cam) => (
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
          ))
        )}
      </Card>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add camera</DialogTitle>
            <DialogDescription>
              New cameras are assigned the next ID ({nextCameraId}). You can label where it is installed.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <Label>Camera ID</Label>
              <Input value={nextCameraId} readOnly className="font-mono bg-muted/50" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="cam-location">Location</Label>
              <Input
                id="cam-location"
                value={newLocation}
                onChange={(e) => setNewLocation(e.target.value)}
                placeholder="e.g. Checkout lane 2"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setAddOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={addCamera}>
              Add camera
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

const INTEGRATIONS = [
  { name: 'Stripe', status: 'connected' as const, type: 'Payment' },
  { name: 'Mercado Pago', status: 'connected' as const, type: 'Payment' },
  { name: 'Niubiz', status: 'connected' as const, type: 'Payment' },
  { name: 'EBANX', status: 'connected' as const, type: 'Payment' },
  { name: 'WhatsApp Business', status: 'connected' as const, type: 'Messaging' },
  { name: 'Slack', status: 'disconnected' as const, type: 'Alerts' },
  { name: 'PagerDuty', status: 'disconnected' as const, type: 'Alerts' },
]

function IntegrationsTab() {
  const [query, setQuery] = useState('')
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return INTEGRATIONS
    return INTEGRATIONS.filter(
      (int) =>
        int.name.toLowerCase().includes(q) ||
        int.type.toLowerCase().includes(q) ||
        (int.status === 'connected' ? 'connected' : 'not connected').includes(q)
    )
  }, [query])

  return (
    <div className="flex flex-col gap-3">
      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search connections…"
          className="pl-9"
          aria-label="Search connections"
        />
      </div>
      {filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground py-6 text-center">No connections match your search.</p>
      ) : (
        filtered.map((int) => (
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
        ))
      )}
    </div>
  )
}

function RulesTab() {
  const [rules, setRules] = useState(DETECTION_RULES)
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return rules
    return rules.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.category.toLowerCase().includes(q)
    )
  }, [rules, query])

  const toggleRule = (id: string) => {
    setRules((prev) => prev.map((r) => r.id === id ? { ...r, enabled: !r.enabled } : r))
    toast('Rule updated.')
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search rules or category…"
          className="pl-9"
          aria-label="Search rules"
        />
      </div>
      <Card className="p-0 gap-0 overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-2.5 border-b bg-muted/50">
        <span className="text-xs text-muted-foreground font-medium flex-1">What we watch for</span>
        <span className="text-xs text-muted-foreground font-medium w-28">Category</span>
        <span className="text-xs text-muted-foreground font-medium w-20 text-right">Today</span>
        <span className="text-xs text-muted-foreground font-medium w-16 text-right">On</span>
      </div>
      {filtered.length === 0 ? (
        <div className="px-4 py-10 text-center text-sm text-muted-foreground">No rules match your search.</div>
      ) : (
      filtered.map((rule) => (
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
      ))
      )}
    </Card>
    </div>
  )
}

function SettingsPageInner() {
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState<Tab>('account')

  useEffect(() => {
    const t = searchParams.get('tab')
    if (t && VALID_TABS.has(t as Tab)) setActiveTab(t as Tab)
  }, [searchParams])

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
      <div className="flex flex-wrap gap-x-0 gap-y-0 border-b">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="px-3 sm:px-4 py-2.5 text-sm transition-colors whitespace-nowrap"
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

export default function SettingsPage() {
  return (
    <Suspense fallback={<div className="text-sm text-muted-foreground py-8">Loading settings…</div>}>
      <SettingsPageInner />
    </Suspense>
  )
}
