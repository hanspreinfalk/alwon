'use client'

import { useState, useEffect, useCallback } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useTheme } from 'next-themes'
import { Bell, Search, Menu, Monitor, Sun, Moon, LogOut, Settings, User, ChevronDown } from 'lucide-react'
import { LiveClock } from './live-clock'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from '@/components/ui/dropdown-menu'

const ROUTES = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Live Events', href: '/events' },
  { label: 'Loss Prevention', href: '/loss-prevention' },
  { label: 'Checkout', href: '/checkout' },
  { label: 'Inventory', href: '/inventory' },
  { label: 'Payments', href: '/payments' },
  { label: 'WhatsApp', href: '/whatsapp' },
  { label: 'Stores', href: '/stores' },
  { label: 'AI Assistant', href: '/chat' },
  { label: 'Settings', href: '/settings' },
]

const PATH_LABELS: Record<string, string> = {
  '/dashboard': 'DASHBOARD',
  '/events': 'LIVE EVENTS',
  '/loss-prevention': 'LOSS PREVENTION',
  '/checkout': 'CHECKOUT',
  '/inventory': 'INVENTORY',
  '/payments': 'PAYMENTS',
  '/whatsapp': 'WHATSAPP',
  '/stores': 'STORES',
  '/chat': 'AI ASSISTANT',
  '/settings': 'SETTINGS',
}

function Breadcrumb() {
  const pathname = usePathname()
  const segments = pathname.split('/').filter(Boolean)

  return (
    <div className="flex items-center gap-1.5 section-label">
      <span style={{ color: 'var(--fg-dim)' }}>STORES</span>
      {segments.map((seg, i) => (
        <span key={i} className="flex items-center gap-1.5">
          <span style={{ color: 'var(--fg-dim)' }}>/</span>
          <span style={{ color: i === segments.length - 1 ? 'var(--fg)' : 'var(--fg-muted)' }}>
            {PATH_LABELS[`/${seg}`] ?? seg.toUpperCase()}
          </span>
        </span>
      ))}
    </div>
  )
}

