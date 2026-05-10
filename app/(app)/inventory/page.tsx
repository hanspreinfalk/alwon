'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { format } from 'date-fns'
import { Grid, List, AlertTriangle } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { SectionHeader } from '@/components/section-header'
import { generateSKUs } from '@/lib/mock-data'
import type { SKU } from '@/lib/types'

const SKUS = generateSKUs()
const SHELVES = Array.from(new Set(SKUS.map((s) => s.shelf))).sort()

const RISK_COLORS: Record<string, string> = {
  low: 'text-green-600 dark:text-green-400',
  medium: 'text-amber-600 dark:text-amber-400',
  high: 'text-red-600 dark:text-red-400',
  critical: 'text-red-600 dark:text-red-400',
}

const RISK_DOT: Record<string, string> = {
  low: 'bg-green-500',
  medium: 'bg-amber-500',
  high: 'bg-red-500',
  critical: 'bg-red-500',
}

function StockBar({ current, max }: { current: number; max: number }) {
  const pct = max > 0 ? current / max : 0
  const color = pct < 0.1 ? 'bg-red-500' : pct < 0.3 ? 'bg-amber-500' : 'bg-green-500'
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 rounded-full overflow-hidden bg-muted" style={{ height: 4 }}>
        <div className={`h-full transition-all rounded-full ${color}`} style={{ width: `${pct * 100}%` }} />
      </div>
      <span className="font-mono text-xs shrink-0 text-muted-foreground tabular-nums" style={{ minWidth: 40 }}>
        {current}/{max}
      </span>
    </div>
  )
}

function ShelfCard({ shelf, skus }: { shelf: string; skus: SKU[] }) {
  const total = skus.reduce((s, sk) => s + sk.currentStock, 0)
  const maxTotal = skus.reduce((s, sk) => s + sk.maxStock, 0)
  const pct = maxTotal > 0 ? total / maxTotal : 0
  const color = pct < 0.1 ? 'bg-red-500' : pct < 0.3 ? 'bg-amber-500' : 'bg-green-500'

  return (
    <div className="relative flex flex-col p-3 rounded-lg border bg-card hover:bg-muted/40 transition-colors cursor-pointer group">
      <p className="text-sm font-medium mb-2">{shelf}</p>
      <div className="flex items-center gap-2 mb-2">
        <div className="flex-1 rounded-full overflow-hidden bg-muted" style={{ height: 6 }}>
          <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct * 100}%` }} />
        </div>
        <span className="text-xs shrink-0 text-muted-foreground">
          {total}/{maxTotal}
        </span>
      </div>
      <p className="text-xs text-muted-foreground">{skus.length} {skus.length === 1 ? 'product' : 'products'}</p>

      <div className="absolute left-0 right-0 bottom-full z-10 p-3 mb-1 rounded-lg border bg-popover shadow-md hidden group-hover:block">
        <p className="text-xs text-muted-foreground mb-2">Items on this shelf</p>
        {skus.slice(0, 4).map((sku) => (
          <div key={sku.id} className="flex justify-between text-xs py-0.5">
            <span className="font-mono truncate flex-1 text-muted-foreground">{sku.id}</span>
            <span className={`font-mono ml-2 ${sku.currentStock < 2 ? 'text-red-600 dark:text-red-400' : 'text-muted-foreground'}`}>
              {sku.currentStock}
            </span>
          </div>
        ))}
      </div>
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
      className="px-4 py-2.5 text-left cursor-pointer select-none text-xs text-muted-foreground font-medium"
      style={{ width }}
      onClick={() => handleSort(col)}
    >
      {label} {sortBy === col ? (sortDir === 'desc' ? '↓' : '↑') : ''}
    </th>
  )

  return (
    <Card className="p-0 gap-0 overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/50">
            <SortHeader col="id" label="Code" width="100px" />
            <SortHeader col="name" label="Product" />
            <SortHeader col="currentStock" label="Stock" width="160px" />
            <SortHeader col="shelf" label="Shelf" width="100px" />
            <SortHeader col="lastRestock" label="Last restocked" width="140px" />
            <SortHeader col="velocity" label="Sells / hr" width="120px" />
            <SortHeader col="oosRisk" label="Status" width="120px" />
          </tr>
        </thead>
        <tbody>
          {filtered.map((sku) => (
            <tr
              key={sku.id}
              className="border-b hover:bg-muted/40 transition-colors"
              style={{ height: 44 }}
            >
              <td className="px-4">
                <Link href={`/inventory/${sku.id}`} className="font-mono text-xs font-medium hover:underline">
                  {sku.id}
                </Link>
              </td>
              <td className="px-4 text-sm">{sku.name}</td>
              <td className="px-4">
                <StockBar current={sku.currentStock} max={sku.maxStock} />
              </td>
              <td className="px-4 text-xs text-muted-foreground">{sku.shelf}</td>
              <td className="px-4 text-xs text-muted-foreground">
                {format(sku.lastRestock, 'MMM d, h:mm a')}
              </td>
              <td className="px-4 text-sm text-muted-foreground">{sku.velocity}</td>
              <td className="px-4">
                <span className="flex items-center gap-1.5">
                  <span className={`size-1.5 rounded-full shrink-0 ${RISK_DOT[sku.oosRisk]}`} />
                  <span className={`text-xs ${RISK_COLORS[sku.oosRisk]}`}>
                    {sku.oosRisk === 'low' ? 'Healthy' : sku.oosRisk === 'medium' ? 'Watch' : sku.oosRisk === 'high' ? 'Low' : 'Critical'}
                  </span>
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  )
}

export default function InventoryPage() {
  const [view, setView] = useState<'grid' | 'table'>('grid')
  const [search, setSearch] = useState('')

  const criticalCount = SKUS.filter((s) => s.oosRisk === 'critical' || s.oosRisk === 'high').length

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-[18px] font-semibold tracking-tight">Stock</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Tracking {SKUS.length} products · {criticalCount} {criticalCount === 1 ? 'is' : 'are'} running low
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search SKU, name, shelf…"
            className="h-8 w-56 text-xs"
          />
          <div className="flex rounded-lg border overflow-hidden">
            {(['grid', 'table'] as const).map((v) => (
              <Button
                key={v}
                variant="ghost"
                size="sm"
                onClick={() => setView(v)}
                className={`h-8 px-2.5 rounded-none ${view === v ? 'bg-muted text-foreground' : 'text-muted-foreground'}`}
              >
                {v === 'grid' ? <Grid className="size-3.5" /> : <List className="size-3.5" />}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Alerts rail */}
      {criticalCount > 0 && (
        <Card className="p-0 gap-0 border-red-200 dark:border-red-900 bg-red-50/50 dark:bg-red-950/20 overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-red-200 dark:border-red-900">
            <AlertTriangle className="size-4 text-red-600 dark:text-red-400" />
            <span className="text-sm font-semibold text-red-600 dark:text-red-400">About to run out</span>
          </div>
          <div className="flex flex-col gap-1.5 px-4 py-3">
            {SKUS.filter((s) => s.oosRisk === 'critical').slice(0, 3).map((sku) => (
              <p key={sku.id} className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">{sku.name}</span>{' '}
                <Badge variant="outline" className="font-mono text-[10px] h-4 px-1 align-middle">{sku.id}</Badge>{' '}
                will run out in{' '}
                <span className="text-red-600 dark:text-red-400 font-medium">
                  ~{Math.round((sku.currentStock / (sku.velocity || 1)) * 60)} min
                </span>{' '}
                — on {sku.shelf}
              </p>
            ))}
          </div>
        </Card>
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
