'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
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
  Bot,
  LogOut,
  User,
  ChevronDown,
} from 'lucide-react'
import { StoreSelector } from './store-selector'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

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
      { href: '/settings', icon: Settings, label: 'Settings' },
    ],
  },
]

function AlwonMark() {
  return (
    <span
      className="select-none text-[15px] font-bold leading-none tracking-tight text-blue-600 dark:text-blue-400"
      aria-hidden="true"
    >
      A
    </span>
  )
}

function NavMain() {
  const pathname = usePathname()

  const isActive = (href: string) => {
    const base = href.split('?')[0]
    if (base === '/dashboard') return pathname === base
    return pathname.startsWith(base)
  }

  return (
    <>
      {NAV_GROUPS.map((group) => (
        <SidebarGroup key={group.label} className="py-1">
          <SidebarGroupLabel className="h-6 px-3 text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/40 mb-0.5">
            {group.label}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {group.items.map((item) => {
                const active = isActive(item.href)
                const Icon = item.icon
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={active}
                      tooltip={item.label}
                      className="h-8 rounded-md text-sm gap-2.5 px-3 font-normal text-sidebar-foreground/70 hover:text-sidebar-foreground"
                    >
                      <Link href={item.href}>
                        <Icon size={15} />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                    {item.badge !== undefined && (
                      <SidebarMenuBadge
                        className="text-[10px] h-4 min-w-[16px] px-1 rounded-full font-semibold !top-1/2 !-translate-y-1/2"
                        style={{
                          background: item.badge > 0 ? 'var(--danger)' : 'var(--border-strong)',
                          color: item.badge > 0 ? '#fff' : 'var(--fg-muted)',
                        }}
                      >
                        {item.badge}
                      </SidebarMenuBadge>
                    )}
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      ))}
    </>
  )
}

function NavUser() {
  const router = useRouter()

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              tooltip="Santiago Garces"
              className="h-10 gap-3 px-3 hover:bg-sidebar-accent rounded-md"
            >
              <div
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold"
                style={{
                  background: 'var(--brand-accent-glow)',
                  color: 'var(--brand-accent)',
                  border: '1px solid var(--border-accent)',
                }}
              >
                S
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate text-sm font-medium text-sidebar-foreground">Santiago Garces</span>
                <span className="truncate text-[11px] text-sidebar-foreground/50">Store Manager</span>
              </div>
              <ChevronDown className="ml-auto size-3.5 text-sidebar-foreground/40 shrink-0" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" align="end" className="w-52 rounded-lg">
            <DropdownMenuItem onClick={() => router.push('/settings')} className="gap-2 cursor-pointer text-sm">
              <User className="size-3.5" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push('/settings')} className="gap-2 cursor-pointer text-sm">
              <Settings className="size-3.5" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => router.push('/login')}
              className="gap-2 cursor-pointer text-sm text-destructive focus:text-destructive"
            >
              <LogOut className="size-3.5" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      {/* Header: logo row + store selector row */}
      <SidebarHeader className="border-b border-sidebar-border gap-0 p-0">
        {/* Logo row — h-[52px] matches topbar height so borders align when collapsed */}
        <div className="flex h-[52px] items-center gap-2.5 px-3">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-blue-500/10 ring-1 ring-blue-500/25 dark:bg-blue-400/10 dark:ring-blue-400/25">
            <AlwonMark />
          </div>
          <span className="truncate font-semibold text-[13px] text-sidebar-foreground group-data-[collapsible=icon]:hidden">
            Alwon
          </span>
        </div>

        {/* Store selector row — hidden when collapsed to icon */}
        <div className="group-data-[collapsible=icon]:hidden w-full px-3 pb-3">
          <StoreSelector />
        </div>
      </SidebarHeader>

      <SidebarContent className="py-2">
        <NavMain />
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border py-2">
        <NavUser />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
