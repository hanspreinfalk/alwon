'use client'

import { ChevronDown } from 'lucide-react'
import { STORE_IDS } from '@/lib/mock-data'
import { useStoreSelection } from '@/lib/store'

export function StoreSelector({ compact = false }: { compact?: boolean }) {
  const { selectedStore, setStore } = useStoreSelection()

  return (
    <div className="relative">
      <select
        value={selectedStore}
        onChange={(e) => setStore(e.target.value)}
        className="appearance-none text-sm pr-7 pl-3 py-1.5 rounded-md cursor-pointer"
        style={{
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border-strong)',
          color: 'var(--fg)',
        }}
      >
        {STORE_IDS.map((id) => (
          <option key={id} value={id}>
            {id}
          </option>
        ))}
      </select>
      <ChevronDown
        size={12}
        className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none"
        style={{ color: 'var(--fg-muted)' }}
      />
    </div>
  )
}
