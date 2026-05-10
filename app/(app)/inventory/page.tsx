'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { format } from 'date-fns'
import { Grid, List, AlertTriangle } from 'lucide-react'
import { SectionHeader } from '@/components/section-header'
import { generateSKUs } from '@/lib/mock-data'
import type { SKU } from '@/lib/types'

const SKUS = generateSKUs()
const SHELVES = Array.from(new Set(SKUS.map((s) => s.shelf))).sort()

const RISK_COLORS: Record<string, string> = {
  low: 'var(--success)',
  medium: 'var(--warning)',
  high: 'var(--danger)',
  critical: 'var(--danger)',
}

function StockBar({ current, max }: { current: number; max: number }) {
  const pct = max > 0 ? current / max : 0
  const color = pct < 0.1 ? 'var(--danger)' : pct < 0.3 ? 'var(--warning)' : 'var(--success)'
  return (
    <div className="flex items-center gap-2">
      <div
        className="flex-1 rounded-full overflow-hidden"
        style={{ height: 4, background: 'var(--bg-elevated)' }}
      >
        <div
          className="h-full transition-all rounded-full"
          style={{ width: `${pct * 100}%`, background: color }}
        />
      </div>
      <span className="data-mono text-xs shrink-0" style={{ color: 'var(--fg-dim)', minWidth: 40 }}>
        {current}/{max}
      </span>
    </div>
  )
}

