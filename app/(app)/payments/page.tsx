'use client'

import { format } from 'date-fns'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
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
const failedCount = transactions.filter((t) => t.status === 'failed').length

export default function PaymentsPage() {
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
          <CardDescription>The percentage that worked over the last 15 hours</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={120}>
            <LineChart data={timeSeries}>
              <XAxis
                dataKey="time"
                tick={{ fontSize: 10, fill: 'var(--muted-foreground)', fontFamily: 'var(--font-mono)' }}
                tickLine={false}
                axisLine={false}
                interval={7}
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
              <Line
                type="monotone"
                dataKey="rate"
                stroke="var(--foreground)"
                strokeWidth={1.5}
                dot={false}
                activeDot={{ r: 3, fill: 'var(--foreground)' }}
              />
            </LineChart>
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
        <CardHeader className="px-4 py-3 border-b">
          <CardTitle className="text-sm font-semibold">Recent payments</CardTitle>
          <CardDescription>The last 20 payments across all your stores</CardDescription>
        </CardHeader>
        <div className="flex items-center gap-3 px-4 py-2.5 border-b bg-muted/50">
          <span className="text-xs text-muted-foreground font-medium w-28">When</span>
          <span className="text-xs text-muted-foreground font-medium flex-1">Reference</span>
          <span className="text-xs text-muted-foreground font-medium w-20">Amount</span>
          <span className="text-xs text-muted-foreground font-medium w-20">Service</span>
          <span className="text-xs text-muted-foreground font-medium w-20">Store</span>
          <span className="text-xs text-muted-foreground font-medium w-20 text-right">Status</span>
        </div>
        {transactions.slice(0, 20).map((tx) => (
          <div
            key={tx.id}
            className="flex items-center gap-3 px-4 border-b hover:bg-muted/40 transition-colors"
            style={{ height: 44 }}
          >
            <span className="text-xs w-28 text-muted-foreground tabular-nums">
              {format(tx.timestamp, 'HH:mm')}
            </span>
            <span className="font-mono text-xs flex-1 text-muted-foreground">{tx.id}</span>
            <span className="text-sm w-20 font-medium tabular-nums">
              ${tx.amount.toFixed(2)}
            </span>
            <span className="text-xs w-20 text-muted-foreground">{tx.processor}</span>
            <span className="text-xs w-20 text-muted-foreground">{tx.store.split('-')[0]}</span>
            <span className="flex items-center justify-end gap-1.5 w-20">
              <span className={`size-1.5 rounded-full shrink-0 ${
                tx.status === 'success' ? 'bg-green-500' :
                tx.status === 'failover' ? 'bg-amber-500' : 'bg-red-500'
              }`} />
              <span className={`text-xs ${
                tx.status === 'success' ? 'text-green-600 dark:text-green-400' :
                tx.status === 'failover' ? 'text-amber-600 dark:text-amber-400' :
                'text-red-600 dark:text-red-400'
              }`}>
                {tx.status === 'success' ? 'OK' : tx.status === 'failover' ? 'Retried' : tx.status === 'failed' ? 'Failed' : 'Pending'}
              </span>
            </span>
          </div>
        ))}
      </Card>
    </div>
  )
}
