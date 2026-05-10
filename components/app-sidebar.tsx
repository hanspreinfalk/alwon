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
  ChevronLeft,
  ChevronRight,
  Bot,
} from 'lucide-react'
import { StoreSelector } from './store-selector'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useRouter } from 'next/navigation'

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
    label: 'Overview',
    items: [
      { href: '/dashboard', icon: LayoutDashboard, label: 'Home' },
      { href: '/events', icon: Radio, label: 'Activity' },
      { href: '/loss-prevention', icon: ShieldAlert, label: 'Security', badge: 12 },
      { href: '/checkout', icon: ShoppingCart, label: 'Checkout' },
      { href: '/inventory', icon: Package, label: 'Stock' },
    ],
  },
  {
    label: 'Daily work',
    items: [
      { href: '/payments', icon: CreditCard, label: 'Payments' },
      { href: '/whatsapp', icon: MessageSquare, label: 'Messages', badge: 4 },
      { href: '/stores', icon: Store, label: 'My stores' },
      { href: '/chat', icon: Bot, label: 'Ask AI' },
    ],
  },
  {
    label: 'Setup',
    items: [
      { href: '/settings?tab=rules', icon: BookOpen, label: 'Alerts & rules' },
      { href: '/settings?tab=cameras', icon: Camera, label: 'Cameras' },
      { href: '/settings?tab=team', icon: Users, label: 'Team' },
      { href: '/settings', icon: Settings, label: 'Settings' },
    ],
  },
]

function AlwonLogo({ collapsed }: { collapsed: boolean }) {
  return (
    <div className="flex items-center gap-2.5 overflow-hidden">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
        <polygon
          points="12,2 22,20 2,20"
          stroke="var(--brand-accent)"
          strokeWidth="1.5"
          fill="none"
          strokeLinejoin="round"
        />
        <line x1="12" y1="8" x2="12" y2="15" stroke="var(--brand-accent)" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="12" cy="17.5" r="0.75" fill="var(--brand-accent)" />
      </svg>
      {!collapsed && (
        <span
          className="font-semibold text-base whitespace-nowrap overflow-hidden"
          style={{ color: 'var(--fg)' }}
        >
          Alwon
        </span>
      )}
    </div>
  )
}

interface AppSidebarProps {
  collapsed: boolean
  onToggle: () => void
}

