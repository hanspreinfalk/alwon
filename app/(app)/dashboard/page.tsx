'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { Play } from 'lucide-react'
import { SectionHeader } from '@/components/section-header'
import { MetricTile } from '@/components/metric-tile'
import { EventStream } from '@/components/event-stream'
import { StatusPill } from '@/components/status-pill'
import { StoreSelector } from '@/components/store-selector'
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
      <div className="flex gap-px mb-1 pl-20">
        {hours.map((h) => (
          <div key={h} className="flex-1 text-center section-label" style={{ fontSize: '0.55rem' }}>
            {h === 0 ? '00' : h === 6 ? '06' : h === 12 ? '12' : h === 18 ? '18' : h === 23 ? '23' : ''}
          </div>
        ))}
      </div>
      {STORE_IDS.map((storeId, si) => (
        <div key={storeId} className="flex items-center gap-px mb-px">
          <div className="w-20 shrink-0 section-label truncate pr-2 text-right" style={{ fontSize: '0.58rem' }}>
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
            Today&apos;s <em>operations</em>
          </h1>
          <p className="data-mono text-xs mt-1" style={{ color: 'var(--fg-dim)' }}>
            {format(new Date(), 'EEEE, MMMM d yyyy')}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <StoreSelector />
          <button
            className="data-mono text-xs px-3 py-1.5 transition-colors"
            style={{
              border: '1px solid var(--border-strong)',
              color: 'var(--fg-muted)',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--fg)' }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--fg-muted)' }}
          >
            EXPORT
          </button>
        </div>
      </div>

      {/* Metric strip */}
      <div
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6"
        style={{ border: '1px solid var(--border)', background: 'var(--bg-panel)' }}
      >
        <MetricTile
          label="EVENTS PROCESSED"
          value="12,847"
          delta={8.2}
        />
        <MetricTile
          label="SHRINK PREVENTED"
          value="$2,340"
          sparkline={metrics.shrinkSparkline}
        />
        <MetricTile
          label="STOCKOUTS RESOLVED"
          value={metrics.stockoutsResolved}
          secondary={`avg ${metrics.avgResolutionTime}`}
        />
        <MetricTile
          label="WALK-OUT CHECKOUTS"
          value={metrics.walkouts}
          secondary={`${metrics.walkoutPct}% of total`}
        />
        <MetricTile
          label="PAYMENT SUCCESS"
          value={`${metrics.paymentSuccessRate}%`}
          secondary={`${metrics.paymentFailovers} failovers`}
        />
        <MetricTile
          label="ACTIVE CAMERAS"
          value={`${metrics.activeCameras} / ${metrics.totalCameras}`}
          secondary="2 offline"
          onClick={() => router.push('/settings?tab=cameras')}
        />
      </div>

      {/* Two-column main */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left: event stream */}
        <div className="lg:col-span-3 flex flex-col" style={{ border: '1px solid var(--border)', background: 'var(--bg-panel)' }}>
          <div className="px-4 pt-4">
            <SectionHeader
              number="01"
              title="LIVE EVENT STREAM"
              action={
                <Link href="/events" style={{ color: 'var(--accent)' }}>
                  View all →
                </Link>
              }
            />
          </div>
          <EventStream limit={30} />
        </div>

        {/* Right column */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          {/* Flagged for review */}
          <div style={{ border: '1px solid var(--border)', background: 'var(--bg-panel)' }}>
            <div className="px-4 pt-4 pb-2">
              <SectionHeader
                number="02"
                title="FLAGGED FOR REVIEW"
                action={
                  <Link href="/loss-prevention" style={{ color: 'var(--accent)' }}>
                    View queue →
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
                    <p className="text-xs truncate" style={{ color: 'var(--fg)' }}>{item.type}</p>
                    <p className="data-mono text-xs" style={{ color: 'var(--fg-dim)' }}>{item.camera} · {item.time}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="data-mono text-xs" style={{ color: 'var(--danger)' }}>
                      conf {item.conf}
                    </span>
                    {item.value && (
                      <p className="data-mono text-xs" style={{ color: 'var(--fg-muted)' }}>{item.value}</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Store health */}
          <div style={{ border: '1px solid var(--border)', background: 'var(--bg-panel)' }}>
            <div className="px-4 pt-4 pb-2">
              <SectionHeader
                number="03"
                title="STORE HEALTH"
                action={
                  <Link href="/stores" style={{ color: 'var(--accent)' }}>
                    All stores →
                  </Link>
                }
              />
            </div>
            <div style={{ borderTop: '1px solid var(--border)' }}>
              {stores.slice(0, 5).map((store) => (
                <Link
                  key={store.id}
                  href={`/stores/${store.id}`}
                  className="flex items-center gap-3 px-4 transition-colors"
                  style={{ height: 44, borderBottom: '1px solid var(--border)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-hover)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
                >
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      background: store.status === 'online' ? 'var(--success)' : store.status === 'degraded' ? 'var(--warning)' : 'var(--danger)',
                      flexShrink: 0,
                    }}
                  />
                  <span className="data-mono text-xs flex-1" style={{ color: 'var(--fg)' }}>{store.id}</span>
                  <span className="data-mono text-xs" style={{ color: 'var(--fg-dim)' }}>{store.eventsPerHour}/h</span>
                  <span className="data-mono text-xs" style={{ color: store.shrinkDelta > 0 ? 'var(--danger)' : 'var(--success)' }}>
                    {store.shrinkDelta > 0 ? '+' : ''}{store.shrinkDelta}%
                  </span>
                </Link>
              ))}
            </div>
          </div>

          {/* Today's anomalies */}
          <div style={{ border: '1px solid var(--border)', background: 'var(--bg-panel)' }}>
            <div className="px-4 pt-4 pb-2">
              <SectionHeader number="04" title="TODAY'S ANOMALIES" />
            </div>
            <div className="flex flex-col gap-0" style={{ borderTop: '1px solid var(--border)' }}>
              {ANOMALY_DESCRIPTIONS.map((anomaly, i) => (
                <div
                  key={i}
                  className="px-4 py-3"
                  style={{ borderBottom: i < ANOMALY_DESCRIPTIONS.length - 1 ? '1px solid var(--border)' : undefined }}
                >
                  <div className="flex items-start gap-2">
                    <span style={{ color: anomaly.severity === 'flagged' ? 'var(--danger)' : 'var(--warning)', fontSize: 7, marginTop: 4, flexShrink: 0 }}>●</span>
                    <div>
                      <p className="text-xs" style={{ color: 'var(--fg)' }}>{anomaly.title}</p>
                      <p className="data-mono text-xs mt-0.5" style={{ color: 'var(--fg-dim)' }}>{anomaly.detail}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Heatmap */}
      <div style={{ border: '1px solid var(--border)', background: 'var(--bg-panel)' }}>
        <div className="px-4 pt-4">
          <SectionHeader number="02" title="OPERATIONS HEATMAP" />
        </div>
        <div className="px-4 pb-4 pt-2" style={{ borderTop: '1px solid var(--border)' }}>
          <OperationsHeatmap />
          <p className="data-mono text-xs mt-3" style={{ color: 'var(--fg-dim)' }}>
            Events per hour by store · today · intensity scales to peak
          </p>
        </div>
      </div>
    </div>
  )
}
