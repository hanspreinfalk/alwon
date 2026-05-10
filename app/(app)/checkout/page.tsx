'use client'

import { useState, useEffect } from 'react'
import { SectionHeader } from '@/components/section-header'
import { generateCheckoutSessions } from '@/lib/mock-data'
import { format } from 'date-fns'

function useCounter(initial: number, interval = 2000, increment = 1) {
  const [value, setValue] = useState(initial)
  useEffect(() => {
    const t = setInterval(() => setValue((v) => v + Math.floor(Math.random() * increment + 1)), interval)
    return () => clearInterval(t)
  }, [interval, increment])
  return value
}

export default function CheckoutPage() {
  const sessions = generateCheckoutSessions()
  const walkouts = useCounter(312, 4000, 1)
  const kiosks = useCounter(847, 3000, 2)
  const assisted = useCounter(203, 5000, 1)

  const routeCounts = {
    'walk-out': sessions.filter((s) => s.route === 'walk-out').length,
    'kiosk': sessions.filter((s) => s.route === 'kiosk').length,
    'assisted': sessions.filter((s) => s.route === 'assisted').length,
  }
  const total = sessions.length

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold" style={{ color: 'var(--fg)' }}>
          Checkout
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--fg-muted)' }}>
          See how customers are paying right now.
        </p>
      </div>

      {/* Metric tiles */}
      <div
        className="grid grid-cols-1 sm:grid-cols-3"
        style={{ borderRadius: 'var(--radius)', border: '1px solid var(--border)', background: 'var(--bg-panel)' }}
      >
        {[
          { label: 'Walk-outs', value: walkouts, sub: 'no checkout needed' },
          { label: 'Self-checkout', value: kiosks, sub: 'used a kiosk' },
          { label: 'Assisted', value: assisted, sub: 'helped by staff' },
        ].map((tile, i, arr) => (
          <div
            key={tile.label}
            className="p-5"
            style={{ borderRight: i < arr.length - 1 ? '1px solid var(--border)' : undefined }}
          >
            <p className="text-xs" style={{ color: 'var(--fg-muted)' }}>{tile.label}</p>
            <p className="font-semibold mt-1" style={{ fontSize: '1.625rem', color: 'var(--fg)', fontVariantNumeric: 'tabular-nums' }}>
              {tile.value.toLocaleString()}
            </p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--fg-muted)' }}>{tile.sub}</p>
          </div>
        ))}
      </div>

      {/* Flow visualization */}
      <div style={{ borderRadius: 'var(--radius)', border: '1px solid var(--border)', background: 'var(--bg-panel)' }}>
        <div className="px-5 pt-4">
          <SectionHeader
            title="How customers are checking out"
            description="Where shoppers go when they're ready to leave"
          />
        </div>
        <div className="flex items-center justify-center gap-8 py-8 px-6" style={{ borderTop: '1px solid var(--border)' }}>
          {/* Entry */}
          <div className="flex flex-col items-center gap-2">
            <div
              className="flex items-center justify-center"
              style={{ width: 64, height: 64, border: '1px solid var(--border-strong)', background: 'var(--bg-elevated)' }}
            >
              <span className="data-mono text-xs text-center" style={{ color: 'var(--fg-muted)' }}>ENTRY</span>
            </div>
            <p className="data-mono text-xs" style={{ color: 'var(--fg-dim)' }}>{total} sessions</p>
          </div>

          {/* Arrow */}
          <div style={{ flex: 1, height: 1, background: 'var(--border-strong)' }} />

          {/* Routes */}
          <div className="flex flex-col gap-3">
            {[
              { label: 'Walked out', count: routeCounts['walk-out'], color: 'var(--brand-accent)' },
              { label: 'Self-checkout', count: routeCounts['kiosk'], color: 'var(--success)' },
              { label: 'Assisted by staff', count: routeCounts['assisted'], color: 'var(--warning)' },
            ].map((route) => (
              <div key={route.label} className="flex items-center gap-3">
                <div style={{ height: 1, width: 40, background: route.color, opacity: 0.5 }} />
                <div
                  className="px-3 py-2 rounded-md"
                  style={{
                    border: `1px solid ${route.color}`,
                    background: `rgba(${route.color === 'var(--brand-accent)' ? '6,144,252' : route.color === 'var(--success)' ? '74,222,128' : '251,191,36'},0.05)`,
                    minWidth: 140,
                  }}
                >
                  <p className="text-sm font-medium" style={{ color: route.color }}>{route.label}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--fg-muted)' }}>
                    {route.count} customers · {total > 0 ? Math.round(route.count / total * 100) : 0}%
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div style={{ flex: 1, height: 1, background: 'var(--border-strong)' }} />

          {/* Exit */}
          <div className="flex flex-col items-center gap-2">
            <div
              className="flex items-center justify-center"
              style={{ width: 64, height: 64, border: '1px solid var(--border-strong)', background: 'var(--bg-elevated)' }}
            >
              <span className="data-mono text-xs text-center" style={{ color: 'var(--fg-muted)' }}>EXIT</span>
            </div>
            <p className="data-mono text-xs" style={{ color: 'var(--fg-dim)' }}>
              {sessions.filter((s) => s.status === 'completed').length} complete
            </p>
          </div>
        </div>
      </div>

      {/* Session table */}
      <div style={{ borderRadius: 'var(--radius)', border: '1px solid var(--border)', background: 'var(--bg-panel)' }}>
        <div className="px-5 pt-4">
          <SectionHeader
            title="Customers in the store now"
            description="Live sessions and how they're checking out"
          />
        </div>
        <div style={{ borderTop: '1px solid var(--border)' }}>
          <div className="flex items-center gap-3 px-4 py-2.5" style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg)' }}>
            <span className="text-xs w-24" style={{ color: 'var(--fg-muted)' }}>Customer</span>
            <span className="text-xs w-20" style={{ color: 'var(--fg-muted)' }}>Entered</span>
            <span className="text-xs w-24" style={{ color: 'var(--fg-muted)' }}>Method</span>
            <span className="text-xs w-20" style={{ color: 'var(--fg-muted)' }}>Confidence</span>
            <span className="text-xs flex-1" style={{ color: 'var(--fg-muted)' }}>Status</span>
            <span className="text-xs w-20 text-right" style={{ color: 'var(--fg-muted)' }}>Value</span>
          </div>
          {sessions.slice(0, 15).map((session) => (
            <div
              key={session.id}
              className="flex items-center gap-3 px-4"
              style={{ height: 44, borderBottom: '1px solid var(--border)' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-hover)' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
            >
              <span className="data-mono text-xs w-24" style={{ color: 'var(--fg)' }}>{session.id}</span>
              <span className="text-xs w-20" style={{ color: 'var(--fg-muted)' }}>
                {format(session.entryTime, 'HH:mm')}
              </span>
              <span className="text-xs w-24" style={{ color: 'var(--fg-muted)' }}>
                {session.route === 'walk-out' ? 'Walked out' : session.route === 'kiosk' ? 'Kiosk' : 'Assisted'}
              </span>
              <span className="text-xs w-20" style={{ color: 'var(--fg-muted)' }}>
                {Math.round(session.confidence * 100)}%
              </span>
              <span className="flex items-center gap-1.5 flex-1">
                <span style={{
                  fontSize: 8,
                  color: session.status === 'completed' ? 'var(--success)'
                    : session.status === 'in-progress' ? 'var(--brand-accent)'
                    : 'var(--fg-muted)',
                }}>●</span>
                <span className="text-xs" style={{ color: 'var(--fg-muted)' }}>
                  {session.status === 'in-progress' ? 'In progress' : session.status === 'completed' ? 'Done' : 'Left'}
                </span>
              </span>
              <span className="text-xs w-20 text-right" style={{ color: 'var(--fg-muted)', fontVariantNumeric: 'tabular-nums' }}>
                ${session.estimatedValue.toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