function UserMenu() {
  const { theme, setTheme } = useTheme()
  const router = useRouter()

  const themeOptions = [
    { label: 'System', value: 'system', icon: Monitor },
    { label: 'Light', value: 'light', icon: Sun },
    { label: 'Dark', value: 'dark', icon: Moon },
  ]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="flex items-center gap-2 rounded-sm transition-colors px-1 py-0.5 outline-none"
          style={{ color: 'var(--fg-muted)' }}
          onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--fg)' }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--fg-muted)' }}
        >
          <div
            className="flex items-center justify-center rounded-full text-xs font-medium shrink-0"
            style={{
              width: 28,
              height: 28,
              background: 'var(--bg-panel)',
              color: 'var(--fg)',
              border: '1px solid var(--border-strong)',
            }}
          >
            E
          </div>
          <ChevronDown size={12} className="hidden sm:block" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-52"
        style={{
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border-strong)',
          borderRadius: '2px',
        }}
      >
        <DropdownMenuLabel style={{ color: 'var(--fg-dim)' }}>
          <div className="flex flex-col">
            <span className="text-xs font-medium" style={{ color: 'var(--fg)' }}>Elena Martinez</span>
            <span className="section-label" style={{ fontSize: '0.6rem' }}>Store Manager · LIMA-03</span>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator style={{ background: 'var(--border)' }} />

        <DropdownMenuItem
          onClick={() => router.push('/settings')}
          className="gap-2 cursor-pointer data-mono text-xs"
          style={{ color: 'var(--fg-muted)' }}
        >
          <User size={13} />
          Profile &amp; Account
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => router.push('/settings')}
          className="gap-2 cursor-pointer data-mono text-xs"
          style={{ color: 'var(--fg-muted)' }}
        >
          <Settings size={13} />
          Settings
        </DropdownMenuItem>

        <DropdownMenuSeparator style={{ background: 'var(--border)' }} />

        {/* Theme sub-menu */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger
            className="gap-2 data-mono text-xs"
            style={{ color: 'var(--fg-muted)' }}
          >
            {theme === 'light' ? <Sun size={13} /> : theme === 'dark' ? <Moon size={13} /> : <Monitor size={13} />}
            Theme
            <span className="ml-auto section-label" style={{ fontSize: '0.6rem', color: 'var(--fg-dim)' }}>
              {theme ?? 'system'}
            </span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent
            style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-strong)',
              borderRadius: '2px',
            }}
          >
            {themeOptions.map(({ label, value, icon: Icon }) => (
              <DropdownMenuItem
                key={value}
                onClick={() => setTheme(value)}
                className="gap-2 cursor-pointer data-mono text-xs"
                style={{
                  color: theme === value ? 'var(--brand-accent)' : 'var(--fg-muted)',
                  background: theme === value ? 'var(--brand-accent-glow)' : undefined,
                }}
              >
                <Icon size={13} />
                {label}
                {theme === value && (
                  <span className="ml-auto" style={{ color: 'var(--brand-accent)', fontSize: 8 }}>●</span>
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuSeparator style={{ background: 'var(--border)' }} />

        <DropdownMenuItem
          onClick={() => router.push('/login')}
          className="gap-2 cursor-pointer data-mono text-xs"
          style={{ color: 'var(--danger)' }}
        >
          <LogOut size={13} />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function Topbar({ onMobileMenuToggle, onSidebarToggle }: {
  onMobileMenuToggle?: () => void
  onSidebarToggle?: () => void
}) {
  const [cmdOpen, setCmdOpen] = useState(false)
  const router = useRouter()

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setCmdOpen(true)
      }
    },
    []
  )

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  return (
    <>
      <header
        className="sticky top-0 z-40 flex items-center gap-3 px-4 md:px-5"
        style={{
          height: 56,
          background: 'var(--bg)',
          borderBottom: '1px solid var(--border)',
        }}
      >
        {/* Mobile menu toggle */}
        <button
          onClick={onMobileMenuToggle}
          className="md:hidden p-1"
          style={{ color: 'var(--fg-muted)' }}
        >
          <Menu size={18} />
        </button>

        {/* Breadcrumb */}
        <div className="flex-1 hidden sm:block">
          <Breadcrumb />
        </div>

        {/* Command palette trigger */}
        <button
          onClick={() => setCmdOpen(true)}
          className="flex items-center gap-2 px-3 py-1.5 transition-colors rounded-md"
          style={{
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border)',
            color: 'var(--fg-dim)',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--border-strong)' }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)' }}
        >
          <Search size={13} />
          <span className="data-mono text-xs hidden sm:block">Search...</span>
          <kbd
            className="data-mono text-xs hidden md:block px-1 py-0.5"
            style={{ background: 'var(--bg-panel)', border: '1px solid var(--border-strong)', fontSize: '0.65rem' }}
          >
            ⌘K
          </kbd>
        </button>

        {/* Right side */}
        <div className="flex items-center gap-3">
          <LiveClock />

          {/* Notifications */}
          <button className="relative p-1" style={{ color: 'var(--fg-dim)' }}>
            <Bell size={16} strokeWidth={1.5} />
            <span
              className="absolute -top-0.5 -right-0.5 flex items-center justify-center data-mono rounded-full"
              style={{ width: 14, height: 14, background: 'var(--danger)', color: '#fff', fontSize: 9 }}
            >
              3
            </span>
          </button>

          {/* User dropdown */}
          <UserMenu />
        </div>
      </header>

      {/* Command palette */}
      <CommandDialog open={cmdOpen} onOpenChange={setCmdOpen}>
        <CommandInput
          placeholder="Search events, SKUs, cameras, stores..."
          className="data-mono text-xs"
        />
        <CommandList>
          <CommandEmpty>
            <span className="section-label">No results found.</span>
          </CommandEmpty>
          <CommandGroup heading="ROUTES">
            {ROUTES.map((r) => (
              <CommandItem
                key={r.href}
                value={r.label}
                onSelect={() => {
                  router.push(r.href)
                  setCmdOpen(false)
                }}
              >
                <span className="data-mono text-xs">{r.label.toUpperCase()}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  )
}
