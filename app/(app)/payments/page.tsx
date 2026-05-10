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
          Payment <em>routing</em>
        </h1>
        <p className="data-mono text-xs mt-1" style={{ color: 'var(--fg-dim)' }}>
          Reconciliation & PSP health
        </p>
      </div>

      {/* Stats */}
      <div
        className="grid grid-cols-2 sm:grid-cols-4"
        style={{ border: '1px solid var(--border)', background: 'var(--bg-panel)' }}
      >
        {[
          { label: 'SUCCESS RATE', value: `${successRate}%`, color: 'var(--success)' },
          { label: 'TOTAL VOLUME', value: `${totalVolume.toLocaleString()}`, color: 'var(--fg)' },
          { label: 'FAILOVERS TODAY', value: String(totalFailovers), color: totalFailovers > 5 ? 'var(--warning)' : 'var(--fg)' },
          { label: 'FAILURES', value: String(transactions.filter((t) => t.status === 'failed').length), color: 'var(--danger)' },
        ].map((stat, i, arr) => (
          <div
            key={stat.label}
            className="p-4"
            style={{ borderRight: i < arr.length - 1 ? '1px solid var(--border)' : undefined }}
          >
            <p className="section-label">{stat.label}</p>
            <p className="data-mono font-semibold mt-1" style={{ fontSize: '1.5rem', color: stat.color }}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Success rate chart */}
      <div style={{ border: '1px solid var(--border)', background: 'var(--bg-panel)' }}>
        <div className="px-4 pt-4">
          <SectionHeader number="01" title="SUCCESS RATE — LAST 15H" />
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
                stroke="var(--accent)"
                strokeWidth={1.5}
                dot={false}
                activeDot={{ r: 3, fill: 'var(--accent)' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* PSP routing */}
      <div style={{ border: '1px solid var(--border)', background: 'var(--bg-panel)' }}>
        <div className="px-4 pt-4">
          <SectionHeader number="02" title="PSP ROUTING" />
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
                    style={{ width: `${pct * 100}%`, background: 'var(--accent)', opacity: 0.7 }}
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
      <div style={{ border: '1px solid var(--border)', background: 'var(--bg-panel)' }}>
        <div className="px-4 pt-4">
          <SectionHeader number="03" title="RECENT TRANSACTIONS" />
        </div>
        <div style={{ borderTop: '1px solid var(--border)' }}>
          <div className="flex items-center gap-3 px-4 py-2" style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg)' }}>
            <span className="section-label w-28">TIME</span>
            <span className="section-label flex-1">ID</span>
            <span className="section-label w-20">AMOUNT</span>
            <span className="section-label w-20">PROCESSOR</span>
            <span className="section-label w-20">STORE</span>
            <span className="section-label w-20 text-right">STATUS</span>
          </div>
          {transactions.slice(0, 20).map((tx) => (
            <div
              key={tx.id}
              className="flex items-center gap-3 px-4"
              style={{ height: 44, borderBottom: '1px solid var(--border)' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-hover)' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
            >
              <span className="data-mono text-xs w-28" style={{ color: 'var(--fg-dim)' }}>
                {format(tx.timestamp, 'HH:mm:ss')}
              </span>
              <span className="data-mono text-xs flex-1" style={{ color: 'var(--fg-muted)' }}>{tx.id}</span>
              <span className="data-mono text-xs w-20" style={{ color: 'var(--fg)' }}>
                ${tx.amount.toFixed(2)}
              </span>
              <span className="data-mono text-xs w-20" style={{ color: 'var(--fg-muted)' }}>{tx.processor}</span>
              <span className="data-mono text-xs w-20" style={{ color: 'var(--fg-dim)' }}>{tx.store.split('-')[0]}</span>
              <span
                className="flex items-center justify-end gap-1.5 w-20"
              >
                <span style={{
                  fontSize: 7,
                  color: tx.status === 'success' ? 'var(--success)'
                    : tx.status === 'failover' ? 'var(--warning)'
                    : 'var(--danger)',
                }}>●</span>
                <span className="data-mono text-xs" style={{
                  color: tx.status === 'success' ? 'var(--success)'
                    : tx.status === 'failover' ? 'var(--warning)'
                    : 'var(--danger)',
                }}>{tx.status}</span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
