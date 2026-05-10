'use client'

import { format } from 'date-fns'
import { SectionHeader } from '@/components/section-header'
import { generatePaymentTransactions, generatePaymentTimeSeries, getProcessorVolumes } from '@/lib/mock-data'
import {
  LineChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis
} from 'recharts'

const transactions = generatePaymentTransactions()
const timeSeries = generatePaymentTimeSeries()
const processors = getProcessorVolumes()

const totalVolume = processors.reduce((s, p) => s + p.volume, 0)
const totalFailovers = processors.reduce((s, p) => s + p.failover, 0)
const successRate = ((transactions.filter((t) => t.status === 'success').length / transactions.length) * 100).toFixed(1)

export default function PaymentsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold" style={{ color: 'var(--fg)' }}>
          Payments
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--fg-muted)' }}>
          How payments are being processed and how it&apos;s going.
        </p>
      </div>

      {/* Stats */}
      <div
        className="grid grid-cols-2 sm:grid-cols-4"
        style={{ borderRadius: 'var(--radius)', border: '1px solid var(--border)', background: 'var(--bg-panel)' }}
      >
        {[
          { label: 'Working rate', value: `${successRate}%`, color: 'var(--success)' },
          { label: 'Payments today', value: `${totalVolume.toLocaleString()}`, color: 'var(--fg)' },
          { label: 'Retried', value: String(totalFailovers), color: totalFailovers > 5 ? 'var(--warning)' : 'var(--fg)' },
          { label: 'Failed', value: String(transactions.filter((t) => t.status === 'failed').length), color: 'var(--danger)' },
        ].map((stat, i, arr) => (
          <div
            key={stat.label}
            className="p-5"
            style={{ borderRight: i < arr.length - 1 ? '1px solid var(--border)' : undefined }}
          >
            <p className="text-xs" style={{ color: 'var(--fg-muted)' }}>{stat.label}</p>
            <p className="font-semibold mt-1" style={{ fontSize: '1.625rem', color: stat.color, fontVariantNumeric: 'tabular-nums' }}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Success rate chart */}
      <div style={{ borderRadius: 'var(--radius)', border: '1px solid var(--border)', background: 'var(--bg-panel)' }}>
        <div className="px-5 pt-4">
          <SectionHeader
            title="How payments have been doing"
            description="The percentage that worked over the last 15 hours"
          />
        </div>
        <div className="px-4 pb-4 pt-2" style={{ borderTop: '1px solid var(--border)' }}>
          <ResponsiveContainer width="100%" height={120}>
            <LineChart data={timeSeries}>
              <XAxis
                dataKey="time"
                tick={{ fontSize: 10, fill: 'var(--fg-dim)', fontFamily: 'var(--font-mono)' }}
                tickLine={false}
                axisLine={false}
                interval={7}
              />
              <YAxis
                domain={[96, 100]}
                tick={{ fontSize: 10, fill: 'var(--fg-dim)', fontFamily: 'var(--font-mono)' }}
                tickLine={false}
                axisLine={false}
                width={36}
              />
              <Tooltip
                contentStyle={{
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-strong)',
                  borderRadius: 0,
                  fontSize: 11,
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--fg)',
                }}
              />
              <Line
                type="monotone"
                dataKey="rate"
                stroke="var(--brand-accent)"
                strokeWidth={1.5}
                dot={false}
                activeDot={{ r: 3, fill: 'var(--brand-accent)' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* PSP routing */}
      <div style={{ borderRadius: 'var(--radius)', border: '1px solid var(--border)', background: 'var(--bg-panel)' }}>
        <div className="px-5 pt-4">
          <SectionHeader
            title="Payment processors"
            description="Which services are handling your payments"
          />
        </div>
        <div className="flex flex-col gap-0 px-4 pb-4 pt-2" style={{ borderTop: '1px solid var(--border)' }}>
          {processors.map((proc) => {
            const pct = totalVolume > 0 ? proc.volume / totalVolume : 0
            return (
              <div key={proc.name} className="flex items-center gap-4 py-2.5" style={{ borderBottom: '1px solid var(--border)' }}>
                <span className="data-mono text-xs w-16" style={{ color: 'var(--fg)' }}>{proc.name}</span>
                <div className="flex-1" style={{ height: 8, background: 'var(--bg-elevated)' }}>
                  <div
                    className="h-full transition-all"
                    style={{ width: `${pct * 100}%`, background: 'var(--brand-accent)', opacity: 0.7 }}
                  />
                </div>
                <span className="data-mono text-xs w-16 text-right" style={{ color: 'var(--fg-muted)' }}>
                  {proc.volume.toLocaleString()}
                </span>
                {proc.failover > 0 && (
                  <span className="data-mono text-xs" style={{ color: 'var(--warning)' }}>
                    {proc.failover} failovers
                  </span>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Recent transactions */}
      <div style={{ borderRadius: 'var(--radius)', border: '1px solid var(--border)', background: 'var(--bg-panel)' }}>
        <div className="px-5 pt-4">
          <SectionHeader
            title="Recent payments"
            description="The last 20 payments across all your stores"
          />
        </div>
        <div style={{ borderTop: '1px solid var(--border)' }}>
          <div className="flex items-center gap-3 px-4 py-2.5" style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg)' }}>
            <span className="text-xs w-28" style={{ color: 'var(--fg-muted)' }}>When</span>
            <span className="text-xs flex-1" style={{ color: 'var(--fg-muted)' }}>Reference</span>
            <span className="text-xs w-20" style={{ color: 'var(--fg-muted)' }}>Amount</span>
            <span className="text-xs w-20" style={{ color: 'var(--fg-muted)' }}>Service</span>
            <span className="text-xs w-20" style={{ color: 'var(--fg-muted)' }}>Store</span>
            <span className="text-xs w-20 text-right" style={{ color: 'var(--fg-muted)' }}>Status</span>
          </div>
          {transactions.slice(0, 20).map((tx) => (
            <div
              key={tx.id}
              className="flex items-center gap-3 px-4"
              style={{ height: 44, borderBottom: '1px solid var(--border)' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-hover)' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
            >
              <span className="text-xs w-28" style={{ color: 'var(--fg-muted)' }}>
                {format(tx.timestamp, 'HH:mm')}
              </span>
              <span className="data-mono text-xs flex-1" style={{ color: 'var(--fg-muted)' }}>{tx.id}</span>
              <span className="text-sm w-20" style={{ color: 'var(--fg)', fontVariantNumeric: 'tabular-nums' }}>
                ${tx.amount.toFixed(2)}
              </span>
              <span className="text-xs w-20" style={{ color: 'var(--fg-muted)' }}>{tx.processor}</span>
              <span className="text-xs w-20" style={{ color: 'var(--fg-muted)' }}>{tx.store.split('-')[0]}</span>
              <span
                className="flex items-center justify-end gap-1.5 w-20"
              >
                <span style={{
                  fontSize: 8,
                  color: tx.status === 'success' ? 'var(--success)'
                    : tx.status === 'failover' ? 'var(--warning)'
                    : 'var(--danger)',
                }}>●</span>
                <span className="text-xs" style={{
                  color: tx.status === 'success' ? 'var(--success)'
                    : tx.status === 'failover' ? 'var(--warning)'
                    : 'var(--danger)',
                }}>
                  {tx.status === 'success' ? 'OK' : tx.status === 'failover' ? 'Retried' : tx.status === 'failed' ? 'Failed' : 'Pending'}
                </span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