export function AppSidebar({ collapsed, onToggle }: AppSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()

  const isActive = (href: string) => {
    const base = href.split('?')[0]
    if (base === '/dashboard') return pathname === base
    return pathname.startsWith(base)
  }

  return (
    <TooltipProvider delayDuration={200}>
      <nav
        className="hidden md:flex flex-col h-full overflow-hidden transition-all duration-200 ease-in-out"
        style={{
          width: collapsed ? 56 : 240,
          minWidth: collapsed ? 56 : 240,
          background: 'var(--bg-elevated)',
          borderRight: '1px solid var(--border)',
        }}
      >
        {/* Logo + store selector */}
        <div
          className="flex flex-col gap-3 py-4 overflow-hidden"
          style={{
            borderBottom: '1px solid var(--border)',
            padding: collapsed ? '1rem 0' : '1rem',
            alignItems: collapsed ? 'center' : undefined,
          }}
        >
          <AlwonLogo collapsed={collapsed} />
          {!collapsed && (
            <div className="flex items-center gap-2">
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--success)', flexShrink: 0 }} />
              <StoreSelector />
            </div>
          )}
        </div>

        {/* Nav groups */}
        <div className="flex-1 overflow-y-auto py-3" style={{ padding: collapsed ? '0.75rem 0' : '0.75rem 0.5rem' }}>
          {NAV_GROUPS.map((group) => (
            <div key={group.label} className="mb-5">
              {!collapsed && (
                <div
                  className="px-2 mb-1.5 text-xs"
                  style={{ color: 'var(--fg-muted)', fontWeight: 500, paddingTop: '0.125rem', paddingBottom: '0.125rem' }}
                >
                  {group.label}
                </div>
              )}
              {collapsed && <div style={{ height: 4 }} />}

              {group.items.map((item) => {
                const active = isActive(item.href)
                const Icon = item.icon

                const linkContent = (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-2.5 transition-colors duration-150"
                    style={{
                      borderLeft: !collapsed && active ? '2px solid var(--brand-accent)' : !collapsed ? '2px solid transparent' : undefined,
                      borderRadius: collapsed ? 'var(--radius-sm)' : '0 var(--radius-sm) var(--radius-sm) 0',
                      background: active ? 'var(--bg-hover)' : 'transparent',
                      color: active ? 'var(--fg)' : 'var(--fg-muted)',
                      padding: collapsed ? '0.5rem' : '0.5rem 0.5rem',
                      justifyContent: collapsed ? 'center' : undefined,
                      position: 'relative',
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
                    {/* Active indicator for collapsed mode */}
                    {collapsed && active && (
                      <span
                        className="absolute left-0 top-1/2 -translate-y-1/2"
                        style={{ width: 2, height: '60%', background: 'var(--brand-accent)' }}
                      />
                    )}
                    <Icon size={16} strokeWidth={1.5} style={{ flexShrink: 0 }} />
                    {!collapsed && (
                      <>
                        <span className="text-sm flex-1 whitespace-nowrap overflow-hidden">{item.label}</span>
                        {item.badge !== undefined && (
                          <span
                            className="data-mono text-xs px-1.5 py-0.5"
                            style={{
                              background: 'var(--bg-panel)',
                              color: 'var(--fg-dim)',
                              border: '1px solid var(--border)',
                            }}
                          >
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}
                    {/* Badge dot in collapsed mode */}
                    {collapsed && item.badge !== undefined && (
                      <span
                        className="absolute top-1 right-1"
                        style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--brand-accent)' }}
                      />
                    )}
                  </Link>
                )

                return collapsed ? (
                  <Tooltip key={item.href}>
                    <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                    <TooltipContent side="right" className="data-mono text-xs">
                      {item.label}
                      {item.badge !== undefined && (
                        <span className="ml-1.5" style={{ color: 'var(--brand-accent)' }}>{item.badge}</span>
                      )}
                    </TooltipContent>
                  </Tooltip>
                ) : linkContent
              })}
            </div>
          ))}
        </div>

        {/* User pill */}
        <div
          className="flex items-center overflow-hidden"
          style={{
            borderTop: '1px solid var(--border)',
            padding: collapsed ? '0.75rem 0' : '0.75rem 1rem',
            gap: collapsed ? 0 : '0.625rem',
            justifyContent: collapsed ? 'center' : undefined,
          }}
        >
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className={`flex items-center gap-2.5 outline-none ${collapsed ? 'justify-center' : 'w-full'}`}>
                <div
                  className="flex items-center justify-center rounded-full text-xs font-medium shrink-0"
                  style={{ width: 28, height: 28, background: 'var(--bg-panel)', color: 'var(--fg)', border: '1px solid var(--border-strong)' }}
                >
                  E
                </div>
                {!collapsed && (
                  <>
                    <div className="flex-1 min-w-0 text-left">
                      <p className="text-sm truncate" style={{ color: 'var(--fg)', fontWeight: 500 }}>Elena Martinez</p>
                      <p className="text-xs truncate" style={{ color: 'var(--fg-muted)' }}>Store Manager</p>
                    </div>
                    <MoreHorizontal size={14} style={{ color: 'var(--fg-muted)', flexShrink: 0 }} />
                  </>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              side={collapsed ? 'right' : 'top'}
              align="end"
              className="w-48"
              style={{
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-strong)',
                borderRadius: '2px',
              }}
            >
              <DropdownMenuItem
                onClick={() => router.push('/settings')}
                className="data-mono text-xs gap-2 cursor-pointer"
                style={{ color: 'var(--fg-muted)' }}
              >
                <Users size={13} /> Profile
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => router.push('/settings')}
                className="data-mono text-xs gap-2 cursor-pointer"
                style={{ color: 'var(--fg-muted)' }}
              >
                <Settings size={13} /> Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator style={{ background: 'var(--border)' }} />
              <DropdownMenuItem
                onClick={() => router.push('/login')}
                className="data-mono text-xs gap-2 cursor-pointer"
                style={{ color: 'var(--danger)' }}
              >
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Collapse toggle */}
        <button
          onClick={onToggle}
          className="flex items-center justify-center py-2 transition-colors"
          style={{
            borderTop: '1px solid var(--border)',
            color: 'var(--fg-dim)',
            background: 'transparent',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--bg-hover)'
            e.currentTarget.style.color = 'var(--fg)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent'
            e.currentTarget.style.color = 'var(--fg-dim)'
          }}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </nav>
    </TooltipProvider>
  )
}
