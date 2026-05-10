'use client'

import { useState, useEffect, useCallback } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useTheme, type ThemeName } from '@/components/theme-provider'
import {
  Bell, Search, Monitor, Sun, Moon, LogOut, Settings, User,
  ChevronDown, ShieldAlert, Package, Camera, CheckCheck,
} from 'lucide-react'
import { SidebarTrigger } from '@/components/ui/sidebar'
import {
  Command,
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
import { cn } from '@/lib/utils'

const ROUTES = [
  { label: 'Home', href: '/dashboard' },
  { label: 'Activity', href: '/events' },
  { label: 'Security', href: '/loss-prevention' },
  { label: 'Checkout', href: '/checkout' },
  { label: 'Stock', href: '/inventory' },
  { label: 'Payments', href: '/payments' },
  { label: 'Messages', href: '/whatsapp' },
  { label: 'My stores', href: '/stores' },
  { label: 'Ask AI', href: '/chat' },
  { label: 'Settings', href: '/settings' },
]

const PATH_LABELS: Record<string, string> = {
  '/dashboard': 'Home',
  '/events': 'Activity',
  '/loss-prevention': 'Security',
  '/checkout': 'Checkout',
  '/inventory': 'Stock',
  '/payments': 'Payments',
  '/whatsapp': 'Messages',
  '/stores': 'My stores',
  '/chat': 'Ask AI',
  '/settings': 'Settings',
}

const NOTIFICATIONS = [
  {
    id: 1,
    Icon: ShieldAlert,
    title: 'Pick-without-pay detected',
    desc: 'CAM-07 · LIMA-03 · 2 min ago',
    read: false,
  },
  {
    id: 2,
    Icon: Camera,
    title: 'Camera offline',
    desc: 'CAM-18 · LIMA-03 · 15 min ago',
    read: false,
  },
  {
    id: 3,
    Icon: Package,
    title: 'Low stock — SKU 0482',
    desc: 'SHELF-B3 · LIMA-03 · 1 hr ago',
    read: true,
  },
]

function Breadcrumb() {
  const pathname = usePathname()
  const segments = pathname.split('/').filter(Boolean)

  return (
    <div className="flex items-center gap-1.5 text-sm">
      {segments.map((seg, i) => (
        <span key={i} className="flex items-center gap-1.5">
          {i > 0 && <span className="text-muted-foreground/40">›</span>}
          <span className={cn(
            'text-sm',
            i === segments.length - 1
              ? 'font-medium text-foreground'
              : 'text-muted-foreground'
          )}>
            {PATH_LABELS[`/${seg}`] ?? seg.charAt(0).toUpperCase() + seg.slice(1)}
          </span>
        </span>
      ))}
    </div>
  )
}

function NotificationsMenu() {
  const router = useRouter()
  const [notifications, setNotifications] = useState(NOTIFICATIONS)
  const unread = notifications.filter((n) => !n.read).length

  const markAllRead = () => setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="relative flex items-center justify-center h-8 w-8 rounded-md transition-colors hover:bg-accent text-muted-foreground hover:text-foreground outline-none">
          <Bell size={15} strokeWidth={1.75} />
          {unread > 0 && (
            <span className="absolute top-0.5 right-0.5 flex items-center justify-center rounded-full text-[9px] font-bold leading-none"
              style={{ width: 14, height: 14, background: 'var(--destructive)', color: '#fff' }}>
              {unread}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-80 p-0 rounded-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <DropdownMenuLabel className="p-0 text-sm font-semibold flex items-center gap-2">
            Notifications
            {unread > 0 && (
              <span className="inline-flex items-center justify-center size-5 rounded-full text-[10px] font-semibold bg-destructive text-destructive-foreground">
                {unread}
              </span>
            )}
          </DropdownMenuLabel>
          {unread > 0 && (
            <button
              onClick={markAllRead}
              className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
            >
              <CheckCheck size={12} />
              Mark all read
            </button>
          )}
        </div>

        {/* Notification items */}
        <div className="flex flex-col">
          {notifications.map((n) => {
            const Icon = n.Icon
            return (
              <DropdownMenuItem
                key={n.id}
                className="flex items-start gap-3 px-4 py-3 rounded-none border-b last:border-b-0 cursor-pointer focus:bg-accent"
                onClick={() => {
                  setNotifications((prev) =>
                    prev.map((x) => x.id === n.id ? { ...x, read: true } : x)
                  )
                  router.push('/events')
                }}
              >
                {/* Icon badge */}
                <div className={cn(
                  'flex items-center justify-center rounded-md shrink-0 size-7 mt-0.5',
                  n.read ? 'bg-muted text-muted-foreground' : 'bg-primary/10 text-primary'
                )}>
                  <Icon size={13} />
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <p className={cn('text-sm leading-tight truncate', !n.read && 'font-medium')}>
                    {n.title}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{n.desc}</p>
                </div>

                {/* Unread dot */}
                {!n.read && (
                  <span className="size-1.5 rounded-full bg-primary shrink-0 mt-1.5" />
                )}
              </DropdownMenuItem>
            )
          })}
        </div>

        {/* Footer */}
        <div className="border-t px-4 py-2.5 bg-muted/30">
          <button
            onClick={() => router.push('/events')}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors w-full text-center"
          >
            View all activity →
          </button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function UserMenu() {
  const { theme, setTheme } = useTheme()
  const router = useRouter()

  const themeOptions: { label: string; value: ThemeName; icon: typeof Monitor }[] = [
    { label: 'System', value: 'system', icon: Monitor },
    { label: 'Light', value: 'light', icon: Sun },
    { label: 'Dark', value: 'dark', icon: Moon },
  ]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-1.5 rounded-md transition-colors px-1 py-0.5 outline-none hover:bg-accent text-muted-foreground hover:text-foreground">
          <div className="flex items-center justify-center rounded-full text-xs font-semibold shrink-0 size-7 bg-muted text-foreground border border-border">
            S
          </div>
          <ChevronDown size={12} className="hidden sm:block" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-52 rounded-xl">
        <DropdownMenuLabel>
          <div className="flex flex-col">
            <span className="text-sm font-medium">Santiago Garces</span>
            <span className="text-xs text-muted-foreground font-normal">Store Manager · LIMA-03</span>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={() => router.push('/settings')} className="gap-2 cursor-pointer text-sm">
          <User size={14} />
          My account
        </DropdownMenuItem>

        <DropdownMenuItem onClick={() => router.push('/settings')} className="gap-2 cursor-pointer text-sm">
          <Settings size={14} />
          Settings
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="gap-2 text-sm">
            {theme === 'light' ? <Sun size={14} /> : theme === 'dark' ? <Moon size={14} /> : <Monitor size={14} />}
            Appearance
            <span className="ml-auto text-xs capitalize text-muted-foreground">{theme ?? 'system'}</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="rounded-xl">
            {themeOptions.map(({ label, value, icon: Icon }) => (
              <DropdownMenuItem
                key={value}
                onClick={() => setTheme(value)}
                className="gap-2 cursor-pointer text-sm"
              >
                <Icon size={13} />
                {label}
                {theme === value && <span className="ml-auto text-[8px]">●</span>}
              </DropdownMenuItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={() => router.push('/login')}
          className="gap-2 cursor-pointer text-sm text-destructive focus:text-destructive"
        >
          <LogOut size={14} />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function Topbar() {
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
        className="sticky top-0 z-40 flex min-w-0 items-center gap-2 border-b px-3 md:gap-3 md:px-4"
        style={{ height: 52, background: 'var(--bg)' }}
      >
        <SidebarTrigger className="-ml-1 shrink-0" />

        <div className="hidden min-w-0 flex-1 sm:block">
          <Breadcrumb />
        </div>

        <div className="ml-auto flex min-w-0 shrink-0 items-center gap-1 sm:gap-2">
          {/* Command palette trigger */}
          <button
            type="button"
            onClick={() => setCmdOpen(true)}
            className="flex items-center gap-2 rounded-md border border-border bg-muted/60 px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted sm:px-3"
          >
            <Search size={13} />
            <span className="hidden sm:inline">Search anything…</span>
            <kbd className="hidden rounded border border-border bg-background px-1 py-0.5 font-mono text-[10px] md:block">
              ⌘K
            </kbd>
          </button>

          <NotificationsMenu />
          <UserMenu />
        </div>
      </header>

      <CommandDialog open={cmdOpen} onOpenChange={setCmdOpen}>
        <Command>
          <CommandInput placeholder="Search events, SKUs, cameras, stores..." className="text-xs" />
          <CommandList>
            <CommandEmpty>
              <span className="text-sm text-muted-foreground">Nothing matches that search.</span>
            </CommandEmpty>
            <CommandGroup heading="Pages">
              {ROUTES.map((r) => (
                <CommandItem
                  key={r.href}
                  value={r.label}
                  onSelect={() => { router.push(r.href); setCmdOpen(false) }}
                >
                  <span className="text-sm">{r.label}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  )
}
