'use client'

import { use } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { format } from 'date-fns'
import { generateSKUs } from '@/lib/mock-data'

const SKUS = generateSKUs()

export default function SKUDetailPage({ params }: { params: Promise<{ sku: string }> }) {
  const { sku: skuId } = use(params)
  const sku = SKUS.find((s) => s.id === decodeURIComponent(skuId)) ?? SKUS[0]
  const pct = sku.maxStock > 0 ? sku.currentStock / sku.maxStock : 0
  const color = pct < 0.1 ? 'var(--danger)' : pct < 0.3 ? 'var(--warning)' : 'var(--success)'

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <Link href="/inventory" className="flex items-center gap-2 text-sm self-start" style={{ color: 'var(--fg-muted)' }}>
        <ArrowLeft size={14} /> Back to stock
      </Link>

      <div>
        <h1 className="text-2xl font-semibold" style={{ color: 'var(--fg)' }}>
          {sku.name}
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--fg-muted)' }}>
          <span className="data-mono">{sku.id}</span> · on {sku.shelf} · {sku.category}
        </p>
      </div>

      <div
        className="grid grid-cols-2 sm:grid-cols-4"
        style={{ borderRadius: 'var(--radius)', border: '1px solid var(--border)', background: 'var(--bg-panel)' }}
      >
        {[
          { label: 'In stock', value: `${sku.currentStock} of ${sku.maxStock}`, color },
          { label: 'Sells per hour', value: `${sku.velocity}`, color: 'var(--fg)' },
          { label: 'Stock status', value: sku.oosRisk === 'low' ? 'Healthy' : sku.oosRisk === 'medium' ? 'Watch' : sku.oosRisk === 'high' ? 'Low' : 'Critical', color: color },
          { label: 'Price', value: `$${sku.price.toFixed(2)}`, color: 'var(--fg)' },
        ].map((m, i, arr) => (
          <div
            key={m.label}
            className="p-5"
            style={{ borderRight: i < arr.length - 1 ? '1px solid var(--border)' : undefined }}
          >
            <p className="text-xs mb-1" style={{ color: 'var(--fg-muted)' }}>{m.label}</p>
            <p className="font-semibold" style={{ fontSize: '1.5rem', color: m.color, fontVariantNumeric: 'tabular-nums' }}>{m.value}</p>
          </div>
        ))}
      </div>

      <div style={{ borderRadius: 'var(--radius)', border: '1px solid var(--border)', background: 'var(--bg-panel)', overflow: 'hidden' }}>
        <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
          <p className="text-sm font-medium" style={{ color: 'var(--fg)' }}>Product details</p>
        </div>
        <table className="w-full text-sm">
          <tbody>
            {[
              ['Product code', sku.id],
              ['Name', sku.name],
              ['Shelf', sku.shelf],
              ['Category', sku.category],
              ['Stock', `${sku.currentStock} of ${sku.maxStock} on shelf`],
              ['Sells per hour', `${sku.velocity}`],
              ['Last restocked', format(sku.lastRestock, 'MMM d, yyyy · HH:mm')],
              ['Stock status', sku.oosRisk === 'low' ? 'Healthy' : sku.oosRisk === 'medium' ? 'Watch' : sku.oosRisk === 'high' ? 'Low' : 'Critical'],
              ['Price', `$${sku.price.toFixed(2)}`],
            ].map(([key, value]) => (
              <tr key={key} style={{ borderBottom: '1px solid var(--border)' }}>
                <td className="px-4 py-2.5 w-40 text-xs" style={{ color: 'var(--fg-muted)' }}>{key}</td>
                <td className="px-4 py-2.5" style={{ color: 'var(--fg)' }}>{value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
