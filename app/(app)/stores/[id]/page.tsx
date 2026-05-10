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
      <Link href="/stores" className="flex items-center gap-2 data-mono text-xs self-start" style={{ color: 'var(--fg-dim)' }}>
        <ArrowLeft size={12} /> BACK TO STORES
      </Link>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold" style={{ color: 'var(--fg)' }}>
            <em>{store.id}</em>
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: store.status === 'online' ? 'var(--success)' : store.status === 'degraded' ? 'var(--warning)' : 'var(--danger)',
              }}
            />
            <span className="data-mono text-xs" style={{ color: 'var(--fg-dim)' }}>
              {store.status} · last sync {format(store.lastSync, 'HH:mm')}
            </span>
          </div>
        </div>
      </div>

      {/* Store info */}
      <div
        className="grid grid-cols-2 sm:grid-cols-4"
        style={{ border: '1px solid var(--border)', background: 'var(--bg-panel)' }}
      >
        {[
          { label: 'EVENTS / HOUR', value: store.eventsPerHour },
          { label: 'SHRINK RATE', value: `${store.shrinkRate}%` },
          { label: 'REVENUE TODAY', value: `$${store.revenue.toLocaleString()}` },
          { label: 'CAMERAS', value: `${store.camerasOnline} / ${store.cameraCount}` },
        ].map((m, i, arr) => (
          <div
            key={m.label}
            className="p-4"
            style={{ borderRight: i < arr.length - 1 ? '1px solid var(--border)' : undefined }}
          >
            <p className="section-label">{m.label}</p>
            <p className="data-mono font-semibold mt-1" style={{ fontSize: '1.25rem', color: 'var(--fg)' }}>{m.value}</p>
          </div>
        ))}
      </div>

      {/* Store details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div style={{ border: '1px solid var(--border)', background: 'var(--bg-panel)' }}>
          <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
            <p className="section-label">STORE INFO</p>
          </div>
          <table className="w-full text-xs">
            <tbody>
              {[
                ['STORE ID', store.id],
                ['LOCATION', store.location],
                ['STATUS', store.status],
                ['MANAGER', store.manager],
                ['CAMERAS TOTAL', store.cameraCount],
                ['CAMERAS ONLINE', store.camerasOnline],
                ['LAST SYNC', format(store.lastSync, 'HH:mm:ss')],
              ].map(([k, v]) => (
                <tr key={k} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td className="section-label px-4 py-2.5 w-1/2">{k}</td>
                  <td className="data-mono px-4 py-2.5" style={{ color: 'var(--fg)' }}>{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Map placeholder */}
        <div
          className="flex flex-col items-center justify-center"
          style={{ border: '1px solid var(--border)', background: 'var(--bg-panel)', minHeight: 200 }}
        >
          <MapPin size={24} style={{ color: 'var(--fg-dim)', marginBottom: 8 }} />
          <p className="section-label">MAP PLACEHOLDER</p>
          <p className="data-mono text-xs mt-1" style={{ color: 'var(--fg-dim)' }}>{store.location}</p>
        </div>
      </div>

      {/* Live events scoped to store */}
      <div style={{ border: '1px solid var(--border)', background: 'var(--bg-panel)' }}>
        <div className="px-4 pt-4">
          <SectionHeader
            number="01"
            title="LIVE EVENTS"
            action={<span style={{ color: 'var(--fg-dim)' }}>All stores (no store filter)</span>}
          />
        </div>
        <EventStream limit={20} />
      </div>
    </div>
  )
}
