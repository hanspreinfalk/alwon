'use client'

import Link from 'next/link'
import { format } from 'date-fns'
import { SectionHeader } from '@/components/section-header'
import { generateStores } from '@/lib/mock-data'

const stores = generateStores()

export default function StoresPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold" style={{ color: 'var(--fg)' }}>
          My stores
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--fg-muted)' }}>
          {stores.filter((s) => s.status === 'online').length} working normally · {stores.filter((s) => s.status === 'degraded').length} need attention
        </p>
      </div>

      <SectionHeader title="All stores" description="Click any store to see details and live activity" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {stores.map((store) => (
          <Link
            key={store.id}
            href={`/stores/${store.id}`}
            className="flex flex-col p-4 transition-colors"
            style={{ borderRadius: 'var(--radius)', border: '1px solid var(--border)', background: 'var(--bg-panel)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--bg-hover)'
              e.currentTarget.style.borderColor = 'var(--border-strong)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--bg-panel)'
              e.currentTarget.style.borderColor = 'var(--border)'
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="font-medium text-base" style={{ color: 'var(--fg)' }}>{store.id}</span>
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: store.status === 'online' ? 'var(--success)' : store.status === 'degraded' ? 'var(--warning)' : 'var(--danger)',
                }}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs" style={{ color: 'var(--fg-muted)' }}>Activity / hour</p>
                <p className="font-medium mt-0.5" style={{ color: 'var(--fg)', fontVariantNumeric: 'tabular-nums' }}>{store.eventsPerHour}</p>
              </div>
              <div>
                <p className="text-xs" style={{ color: 'var(--fg-muted)' }}>Theft rate</p>
                <p className="font-medium mt-0.5" style={{
                  color: store.shrinkDelta > 0 ? 'var(--danger)' : 'var(--success)',
                  fontVariantNumeric: 'tabular-nums',
                }}>
                  {store.shrinkRate}%
                  <span className="text-xs ml-1" style={{ color: 'var(--fg-muted)' }}>
                    {store.shrinkDelta > 0 ? '+' : ''}{store.shrinkDelta}%
                  </span>
                </p>
              </div>
              <div>
                <p className="text-xs" style={{ color: 'var(--fg-muted)' }}>Sales today</p>
                <p className="font-medium mt-0.5" style={{ color: 'var(--fg)', fontVariantNumeric: 'tabular-nums' }}>
                  ${store.revenue.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-xs" style={{ color: 'var(--fg-muted)' }}>Cameras working</p>
                <p className="font-medium mt-0.5" style={{ color: 'var(--fg)', fontVariantNumeric: 'tabular-nums' }}>
                  {store.camerasOnline} of {store.cameraCount}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between mt-3 pt-3" style={{ borderTop: '1px solid var(--border)' }}>
              <span className="text-xs" style={{ color: 'var(--fg-muted)' }}>{store.manager}</span>
              <span className="text-xs" style={{ color: 'var(--fg-muted)' }}>
                Updated {format(store.lastSync, 'HH:mm')}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
