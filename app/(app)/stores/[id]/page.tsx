'use client'

import { use } from 'react'
import Link from 'next/link'
import { ArrowLeft, MapPin, Camera, Users } from 'lucide-react'
import { format } from 'date-fns'
import { SectionHeader } from '@/components/section-header'
import { EventStream } from '@/components/event-stream'
import { generateStores } from '@/lib/mock-data'

const stores = generateStores()

export default function StoreDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const store = stores.find((s) => s.id === decodeURIComponent(id)) ?? stores[0]

  return (
    <div className="flex flex-col gap-6">
      <Link href="/stores" className="flex items-center gap-2 text-sm self-start" style={{ color: 'var(--fg-muted)' }}>
        <ArrowLeft size={14} /> Back to all stores
      </Link>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold" style={{ color: 'var(--fg)' }}>
            {store.id}
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                background: store.status === 'online' ? 'var(--success)' : store.status === 'degraded' ? 'var(--warning)' : 'var(--danger)',
              }}
            />
            <span className="text-sm" style={{ color: 'var(--fg-muted)' }}>
              {store.status === 'online' ? 'Working normally' : store.status === 'degraded' ? 'Some issues' : 'Offline'} · updated {format(store.lastSync, 'HH:mm')}
            </span>
          </div>
        </div>
      </div>

      {/* Store info */}
      <div
        className="grid grid-cols-2 sm:grid-cols-4"
        style={{ borderRadius: 'var(--radius)', border: '1px solid var(--border)', background: 'var(--bg-panel)' }}
      >
        {[
          { label: 'Activity / hour', value: store.eventsPerHour },
          { label: 'Theft rate', value: `${store.shrinkRate}%` },
          { label: 'Sales today', value: `$${store.revenue.toLocaleString()}` },
          { label: 'Cameras working', value: `${store.camerasOnline} of ${store.cameraCount}` },
        ].map((m, i, arr) => (
          <div
            key={m.label}
            className="p-5"
            style={{ borderRight: i < arr.length - 1 ? '1px solid var(--border)' : undefined }}
          >
            <p className="text-xs" style={{ color: 'var(--fg-muted)' }}>{m.label}</p>
            <p className="font-semibold mt-1" style={{ fontSize: '1.5rem', color: 'var(--fg)', fontVariantNumeric: 'tabular-nums' }}>{m.value}</p>
          </div>
        ))}
      </div>

      {/* Store details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div style={{ borderRadius: 'var(--radius)', border: '1px solid var(--border)', background: 'var(--bg-panel)', overflow: 'hidden' }}>
          <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
            <p className="text-sm font-medium" style={{ color: 'var(--fg)' }}>About this store</p>
          </div>
          <table className="w-full text-sm">
            <tbody>
              {[
                ['Store ID', store.id],
                ['City', store.location],
                ['Status', store.status === 'online' ? 'Working normally' : store.status === 'degraded' ? 'Some issues' : 'Offline'],
                ['Manager', store.manager],
                ['Cameras total', String(store.cameraCount)],
                ['Cameras working', String(store.camerasOnline)],
                ['Last update', format(store.lastSync, 'HH:mm:ss')],
              ].map(([k, v]) => (
                <tr key={k} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td className="px-4 py-2.5 w-1/2 text-xs" style={{ color: 'var(--fg-muted)' }}>{k}</td>
                  <td className="px-4 py-2.5" style={{ color: 'var(--fg)' }}>{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Map placeholder */}
        <div
          className="flex flex-col items-center justify-center"
          style={{ borderRadius: 'var(--radius)', border: '1px solid var(--border)', background: 'var(--bg-panel)', minHeight: 200 }}
        >
          <MapPin size={28} style={{ color: 'var(--fg-muted)', marginBottom: 8 }} />
          <p className="text-sm font-medium" style={{ color: 'var(--fg)' }}>Map coming soon</p>
          <p className="text-xs mt-1" style={{ color: 'var(--fg-muted)' }}>{store.location}</p>
        </div>
      </div>

      {/* Live events scoped to store */}
      <div style={{ borderRadius: 'var(--radius)', border: '1px solid var(--border)', background: 'var(--bg-panel)' }}>
        <div className="px-5 pt-4">
          <SectionHeader
            title="What's happening at this store now"
            description="Live activity"
          />
        </div>
        <EventStream limit={20} />
      </div>
    </div>
  )
}
