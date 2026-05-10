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
    <div className="hidden sm:flex items-center gap-2">
      <LiveIndicator />
      <span className="text-xs" style={{ color: 'var(--fg-muted)' }}>
        Live
      </span>
      <span className="data-mono text-xs" style={{ color: 'var(--fg-muted)' }}>
        {now ? format(now, 'HH:mm') : '--:--'}
      </span>
    </div>
  )
}
