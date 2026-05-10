'use client'

import { useState } from 'react'
import { AppSidebar } from '@/components/app-sidebar'
import { Topbar } from '@/components/topbar'
import { Toaster } from '@/components/ui/sonner'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg)' }}>
      {/* Desktop sidebar */}
      <AppSidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((v) => !v)}
      />

      {/* Mobile sidebar drawer */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0"
            style={{ background: 'rgba(0,0,0,0.6)' }}
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="absolute left-0 top-0 h-full" style={{ zIndex: 51 }}>
            <AppSidebar
              collapsed={false}
              onToggle={() => setMobileSidebarOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Topbar onMobileMenuToggle={() => setMobileSidebarOpen(true)} />
        <main
          className="flex-1 overflow-y-auto"
          style={{ background: 'var(--bg)' }}
        >
          <div className="max-w-[1600px] mx-auto px-4 md:px-8 py-6">
            {children}
          </div>
        </main>
      </div>

      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: 'var(--bg-panel)',
            border: '1px solid var(--border-strong)',
            color: 'var(--fg)',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.75rem',
          },
        }}
      />
    </div>
  )
}
