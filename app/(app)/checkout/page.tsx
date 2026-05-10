'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
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
        <h1 className="text-[18px] font-semibold tracking-tight">Checkout</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          See how customers are paying right now.
        </p>
      </div>

      {/* Metric tiles — p-4 matching home page stat tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-3 rounded-xl overflow-hidden ring-1 ring-foreground/10">
        {[
          { label: 'Walk-outs', value: walkouts, sub: 'no checkout needed' },
          { label: 'Self-checkout', value: kiosks, sub: 'used a kiosk' },
          { label: 'Assisted', value: assisted, sub: 'helped by staff' },
        ].map((tile, i, arr) => (
          <div
            key={tile.label}
            className={`flex flex-col gap-1 p-4 bg-card ${i < arr.length - 1 ? 'border-r' : ''}`}
          >
            <p className="text-xs text-muted-foreground font-medium">{tile.label}</p>
            <p className="text-[1.625rem] font-semibold tabular-nums leading-tight">
              {tile.value.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground">{tile.sub}</p>
          </div>
        ))}
      </div>

      {/* Flow visualization */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold">How customers are checking out</CardTitle>
          <CardDescription>Where shoppers go when they&apos;re ready to leave</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center gap-8 py-2 px-2 flex-wrap">
            {/* Entry */}
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center justify-center rounded-lg border bg-muted size-16">
                <span className="font-mono text-xs text-center text-muted-foreground">ENTRY</span>
              </div>
              <p className="font-mono text-xs text-muted-foreground">{total} sessions</p>
            </div>

            <div className="flex-1 border-t min-w-8" />

            {/* Routes */}
            <div className="flex flex-col gap-3">
              {[
                {
                  label: 'Walked out',
                  count: routeCounts['walk-out'],
                  className: 'border-foreground/30 bg-foreground/5',
                  textClass: 'text-foreground',
                },
                {
                  label: 'Self-checkout',
                  count: routeCounts['kiosk'],
                  className: 'border-green-300 bg-green-500/5 dark:border-green-800',
                  textClass: 'text-green-600 dark:text-green-400',
                },
                {
                  label: 'Assisted by staff',
                  count: routeCounts['assisted'],
                  className: 'border-amber-300 bg-amber-500/5 dark:border-amber-800',
                  textClass: 'text-amber-600 dark:text-amber-400',
                },
              ].map((route) => (
                <div key={route.label} className="flex items-center gap-3">
                  <div className="border-t w-8 border-border" />
                  <div className={`px-3 py-2 rounded-lg border min-w-40 ${route.className}`}>
                    <p className={`text-sm font-medium ${route.textClass}`}>{route.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {route.count} customers · {total > 0 ? Math.round(route.count / total * 100) : 0}%
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex-1 border-t min-w-8" />

            {/* Exit */}
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center justify-center rounded-lg border bg-muted size-16">
                <span className="font-mono text-xs text-center text-muted-foreground">EXIT</span>
              </div>
              <p className="font-mono text-xs text-muted-foreground">
                {sessions.filter((s) => s.status === 'completed').length} complete
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Session table */}
      <Card className="p-0 gap-0 overflow-hidden">
        <CardHeader className="px-4 py-3 border-b">
          <CardTitle className="text-sm font-semibold">Customers in the store now</CardTitle>
          <CardDescription>Live sessions and how they&apos;re checking out</CardDescription>
        </CardHeader>
        <div className="flex items-center gap-3 px-4 py-2.5 border-b bg-muted/50">
          <span className="text-xs text-muted-foreground font-medium w-24">Customer</span>
          <span className="text-xs text-muted-foreground font-medium w-20">Entered</span>
          <span className="text-xs text-muted-foreground font-medium w-24">Method</span>
          <span className="text-xs text-muted-foreground font-medium w-20">Confidence</span>
          <span className="text-xs text-muted-foreground font-medium flex-1">Status</span>
          <span className="text-xs text-muted-foreground font-medium w-20 text-right">Value</span>
        </div>
        {sessions.slice(0, 15).map((session) => (
          <div
            key={session.id}
            className="flex items-center gap-3 px-4 border-b hover:bg-muted/40 transition-colors"
            style={{ height: 44 }}
          >
            <span className="font-mono text-xs w-24 font-medium">{session.id}</span>
            <span className="text-xs w-20 text-muted-foreground">
              {format(session.entryTime, 'HH:mm')}
            </span>
            <span className="text-xs w-24 text-muted-foreground">
              {session.route === 'walk-out' ? 'Walked out' : session.route === 'kiosk' ? 'Kiosk' : 'Assisted'}
            </span>
            <span className="text-xs w-20 text-muted-foreground tabular-nums">
              {Math.round(session.confidence * 100)}%
            </span>
            <span className="flex items-center gap-1.5 flex-1">
              <span className={`size-1.5 rounded-full shrink-0 ${
                session.status === 'completed' ? 'bg-green-500' :
                session.status === 'in-progress' ? 'bg-foreground' : 'bg-muted-foreground'
              }`} />
              <span className="text-xs text-muted-foreground">
                {session.status === 'in-progress' ? 'In progress' : session.status === 'completed' ? 'Done' : 'Left'}
              </span>
            </span>
            <span className="text-xs w-20 text-right text-muted-foreground tabular-nums">
              ${session.estimatedValue.toFixed(2)}
            </span>
          </div>
        ))}
      </Card>
    </div>
  )
}
