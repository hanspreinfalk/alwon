'use client'

import { useState, useEffect, useCallback } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Bell, Search, Menu } from 'lucide-react'
import { LiveClock } from './live-clock'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'

const ROUTES = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Live Events', href: '/events' },
  { label: 'Loss Prevention', href: '/loss-prevention' },
  { label: 'Checkout', href: '/checkout' },
  { label: 'Inventory', href: '/inventory' },
  { label: 'Payments', href: '/payments' },
  { label: 'WhatsApp', href: '/whatsapp' },
  { label: 'Stores', href: '/stores' },
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

export function Topbar({ onMobileMenuToggle }: { onMobileMenuToggle?: () => void }) {
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
        className="sticky top-0 z-40 flex items-center gap-4 px-4 md:px-6"
        style={{
          height: 56,
          background: 'var(--bg)',
          borderBottom: '1px solid var(--border)',
        }}
      >
        {/* Mobile menu */}
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
          className="flex items-center gap-2 px-3 py-1.5 rounded-sm transition-colors"
          style={{
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border)',
            color: 'var(--fg-dim)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--border-strong)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--border)'
          }}
        >
          <Search size={13} />
          <span className="data-mono text-xs hidden sm:block">Search events, SKUs, cameras...</span>
          <kbd
            className="data-mono text-xs hidden md:block px-1 py-0.5 rounded"
            style={{ background: 'var(--bg-panel)', border: '1px solid var(--border-strong)' }}
          >
            ⌘K
          </kbd>
        </button>

        {/* Right side */}
        <div className="flex items-center gap-4">
          <LiveClock />

          {/* Notifications */}
          <button className="relative p-1" style={{ color: 'var(--fg-dim)' }}>
            <Bell size={16} strokeWidth={1.5} />
            <span
              className="absolute -top-0.5 -right-0.5 flex items-center justify-center data-mono text-xs rounded-full"
              style={{ width: 14, height: 14, background: 'var(--danger)', color: '#fff', fontSize: 9 }}
            >
              3
            </span>
          </button>

          {/* User avatar */}
          <div
            className="flex items-center justify-center rounded-full text-xs font-medium cursor-pointer"
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
