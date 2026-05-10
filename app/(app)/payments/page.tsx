'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { ChevronDown } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { generatePaymentTransactions, generatePaymentTimeSeries, getProcessorVolumes } from '@/lib/mock-data'
import {
  Area,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { cn } from '@/lib/utils'

const transactions = generatePaymentTransactions()
const timeSeries = generatePaymentTimeSeries()
const processors = getProcessorVolumes()

const totalVolume = processors.reduce((s, p) => s + p.volume, 0)
const totalFailovers = processors.reduce((s, p) => s + p.failover, 0)
const successRate = ((transactions.filter((t) => t.status === 'success').length / transactions.length) * 100).toFixed(1)
const failedCount = transactions.filter((t) => t.status === 'failed').length

function formatPaidAmount(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  } catch {
    return `${amount.toFixed(2)} ${currency}`
  }
}

export default function PaymentsPage() {
  const [expandedPaymentId, setExpandedPaymentId] = useState<string | null>(null)

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-[18px] font-semibold tracking-tight">Payments</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          How payments are being processed and how it&apos;s going.
        </p>
      </div>

      {/* Stats — p-4 matching home page stat tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-4 rounded-xl overflow-hidden ring-1 ring-foreground/10">
        {[
          { label: 'Working rate', value: `${successRate}%`, valueClass: 'text-green-600 dark:text-green-400' },
          { label: 'Payments today', value: totalVolume.toLocaleString(), valueClass: '' },
          { label: 'Retried', value: String(totalFailovers), valueClass: totalFailovers > 5 ? 'text-amber-600 dark:text-amber-400' : '' },
          { label: 'Failed', value: String(failedCount), valueClass: 'text-red-600 dark:text-red-400' },
        ].map((stat, i, arr) => (
          <div
            key={stat.label}
            className={`flex flex-col gap-1 p-4 bg-card ${i < arr.length - 1 ? 'border-r' : ''}`}
          >
            <p className="text-xs text-muted-foreground font-medium">{stat.label}</p>
            <p className={`text-[1.625rem] font-semibold tabular-nums leading-tight ${stat.valueClass}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Success rate chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold">How payments have been doing</CardTitle>
          <CardDescription>
            Success rate by hour for today — midnight through end of day (local time)
          </CardDescription>
        </CardHeader>
        <CardContent className="pb-6">
          <ResponsiveContainer width="100%" height={260}>
            <ComposedChart data={timeSeries} margin={{ top: 8, right: 8, left: 0, bottom: 4 }}>
              <defs>
                <linearGradient id="paymentsRateAreaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--foreground)" stopOpacity={0.22} />
                  <stop offset="55%" stopColor="var(--foreground)" stopOpacity={0.06} />
                  <stop offset="100%" stopColor="var(--foreground)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="time"
                tick={{ fontSize: 10, fill: 'var(--muted-foreground)', fontFamily: 'var(--font-mono)' }}
                tickLine={false}
                axisLine={false}
                interval={3}
              />
              <YAxis
                domain={[96, 100]}
                tick={{ fontSize: 10, fill: 'var(--muted-foreground)', fontFamily: 'var(--font-mono)' }}
                tickLine={false}
                axisLine={false}
                width={36}
              />
              <Tooltip
                contentStyle={{
                  background: 'var(--popover)',
                  border: '1px solid var(--border)',
                  borderRadius: 8,
                  fontSize: 11,
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--foreground)',
                }}
              />
              <Area
                type="monotone"
                dataKey="rate"
                stroke="none"
                fill="url(#paymentsRateAreaGradient)"
                baseLine={96}
              />
              <Line
                type="monotone"
                dataKey="rate"
                stroke="var(--foreground)"
                strokeWidth={1.5}
                dot={false}
                activeDot={{ r: 3, fill: 'var(--foreground)' }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* PSP routing */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold">Payment processors</CardTitle>
          <CardDescription>Which services are handling your payments</CardDescription>
        </CardHeader>
        <CardContent>
          {processors.map((proc) => {
            const pct = totalVolume > 0 ? proc.volume / totalVolume : 0
            return (
              <div key={proc.name} className="flex items-center gap-4 py-2.5 border-b last:border-0">
                <span className="font-mono text-xs w-16 font-medium">{proc.name}</span>
                <div className="flex-1 rounded-full overflow-hidden bg-muted" style={{ height: 8 }}>
                  <div
                    className="h-full transition-all rounded-full bg-foreground/70"
                    style={{ width: `${pct * 100}%` }}
                  />
                </div>
                <span className="font-mono text-xs w-16 text-right text-muted-foreground tabular-nums">
                  {proc.volume.toLocaleString()}
                </span>
                {proc.failover > 0 && (
                  <span className="font-mono text-xs text-amber-600 dark:text-amber-400">
                    {proc.failover} failovers
                  </span>
                )}
              </div>
            )
          })}
        </CardContent>
      </Card>

      {/* Recent transactions */}
      <Card className="p-0 gap-0 overflow-hidden">
        <div className="flex items-center gap-2 border-b bg-muted/50 px-4 py-2.5 pl-3">
          <span className="w-8 shrink-0" aria-hidden />
          <span className="text-xs font-medium text-muted-foreground w-24 shrink-0">When</span>
          <span className="min-w-0 flex-1 text-xs font-medium text-muted-foreground">Reference</span>
          <span className="w-[7.5rem] shrink-0 text-right text-xs font-medium text-muted-foreground">
            Amount
          </span>
          <span className="w-16 shrink-0 text-xs font-medium text-muted-foreground">Service</span>
          <span className="w-20 shrink-0 text-xs font-medium text-muted-foreground">Store</span>
          <span className="w-[5.5rem] shrink-0 text-right text-xs font-medium text-muted-foreground">
            Status
          </span>
        </div>
        {transactions.slice(0, 20).map((tx) => {
          const open = expandedPaymentId === tx.id
          return (
            <div key={tx.id} className="border-b last:border-b-0">
              <button
                type="button"
                aria-expanded={open}
                onClick={() => setExpandedPaymentId(open ? null : tx.id)}
                className="flex w-full items-start gap-2 px-4 py-2.5 pl-3 text-left transition-colors hover:bg-muted/40"
              >
                <ChevronDown
                  className={cn(
                    'mt-0.5 size-4 shrink-0 text-muted-foreground transition-transform duration-200',
                    open && '-rotate-180',
                  )}
                  aria-hidden
                />
                <span className="w-24 shrink-0 pt-0.5 text-xs text-muted-foreground tabular-nums">
                  {format(tx.timestamp, 'HH:mm')}
                </span>
                <span className="min-w-0 flex-1 truncate pt-0.5 font-mono text-xs text-muted-foreground">
                  {tx.id}
                </span>
                <span className="w-[7.5rem] shrink-0 pt-0.5 text-right text-sm font-semibold tabular-nums tracking-tight">
                  {formatPaidAmount(tx.amount, tx.currency)}
                </span>
                <span className="w-16 shrink-0 pt-0.5 text-xs text-muted-foreground">{tx.processor}</span>
                <span className="w-20 shrink-0 truncate pt-0.5 text-xs text-muted-foreground" title={tx.store}>
                  {tx.store.split('-')[0]}
                </span>
                <span className="flex w-[5.5rem] shrink-0 items-start justify-end gap-1.5 pt-0.5">
                  <span
                    className={`size-1.5 shrink-0 rounded-full ${
                      tx.status === 'success'
                        ? 'bg-green-500'
                        : tx.status === 'failover'
                          ? 'bg-amber-500'
                          : 'bg-red-500'
                    }`}
                  />
                  <span
                    className={`text-xs ${
                      tx.status === 'success'
                        ? 'text-green-600 dark:text-green-400'
                        : tx.status === 'failover'
                          ? 'text-amber-600 dark:text-amber-400'
                          : 'text-red-600 dark:text-red-400'
                    }`}
                  >
                    {tx.status === 'success'
                      ? 'OK'
                      : tx.status === 'failover'
                        ? 'Retried'
                        : tx.status === 'failed'
                          ? 'Failed'
                          : 'Pending'}
                  </span>
                </span>
              </button>

              {open && (
                <div className="border-t bg-muted/20 px-4 pb-4 pt-2">
                  <div className="overflow-hidden rounded-lg border bg-card">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b bg-muted/40">
                          <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">
                            Product
                          </th>
                          <th className="w-36 min-w-0 px-3 py-2 text-left text-xs font-medium text-muted-foreground">
                            SKU
                          </th>
                          <th className="w-28 px-3 py-2 text-right text-xs font-medium text-muted-foreground">
                            Line total
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {tx.lineItems.map((line, idx) => (
                          <tr key={`${tx.id}-${idx}`} className="border-b last:border-0">
                            <td className="px-3 py-2 text-foreground">{line.name}</td>
                            <td className="px-3 py-2 font-mono text-xs text-muted-foreground tabular-nums">
                              {line.sku}
                            </td>
                            <td className="px-3 py-2 text-right font-medium tabular-nums">
                              {formatPaidAmount(line.lineTotal, tx.currency)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </Card>
    </div>
  )
}
