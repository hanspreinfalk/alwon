'use client'

import { AppSidebar } from '@/components/app-sidebar'
import { Topbar } from '@/components/topbar'
import { Toaster } from '@/components/ui/sonner'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider className="h-screen overflow-hidden">
      <AppSidebar />
      <SidebarInset className="overflow-hidden" style={{ background: 'var(--bg)' }}>
        <Topbar />
        <div
          className="flex-1 overflow-y-auto"
          style={{ background: 'var(--bg)' }}
        >
          <div className="max-w-[1600px] mx-auto px-4 md:px-8 py-6">
            {children}
          </div>
        </div>
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: 'var(--bg-panel)',
              border: '1px solid var(--border-strong)',
              color: 'var(--fg)',
              fontSize: '0.875rem',
              borderRadius: 'var(--radius)',
            },
          }}
        />
      </SidebarInset>
    </SidebarProvider>
  )
}
