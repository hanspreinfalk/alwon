'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { LiveIndicator } from './live-indicator'

export function LiveClock() {
  const [now, setNow] = useState<Date | null>(null)

  useEffect(() => {
    setNow(new Date())
    const interval = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex items-center gap-2">
      <LiveIndicator />
      <span className="data-mono text-xs" style={{ color: 'var(--fg-muted)' }}>
        LIVE ·{' '}
        <span style={{ color: 'var(--fg)' }}>
          {now ? format(now, 'HH:mm:ss') : '--:--:--'}
        </span>
      </span>
    </div>
  )
}
