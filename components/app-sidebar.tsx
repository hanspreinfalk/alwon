'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Radio,
  ShieldAlert,
  ShoppingCart,
  Package,
  CreditCard,
  MessageSquare,
  Store,
  Settings,
  Camera,
  Users,
  BookOpen,
  MoreHorizontal,
} from 'lucide-react'
import { StoreSelector } from './store-selector'

interface NavItem {
  href: string
  icon: React.ElementType
  label: string
  badge?: number
}

interface NavGroup {
  label: string
  items: NavItem[]
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: 'MONITOR',
    items: [
      { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
      { href: '/events', icon: Radio, label: 'Live Events' },
      { href: '/loss-prevention', icon: ShieldAlert, label: 'Loss Prevention', badge: 12 },
      { href: '/checkout', icon: ShoppingCart, label: 'Checkout' },
      { href: '/inventory', icon: Package, label: 'Inventory' },
    ],
  },
  {
    label: 'OPERATE',
    items: [
      { href: '/payments', icon: CreditCard, label: 'Payments' },
      { href: '/whatsapp', icon: MessageSquare, label: 'WhatsApp', badge: 4 },
      { href: '/stores', icon: Store, label: 'Stores' },
    ],
  },
  {
    label: 'CONFIGURE',
    items: [
      { href: '/settings?tab=rules', icon: BookOpen, label: 'Rules' },
      { href: '/settings?tab=cameras', icon: Camera, label: 'Cameras' },
      { href: '/settings?tab=team', icon: Users, label: 'Team' },
      { href: '/settings', icon: Settings, label: 'Settings' },
    ],
  },
]

function AlwonLogo() {
  return (
    <div className="flex items-center gap-2.5">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <polygon
          points="12,2 22,20 2,20"
          stroke="var(--accent)"
          strokeWidth="1.5"
          fill="none"
          strokeLinejoin="round"
        />
        <line x1="12" y1="8" x2="12" y2="15" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="12" cy="17.5" r="0.75" fill="var(--accent)" />
      </svg>
      <span
        className="font-semibold tracking-[0.08em] text-sm"
        style={{ color: 'var(--fg)', letterSpacing: '0.15em' }}
      >
        ALWON
      </span>
    </div>
  )
}

export function AppSidebar() {
  const pathname = usePathname()

  const isActive = (href: string) => {
    const base = href.split('?')[0]
    if (base === '/dashboard') return pathname === base
    return pathname.startsWith(base)
  }

  return (
    <nav
      className="hidden md:flex flex-col h-full overflow-hidden"
      style={{
        width: 240,
        minWidth: 240,
        background: 'var(--bg-elevated)',
        borderRight: '1px solid var(--border)',
      }}
    >
      {/* Logo + store selector */}
      <div className="flex flex-col gap-3 px-4 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
        <AlwonLogo />
        <div className="flex items-center gap-2">
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--success)', flexShrink: 0 }} />
          <StoreSelector />
        </div>
      </div>

      {/* Nav groups */}
      <div className="flex-1 overflow-y-auto px-2 py-3">
        {NAV_GROUPS.map((group) => (
          <div key={group.label} className="mb-5">
            <div
              className="section-label px-2 mb-1.5"
              style={{ paddingTop: '0.125rem', paddingBottom: '0.125rem' }}
            >
              {group.label}
            </div>
            {group.items.map((item) => {
              const active = isActive(item.href)
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-2.5 px-2 py-2 rounded-none transition-colors duration-150"
                  style={{
                    borderLeft: active ? '2px solid var(--accent)' : '2px solid transparent',
                    background: active ? 'var(--bg-hover)' : 'transparent',
                    color: active ? 'var(--fg)' : 'var(--fg-muted)',
                  }}
                  onMouseEnter={(e) => {
                    if (!active) {
                      e.currentTarget.style.background = 'var(--bg-hover)'
                      e.currentTarget.style.color = 'var(--fg)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!active) {
                      e.currentTarget.style.background = 'transparent'
                      e.currentTarget.style.color = 'var(--fg-muted)'
                    }
                  }}
                >
                  <Icon size={16} strokeWidth={1.5} />
                  <span className="text-sm flex-1">{item.label}</span>
                  {item.badge !== undefined && (
                    <span
                      className="data-mono text-xs px-1.5 py-0.5 rounded-sm"
                      style={{
                        background: 'var(--bg-panel)',
                        color: 'var(--fg-dim)',
                        border: '1px solid var(--border)',
                      }}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              )
            })}
          </div>
        ))}
      </div>

      {/* User pill */}
      <div
        className="flex items-center gap-2.5 px-4 py-3"
        style={{ borderTop: '1px solid var(--border)' }}
      >
        <div
          className="flex items-center justify-center rounded-full text-xs font-medium shrink-0"
          style={{ width: 28, height: 28, background: 'var(--bg-panel)', color: 'var(--fg)', border: '1px solid var(--border-strong)' }}
        >
          E
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs truncate" style={{ color: 'var(--fg)' }}>Elena Martinez</p>
          <p className="section-label truncate" style={{ fontSize: '0.6rem' }}>Store Manager</p>
        </div>
        <button
          className="p-1 rounded transition-colors"
          style={{ color: 'var(--fg-dim)' }}
        >
          <MoreHorizontal size={14} />
        </button>
      </div>
    </nav>
  )
}
