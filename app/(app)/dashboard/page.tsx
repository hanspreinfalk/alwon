'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { Play } from 'lucide-react'
import { SectionHeader } from '@/components/section-header'
import { MetricTile } from '@/components/metric-tile'
import { EventStream } from '@/components/event-stream'
import { StoreSelector } from '@/components/store-selector'
import { friendlyEvent } from '@/lib/labels'
import type { EventType } from '@/lib/types'
import {
  getDashboardMetrics,
  generateStores,
  ANOMALY_DESCRIPTIONS,
  generateHeatmapData,
  STORE_IDS,
} from '@/lib/mock-data'

const metrics = getDashboardMetrics()
const stores = generateStores()
const heatmapData = generateHeatmapData()

function HeatmapCell({ value, max }: { value: number; max: number }) {
  const intensity = max > 0 ? value / max : 0
  return (
    <div
      title={`${value} events`}
      className="transition-colors"
      style={{
        width: '100%',
        height: 18,
        background: `rgba(6, 144, 252, ${0.04 + intensity * 0.7})`,
        border: '1px solid var(--border)',
      }}
    />
  )
}

function OperationsHeatmap() {
  const hours = Array.from({ length: 24 }, (_, h) => h)
  const allValues = heatmapData.flat()
  const max = Math.max(...allValues)

  return (
    <div className="overflow-x-auto">
      {/* Hour labels */}
      <div className="flex gap-px mb-1 pl-24">
        {hours.map((h) => (
          <div key={h} className="flex-1 text-center text-xs" style={{ fontSize: '0.65rem', color: 'var(--fg-muted)' }}>
            {h === 0 ? '12 am' : h === 6 ? '6 am' : h === 12 ? '12 pm' : h === 18 ? '6 pm' : h === 23 ? '11 pm' : ''}
          </div>
        ))}
      </div>
      {STORE_IDS.map((storeId, si) => (
        <div key={storeId} className="flex items-center gap-px mb-px">
          <div className="w-24 shrink-0 truncate pr-2 text-right text-xs" style={{ color: 'var(--fg-muted)' }}>
            {storeId}
          </div>
          <div className="flex flex-1 gap-px">
            {hours.map((h) => (
              <div key={h} className="flex-1">
                <HeatmapCell value={heatmapData[si]?.[h] ?? 0} max={max} />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export default function DashboardPage() {
  const router = useRouter()

  return (
    <div className="flex flex-col gap-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold" style={{ color: 'var(--fg)' }}>
            Good morning, Elena
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--fg-muted)' }}>
            Here&apos;s what&apos;s happening at your stores today — {format(new Date(), 'EEEE, MMMM d')}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <StoreSelector />
          <button
            className="text-sm px-3 py-1.5 rounded-md transition-colors"
            style={{
              border: '1px solid var(--border-strong)',
              color: 'var(--fg-muted)',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--fg)' }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--fg-muted)' }}
          >
            Download report
          </button>
        </div>
      </div>

      {/* Metric strip */}
      <div
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6"
        style={{ borderRadius: 'var(--radius)', border: '1px solid var(--border)', background: 'var(--bg-panel)' }}
      >
        <MetricTile
          label="Activity today"
          value="12,847"
          delta={8.2}
        />
        <MetricTile
          label="Theft prevented"
          value="$2,340"
          sparkline={metrics.shrinkSparkline}
        />
        <MetricTile
          label="Restocks done"
          value={metrics.stockoutsResolved}
          secondary={`avg ${metrics.avgResolutionTime}`}
        />
        <MetricTile
          label="Walk-out checkouts"
          value={metrics.walkouts}
          secondary={`${metrics.walkoutPct}% of total`}
        />
        <MetricTile
          label="Payments working"
          value={`${metrics.paymentSuccessRate}%`}
          secondary={`${metrics.paymentFailovers} retried`}
        />
        <MetricTile
          label="Cameras online"
          value={`${metrics.activeCameras} / ${metrics.totalCameras}`}
          secondary="2 need attention"
          onClick={() => router.push('/settings?tab=cameras')}
        />
      </div>

      {/* Two-column main */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left: event stream */}
        <div className="lg:col-span-3 flex flex-col" style={{ borderRadius: 'var(--radius)', border: '1px solid var(--border)', background: 'var(--bg-panel)' }}>
          <div className="px-5 pt-4">
            <SectionHeader
              title="What's happening now"
              description="Live activity across all your stores"
              action={
                <Link href="/events" style={{ color: 'var(--brand-accent)' }}>
                  See all →
                </Link>
              }
            />
          </div>
          <EventStream limit={30} />
        </div>

        {/* Right column */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          {/* Flagged for review */}
          <div style={{ borderRadius: 'var(--radius)', border: '1px solid var(--border)', background: 'var(--bg-panel)' }}>
            <div className="px-5 pt-4 pb-2">
              <SectionHeader
                title="Things to look at"
                description="5 events that may need your attention"
                action={
                  <Link href="/loss-prevention" style={{ color: 'var(--brand-accent)' }}>
                    Open all →
                  </Link>
                }
              />
            </div>
            <div style={{ borderTop: '1px solid var(--border)' }}>
              {[
                { id: 'evt-001', type: 'pick-without-pay', camera: 'CAM-07', time: '14:27', value: '$84.50', conf: 0.94 },
                { id: 'evt-002', type: 'tailgating', camera: 'CAM-14', time: '13:55', value: null, conf: 0.88 },
                { id: 'evt-003', type: 'cart-tampering', camera: 'CAM-03', time: '12:41', value: '$22.00', conf: 0.91 },
                { id: 'evt-004', type: 'walk-out', camera: 'CAM-09', time: '11:18', value: '$47.30', conf: 0.97 },
                { id: 'evt-005', type: 'pick-without-pay', camera: 'CAM-11', time: '10:02', value: '$13.99', conf: 0.79 },
              ].map((item) => (
                <Link
                  key={item.id}
                  href={`/events/${item.id}`}
                  className="flex items-center gap-3 px-4 transition-colors"
                  style={{ height: 44, borderBottom: '1px solid var(--border)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-hover)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
                >
                  {/* Thumbnail placeholder */}
                  <div
                    className="flex items-center justify-center rounded-sm shrink-0"
                    style={{ width: 40, height: 28, background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
                  >
                    <Play size={10} style={{ color: 'var(--fg-dim)' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate" style={{ color: 'var(--fg)' }}>{friendlyEvent(item.type as EventType)}</p>
                    <p className="text-xs" style={{ color: 'var(--fg-muted)' }}>{item.camera} · {item.time}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs" style={{ color: 'var(--danger)' }}>
                      {Math.round(item.conf * 100)}% sure
                    </span>
                    {item.value && (
                      <p className="text-xs" style={{ color: 'var(--fg-muted)' }}>{item.value}</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Store health */}
          <div style={{ borderRadius: 'var(--radius)', border: '1px solid var(--border)', background: 'var(--bg-panel)' }}>
            <div className="px-5 pt-4 pb-2">
              <SectionHeader
                title="How your stores are doing"
                description="Live status and theft trend"
                action={
                  <Link href="/stores" style={{ color: 'var(--brand-accent)' }}>
                    See all →
                  </Link>
                }
              />
            </div>
            <div style={{ borderTop: '1px solid var(--border)' }}>
              {stores.slice(0, 5).map((store) => (
                <Link
                  key={store.id}
                  href={`/stores/${store.id}`}
                  className="flex items-center gap-3 px-5 transition-colors"
                  style={{ height: 48, borderBottom: '1px solid var(--border)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-hover)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
                >
                  <span
                    style={{
                      width: 7,
                      height: 7,
                      borderRadius: '50%',
                      background: store.status === 'online' ? 'var(--success)' : store.status === 'degraded' ? 'var(--warning)' : 'var(--danger)',
                      flexShrink: 0,
                    }}
                  />
                  <span className="text-sm flex-1" style={{ color: 'var(--fg)' }}>{store.id}</span>
                  <span className="text-xs" style={{ color: 'var(--fg-muted)' }}>{store.eventsPerHour} events/hr</span>
                  <span className="text-xs font-medium" style={{ color: store.shrinkDelta > 0 ? 'var(--danger)' : 'var(--success)', fontVariantNumeric: 'tabular-nums' }}>
                    {store.shrinkDelta > 0 ? '+' : ''}{store.shrinkDelta}%
                  </span>
                </Link>
              ))}
            </div>
          </div>

          {/* Today's anomalies */}
          <div style={{ borderRadius: 'var(--radius)', border: '1px solid var(--border)', background: 'var(--bg-panel)' }}>
            <div className="px-5 pt-4 pb-2">
              <SectionHeader
                title="Unusual patterns today"
                description="Things that look different from a normal day"
              />
            </div>
            <div className="flex flex-col gap-0" style={{ borderTop: '1px solid var(--border)' }}>
              {ANOMALY_DESCRIPTIONS.map((anomaly, i) => (
                <div
                  key={i}
                  className="px-5 py-3"
                  style={{ borderBottom: i < ANOMALY_DESCRIPTIONS.length - 1 ? '1px solid var(--border)' : undefined }}
                >
                  <div className="flex items-start gap-2.5">
                    <span style={{ color: anomaly.severity === 'flagged' ? 'var(--danger)' : 'var(--warning)', fontSize: 8, marginTop: 5, flexShrink: 0 }}>●</span>
                    <div>
                      <p className="text-sm" style={{ color: 'var(--fg)' }}>{anomaly.title}</p>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--fg-muted)' }}>{anomaly.detail}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Heatmap */}
      <div style={{ borderRadius: 'var(--radius)', border: '1px solid var(--border)', background: 'var(--bg-panel)' }}>
        <div className="px-5 pt-4">
          <SectionHeader
            title="Busiest times of day"
            description="When your stores see the most activity"
          />
        </div>
        <div className="px-5 pb-5 pt-2" style={{ borderTop: '1px solid var(--border)' }}>
          <OperationsHeatmap />
          <p className="text-xs mt-3" style={{ color: 'var(--fg-muted)' }}>
            Each square shows one hour of the day. Brighter blue means more activity.
          </p>
        </div>
      </div>
    </div>
  )
}
