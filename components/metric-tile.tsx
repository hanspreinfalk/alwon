import type { ReactNode } from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface MetricTileProps {
  label: string
  value: string | number
  delta?: number
  deltaLabel?: string
  secondary?: string
  sparkline?: number[]
  onClick?: () => void
}

function Sparkline({ data }: { data: number[] }) {
  if (!data.length) return null
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  const w = 64
  const h = 24
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w
    const y = h - ((v - min) / range) * h
    return `${x},${y}`
  })
  return (
    <svg width={w} height={h} className="overflow-visible">
      <polyline
        points={pts.join(' ')}
        fill="none"
        stroke="var(--accent)"
        strokeWidth={1.5}
        strokeLinejoin="round"
        strokeLinecap="round"
        opacity={0.7}
      />
    </svg>
  )
}

export function MetricTile({ label, value, delta, deltaLabel, secondary, sparkline, onClick }: MetricTileProps) {
  const isPositive = (delta ?? 0) >= 0

  return (
    <div
      onClick={onClick}
      className={`flex flex-col gap-1 p-4 border-r last:border-r-0 ${onClick ? 'cursor-pointer hover:bg-[var(--bg-hover)] transition-colors' : ''}`}
      style={{ borderColor: 'var(--border)' }}
    >
      <p className="section-label">{label}</p>
      <div className="flex items-end justify-between gap-2 mt-1">
        <span
          className="data-mono font-semibold leading-none"
          style={{ fontSize: '1.5rem', color: 'var(--fg)' }}
        >
          {value}
        </span>
        {sparkline && <Sparkline data={sparkline} />}
      </div>
      <div className="flex items-center gap-2 mt-0.5">
        {delta !== undefined && (
          <span
            className="flex items-center gap-0.5 data-mono text-xs"
            style={{ color: isPositive ? 'var(--success)' : 'var(--danger)' }}
          >
            {isPositive ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
            {isPositive ? '+' : ''}{delta}%
          </span>
        )}
        {secondary && (
          <span className="data-mono text-xs" style={{ color: 'var(--fg-muted)' }}>
            {secondary}
          </span>
        )}
      </div>
    </div>
  )
}
