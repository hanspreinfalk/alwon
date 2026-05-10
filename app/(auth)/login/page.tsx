'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

function AlwonLogo() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 ring-1 ring-blue-500/25 dark:bg-blue-400/10 dark:ring-blue-400/25">
        <span
          className="select-none text-2xl font-bold leading-none tracking-tight text-blue-600 dark:text-blue-400"
          aria-hidden="true"
        >
          A
        </span>
      </div>
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
          borderRadius: 'var(--radius)',
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
          Welcome to Alwon
        </h1>
        <p
          className="text-center text-sm mb-8"
          style={{ color: 'var(--fg-muted)' }}
        >
          Sign in to manage your stores
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm" style={{ color: 'var(--fg)', fontWeight: 500 }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@yourcompany.com"
              className="w-full px-3 py-2 text-sm rounded-md outline-none transition-colors"
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
            <label className="text-sm" style={{ color: 'var(--fg)', fontWeight: 500 }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2 text-sm rounded-md outline-none transition-colors"
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
            className="w-full py-2.5 text-sm font-medium transition-colors mt-1 rounded-md"
            style={{
              background: 'var(--brand-accent)',
              color: '#fff',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--brand-accent-hover)' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--brand-accent)' }}
          >
            Sign in
          </button>
        </form>

        <div className="flex flex-col gap-3 mt-5">
          <button
            type="button"
            className="w-full py-2 text-sm transition-colors rounded-md"
            style={{
              border: '1px solid var(--border-strong)',
              color: 'var(--fg-muted)',
              background: 'transparent',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--border-accent)' }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-strong)' }}
          >
            Continue with single sign-on
          </button>

          <div className="text-center">
            <button
              type="button"
              className="text-xs"
              style={{ color: 'var(--fg-dim)' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--brand-accent)' }}
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
