import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Alwon Console',
  description: 'Retail Automation OS — Operator Console',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full`}
      style={{ colorScheme: 'dark' }}
    >
      <body suppressHydrationWarning className="h-full antialiased" style={{ background: 'var(--bg)', color: 'var(--fg)' }}>
        {children}
      </body>
    </html>
  )
}
