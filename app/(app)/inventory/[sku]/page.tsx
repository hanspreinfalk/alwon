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
      <Link href="/inventory" className="flex items-center gap-2 data-mono text-xs self-start" style={{ color: 'var(--fg-dim)' }}>
        <ArrowLeft size={12} /> BACK TO INVENTORY
      </Link>

      <div>
        <h1 className="text-2xl font-semibold" style={{ color: 'var(--fg)' }}>
          {sku.id} — <em>{sku.name}</em>
        </h1>
        <p className="data-mono text-xs mt-1" style={{ color: 'var(--fg-dim)' }}>{sku.shelf} · {sku.category}</p>
      </div>

      <div
        className="grid grid-cols-2 sm:grid-cols-4"
        style={{ border: '1px solid var(--border)', background: 'var(--bg-panel)' }}
      >
        {[
          { label: 'CURRENT STOCK', value: `${sku.currentStock} / ${sku.maxStock}`, color },
          { label: 'VELOCITY', value: `${sku.velocity}/h`, color: 'var(--fg)' },
          { label: 'OOS RISK', value: sku.oosRisk.toUpperCase(), color: color },
          { label: 'PRICE', value: `$${sku.price.toFixed(2)}`, color: 'var(--fg)' },
        ].map((m, i, arr) => (
          <div
            key={m.label}
            className="p-4"
            style={{ borderRight: i < arr.length - 1 ? '1px solid var(--border)' : undefined }}
          >
            <p className="section-label mb-1">{m.label}</p>
            <p className="data-mono font-semibold text-xl" style={{ color: m.color }}>{m.value}</p>
          </div>
        ))}
      </div>

      <div style={{ border: '1px solid var(--border)', background: 'var(--bg-panel)' }}>
        <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
          <p className="section-label">SKU DETAILS</p>
        </div>
        <table className="w-full text-xs">
          <tbody>
            {[
              ['SKU ID', sku.id],
              ['NAME', sku.name],
              ['SHELF', sku.shelf],
              ['CATEGORY', sku.category],
              ['STOCK', `${sku.currentStock} / ${sku.maxStock} units`],
              ['VELOCITY', `${sku.velocity} units/hour`],
              ['LAST RESTOCK', format(sku.lastRestock, 'MMM d yyyy HH:mm')],
              ['OOS RISK', sku.oosRisk],
              ['UNIT PRICE', `$${sku.price.toFixed(2)}`],
            ].map(([key, value]) => (
              <tr key={key} style={{ borderBottom: '1px solid var(--border)' }}>
                <td className="section-label px-4 py-2.5 w-40">{key}</td>
                <td className="data-mono px-4 py-2.5" style={{ color: 'var(--fg)' }}>{value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
