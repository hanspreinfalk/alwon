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
        stroke="var(--brand-accent)"
        strokeWidth={1.5}
        strokeLinejoin="round"
        strokeLinecap="round"
        opacity={0.7}
      />
    </svg>
  )
}

// "EVENTS PROCESSED" → "Events processed"
function softenLabel(label: string): string {
  if (label !== label.toUpperCase()) return label
  return label.charAt(0) + label.slice(1).toLowerCase()
}

export function MetricTile({ label, value, delta, secondary, sparkline, onClick }: MetricTileProps) {
  const isPositive = (delta ?? 0) >= 0

  return (
    <div
      onClick={onClick}
      className={`flex flex-col gap-1.5 p-5 border-r last:border-r-0 ${onClick ? 'cursor-pointer hover:bg-[var(--bg-hover)] transition-colors' : ''}`}
      style={{ borderColor: 'var(--border)' }}
    >
      <p className="text-xs" style={{ color: 'var(--fg-muted)' }}>{softenLabel(label)}</p>
      <div className="flex items-end justify-between gap-2 mt-0.5">
        <span
          className="font-semibold leading-none"
          style={{ fontSize: '1.625rem', color: 'var(--fg)', fontVariantNumeric: 'tabular-nums' }}
        >
          {value}
        </span>
        {sparkline && <Sparkline data={sparkline} />}
      </div>
      <div className="flex items-center gap-2 mt-0.5">
        {delta !== undefined && (
          <span
            className="flex items-center gap-0.5 text-xs"
            style={{ color: isPositive ? 'var(--success)' : 'var(--danger)', fontVariantNumeric: 'tabular-nums' }}
          >
            {isPositive ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
            {isPositive ? '+' : ''}{delta}%
          </span>
        )}
        {secondary && (
          <span className="text-xs" style={{ color: 'var(--fg-muted)' }}>
            {secondary}
          </span>
        )}
      </div>
    </div>
  )
}
