'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

function AlwonLogo() {
  return (
    <div className="flex items-center gap-3">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <polygon
          points="12,2 22,20 2,20"
          stroke="var(--accent)"
          strokeWidth="1.5"
          fill="none"
          strokeLinejoin="round"
        />
        <line x1="12" y1="8" x2="12" y2="15" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="12" cy="17.5" r="0.75" fill="var(--accent)" />
      </svg>
      <span
        className="font-semibold text-base"
        style={{ color: 'var(--fg)', letterSpacing: '0.15em' }}
      >
        ALWON
      </span>
    </div>
  )
}

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    router.push('/dashboard')
  }

  return (
    <div
      className="grid-bg min-h-screen flex items-center justify-center px-4"
      style={{ background: 'var(--bg)' }}
    >
      <div
        className="w-full max-w-sm"
        style={{
          background: 'var(--bg-panel)',
          border: '1px solid var(--border-strong)',
          padding: '2.5rem',
        }}
      >
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <AlwonLogo />
        </div>

        {/* Title */}
        <h1
          className="text-xl font-semibold mb-1 text-center"
          style={{ color: 'var(--fg)' }}
        >
          Sign in to <em>Alwon Console</em>
        </h1>
        <p
          className="text-center text-sm mb-8"
          style={{ color: 'var(--fg-muted)' }}
        >
          Retail Automation OS
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="section-label">EMAIL ADDRESS</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="operator@alwon.io"
              className="w-full px-3 py-2 text-sm rounded-sm outline-none transition-colors"
              style={{
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-strong)',
                color: 'var(--fg)',
              }}
              onFocus={(e) => { e.target.style.borderColor = 'var(--border-accent)' }}
              onBlur={(e) => { e.target.style.borderColor = 'var(--border-strong)' }}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="section-label">PASSWORD</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2 text-sm rounded-sm outline-none transition-colors"
              style={{
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-strong)',
                color: 'var(--fg)',
              }}
              onFocus={(e) => { e.target.style.borderColor = 'var(--border-accent)' }}
              onBlur={(e) => { e.target.style.borderColor = 'var(--border-strong)' }}
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 data-mono text-sm font-medium tracking-widest transition-colors mt-1"
            style={{
              background: 'var(--accent)',
              color: '#fff',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--accent-hover)' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--accent)' }}
          >
            CONTINUE →
          </button>
        </form>

        <div className="flex flex-col gap-3 mt-5">
          <button
            type="button"
            className="w-full py-2 data-mono text-xs tracking-widest transition-colors"
            style={{
              border: '1px solid var(--border-strong)',
              color: 'var(--fg-muted)',
              background: 'transparent',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--border-accent)' }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-strong)' }}
          >
            CONTINUE WITH SSO
          </button>

          <div className="text-center">
            <button
              type="button"
              className="text-xs"
              style={{ color: 'var(--fg-dim)' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--accent)' }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--fg-dim)' }}
            >
              Reset password
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
