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
          Store <em>network</em>
        </h1>
        <p className="data-mono text-xs mt-1" style={{ color: 'var(--fg-dim)' }}>
          {stores.filter((s) => s.status === 'online').length} online · {stores.filter((s) => s.status === 'degraded').length} degraded
        </p>
      </div>

      <SectionHeader number="01" title="ALL STORES" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {stores.map((store) => (
          <Link
            key={store.id}
            href={`/stores/${store.id}`}
            className="flex flex-col p-4 transition-colors"
            style={{ border: '1px solid var(--border)', background: 'var(--bg-panel)' }}
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
              <span className="data-mono font-medium" style={{ color: 'var(--fg)' }}>{store.id}</span>
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
                <p className="section-label">EVENTS / HOUR</p>
                <p className="data-mono font-medium mt-0.5" style={{ color: 'var(--fg)' }}>{store.eventsPerHour}</p>
              </div>
              <div>
                <p className="section-label">SHRINK RATE</p>
                <p className="data-mono font-medium mt-0.5" style={{
                  color: store.shrinkDelta > 0 ? 'var(--danger)' : 'var(--success)',
                }}>
                  {store.shrinkRate}%
                  <span className="text-xs ml-1" style={{ color: 'var(--fg-dim)' }}>
                    {store.shrinkDelta > 0 ? '+' : ''}{store.shrinkDelta}%
                  </span>
                </p>
              </div>
              <div>
                <p className="section-label">REVENUE TODAY</p>
                <p className="data-mono font-medium mt-0.5" style={{ color: 'var(--fg)' }}>
                  ${store.revenue.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="section-label">CAMERAS</p>
                <p className="data-mono font-medium mt-0.5" style={{ color: 'var(--fg)' }}>
                  {store.camerasOnline} / {store.cameraCount}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between mt-3 pt-3" style={{ borderTop: '1px solid var(--border)' }}>
              <span className="section-label">{store.manager}</span>
              <span className="data-mono text-xs" style={{ color: 'var(--fg-dim)' }}>
                sync {format(store.lastSync, 'HH:mm')}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