function ShelfCard({ shelf, skus }: { shelf: string; skus: SKU[] }) {
  const total = skus.reduce((s, sk) => s + sk.currentStock, 0)
  const maxTotal = skus.reduce((s, sk) => s + sk.maxStock, 0)
  const pct = maxTotal > 0 ? total / maxTotal : 0
  const color = pct < 0.1 ? 'var(--danger)' : pct < 0.3 ? 'var(--warning)' : 'var(--success)'
  const [hovered, setHovered] = useState(false)

  return (
    <div
      className="relative flex flex-col p-3 transition-colors cursor-pointer"
      style={{
        border: '1px solid var(--border)',
        background: hovered ? 'var(--bg-hover)' : 'var(--bg-panel)',
        minHeight: 80,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <p className="text-sm font-medium mb-2" style={{ color: 'var(--fg)' }}>{shelf}</p>
      <div className="flex items-center gap-2 mb-2">
        <div
          className="flex-1 rounded-full overflow-hidden"
          style={{ height: 6, background: 'var(--bg-elevated)' }}
        >
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${pct * 100}%`, background: color }}
          />
        </div>
        <span className="text-xs shrink-0" style={{ color: 'var(--fg-muted)' }}>
          {total}/{maxTotal}
        </span>
      </div>
      <p className="text-xs" style={{ color: 'var(--fg-muted)' }}>{skus.length} {skus.length === 1 ? 'product' : 'products'}</p>

      {hovered && (
        <div
          className="absolute left-0 right-0 bottom-full z-10 p-3 mb-1"
          style={{ borderRadius: 'var(--radius)', background: 'var(--bg-elevated)', border: '1px solid var(--border-strong)' }}
        >
          <p className="text-xs mb-2" style={{ color: 'var(--fg-muted)' }}>Items on this shelf</p>
          {skus.slice(0, 4).map((sku) => (
            <div key={sku.id} className="flex justify-between text-xs py-0.5" style={{ color: 'var(--fg-muted)' }}>
              <span className="data-mono truncate flex-1">{sku.id}</span>
              <span className="data-mono ml-2" style={{ color: sku.currentStock < 2 ? 'var(--danger)' : 'var(--fg-dim)' }}>
                {sku.currentStock}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function GridView() {
  const shelfGroups = useMemo(() => {
    const groups: Record<string, SKU[]> = {}
    for (const sku of SKUS) {
      if (!groups[sku.shelf]) groups[sku.shelf] = []
      groups[sku.shelf].push(sku)
    }
    return groups
  }, [])

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
      {SHELVES.map((shelf) => (
        <ShelfCard key={shelf} shelf={shelf} skus={shelfGroups[shelf] ?? []} />
      ))}
    </div>
  )
}

function TableView({ skus, search }: { skus: SKU[]; search: string }) {
  const [sortBy, setSortBy] = useState<keyof SKU>('oosRisk')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return skus
      .filter((s) => !q || s.id.toLowerCase().includes(q) || s.name.toLowerCase().includes(q) || s.shelf.toLowerCase().includes(q))
      .sort((a, b) => {
        const riskOrder = { critical: 4, high: 3, medium: 2, low: 1 }
        if (sortBy === 'oosRisk') {
          const diff = (riskOrder[a.oosRisk] ?? 0) - (riskOrder[b.oosRisk] ?? 0)
          return sortDir === 'desc' ? -diff : diff
        }
        const av = a[sortBy]
        const bv = b[sortBy]
        if (typeof av === 'number' && typeof bv === 'number') {
          return sortDir === 'desc' ? bv - av : av - bv
        }
        return sortDir === 'desc' ? String(bv).localeCompare(String(av)) : String(av).localeCompare(String(bv))
      })
  }, [skus, search, sortBy, sortDir])

  const handleSort = (col: keyof SKU) => {
    if (sortBy === col) setSortDir((d) => d === 'asc' ? 'desc' : 'asc')
    else { setSortBy(col); setSortDir('desc') }
  }

  const SortHeader = ({ col, label, width }: { col: keyof SKU; label: string; width?: string }) => (
    <th
      className="px-4 py-2.5 text-left cursor-pointer select-none text-xs"
      style={{ width, color: 'var(--fg-muted)', fontWeight: 500 }}
      onClick={() => handleSort(col)}
    >
      {label} {sortBy === col ? (sortDir === 'desc' ? '↓' : '↑') : ''}
    </th>
  )

  return (
    <div style={{ borderRadius: 'var(--radius)', border: '1px solid var(--border)', background: 'var(--bg-panel)', overflow: 'hidden' }}>
      <table className="w-full text-sm">
        <thead>
          <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg)' }}>
            <SortHeader col="id" label="Code" width="100px" />
            <SortHeader col="name" label="Product" />
            <SortHeader col="currentStock" label="Stock" width="160px" />
            <SortHeader col="shelf" label="Shelf" width="100px" />
            <SortHeader col="lastRestock" label="Last restocked" width="140px" />
            <SortHeader col="velocity" label="Sells per hour" width="120px" />
            <SortHeader col="oosRisk" label="Status" width="120px" />
          </tr>
        </thead>
        <tbody>
          {filtered.map((sku) => (
            <tr
              key={sku.id}
              style={{ borderBottom: '1px solid var(--border)', height: 44 }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-hover)' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
            >
              <td className="px-4">
                <Link href={`/inventory/${sku.id}`} className="data-mono text-xs" style={{ color: 'var(--brand-accent)' }}>
                  {sku.id}
                </Link>
              </td>
              <td className="px-4" style={{ color: 'var(--fg)' }}>{sku.name}</td>
              <td className="px-4">
                <StockBar current={sku.currentStock} max={sku.maxStock} />
              </td>
              <td className="px-4" style={{ color: 'var(--fg-muted)' }}>{sku.shelf}</td>
              <td className="px-4 text-xs" style={{ color: 'var(--fg-muted)' }}>
                {format(sku.lastRestock, 'MMM d, h:mm a')}
              </td>
              <td className="px-4" style={{ color: 'var(--fg-muted)' }}>{sku.velocity}</td>
              <td className="px-4">
                <span className="flex items-center gap-1.5">
                  <span style={{ fontSize: 8, color: RISK_COLORS[sku.oosRisk] }}>●</span>
                  <span className="text-xs" style={{ color: RISK_COLORS[sku.oosRisk], textTransform: 'capitalize' }}>
                    {sku.oosRisk === 'low' ? 'Healthy' : sku.oosRisk === 'medium' ? 'Watch' : sku.oosRisk === 'high' ? 'Low' : 'Critical'}
                  </span>
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function InventoryPage() {
  const [view, setView] = useState<'grid' | 'table'>('table')
  const [search, setSearch] = useState('')

  const criticalCount = SKUS.filter((s) => s.oosRisk === 'critical' || s.oosRisk === 'high').length

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold" style={{ color: 'var(--fg)' }}>
            Stock
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--fg-muted)' }}>
            Tracking {SKUS.length} products · {criticalCount} {criticalCount === 1 ? 'is' : 'are'} running low
          </p>
        </div>
        <div className="flex items-center gap-3">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search SKU, name, shelf..."
            className="px-3 py-1.5 text-xs rounded-sm outline-none"
            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-strong)', color: 'var(--fg)' }}
            onFocus={(e) => { e.target.style.borderColor = 'var(--border-accent)' }}
            onBlur={(e) => { e.target.style.borderColor = 'var(--border-strong)' }}
          />
          <div className="flex" style={{ border: '1px solid var(--border-strong)' }}>
            {(['grid', 'table'] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className="px-3 py-1.5 transition-colors"
                style={{
                  background: view === v ? 'var(--bg-hover)' : 'transparent',
                  color: view === v ? 'var(--fg)' : 'var(--fg-dim)',
                  borderRight: v === 'grid' ? '1px solid var(--border-strong)' : undefined,
                }}
              >
                {v === 'grid' ? <Grid size={14} /> : <List size={14} />}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Alerts rail */}
      {criticalCount > 0 && (
        <div
          className="flex flex-col gap-2 p-4"
          style={{ borderRadius: 'var(--radius)', border: '1px solid rgba(248,113,113,0.3)', background: 'rgba(248,113,113,0.05)' }}
        >
          <div className="flex items-center gap-2">
            <AlertTriangle size={14} style={{ color: 'var(--danger)' }} />
            <span className="text-sm font-medium" style={{ color: 'var(--danger)' }}>About to run out</span>
          </div>
          <div className="flex flex-col gap-1">
            {SKUS.filter((s) => s.oosRisk === 'critical').slice(0, 3).map((sku) => (
              <p key={sku.id} className="text-sm" style={{ color: 'var(--fg-muted)' }}>
                <span style={{ color: 'var(--fg)', fontWeight: 500 }}>{sku.name}</span> ({sku.id}) will run out in{' '}
                <span style={{ color: 'var(--danger)' }}>
                  about {Math.round((sku.currentStock / (sku.velocity || 1)) * 60)} min
                </span>{' '}
                — on {sku.shelf}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Main view */}
      <SectionHeader
        title={view === 'grid' ? 'Shelves' : 'All products'}
        description={view === 'grid' ? 'Where things are and how full the shelves are' : 'Search, sort, and check stock levels'}
      />
      {view === 'grid' ? <GridView /> : <TableView skus={SKUS} search={search} />}
    </div>
  )
}
