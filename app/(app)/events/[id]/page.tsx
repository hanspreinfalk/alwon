'use client'

import { use } from 'react'
import Link from 'next/link'
import { ArrowLeft, Play, Flag, CheckCircle, MessageSquare } from 'lucide-react'
import { format, subMinutes } from 'date-fns'
import { toast } from 'sonner'
import { generateEvent } from '@/lib/mock-data'

const mockEvent = generateEvent(subMinutes(new Date(), 12))

export default function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const event = { ...mockEvent, id }

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      {/* Back */}
      <Link
        href="/events"
        className="flex items-center gap-2 data-mono text-xs self-start"
        style={{ color: 'var(--fg-dim)' }}
      >
        <ArrowLeft size={12} /> BACK TO EVENTS
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left */}
        <div className="flex flex-col gap-4">
          {/* Video */}
          <div style={{ border: '1px solid var(--border)', background: 'var(--bg-panel)' }}>
            <div
              className="relative"
              style={{ aspectRatio: '16/9', background: '#000' }}
            >
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                <div
                  className="flex items-center justify-center rounded-full cursor-pointer"
                  style={{ width: 52, height: 52, background: 'rgba(6,144,252,0.15)', border: '1px solid var(--border-accent)' }}
                >
                  <Play size={18} style={{ color: 'var(--accent)', marginLeft: 2 }} />
                </div>
                <p className="data-mono text-xs" style={{ color: 'var(--fg-dim)' }}>{event.source} · {event.store}</p>
              </div>
              <div
                className="absolute bottom-0 left-0 right-0 flex items-center gap-3 px-3 py-2"
                style={{ background: 'rgba(0,0,0,0.8)' }}
              >
                <span className="data-mono text-xs" style={{ color: 'var(--fg-dim)' }}>00:00</span>
                <div className="flex-1 h-px relative" style={{ background: 'var(--border-strong)' }}>
                  <div className="h-full w-2/5" style={{ background: 'var(--accent)' }} />
                  <div
                    className="absolute top-1/2 -translate-y-1/2"
                    style={{ left: '40%', width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)', marginLeft: -4 }}
                  />
                </div>
                <span className="data-mono text-xs" style={{ color: 'var(--fg-dim)' }}>02:14</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2">
            <button
              onClick={() => toast('Event flagged. Review queue updated.')}
              className="flex items-center justify-center gap-2 py-2.5 data-mono text-xs transition-colors"
              style={{ border: '1px solid var(--warning)', color: 'var(--warning)' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(251,191,36,0.08)' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
            >
              <Flag size={13} /> FLAG FOR REVIEW
            </button>
            <button
              onClick={() => toast('Event resolved. Audit trail updated.')}
              className="flex items-center justify-center gap-2 py-2.5 data-mono text-xs transition-colors"
              style={{ border: '1px solid var(--success)', color: 'var(--success)' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(74,222,128,0.08)' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
            >
              <CheckCircle size={13} /> MARK RESOLVED
            </button>
            <button
              onClick={() => toast('Event dismissed.')}
              className="flex items-center justify-center gap-2 py-2.5 data-mono text-xs transition-colors"
              style={{ border: '1px solid var(--border-strong)', color: 'var(--fg-muted)' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-hover)' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
            >
              DISMISS
            </button>
          </div>
        </div>

        {/* Right */}
        <div className="flex flex-col gap-4">
          {/* Metadata */}
          <div style={{ border: '1px solid var(--border)', background: 'var(--bg-panel)' }}>
            <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
              <h2 className="text-lg font-semibold" style={{ color: 'var(--fg)' }}>{event.type}</h2>
              <p className="data-mono text-xs mt-0.5" style={{ color: 'var(--fg-dim)' }}>
                {format(event.timestamp, 'yyyy-MM-dd HH:mm:ss')}
              </p>
            </div>
            <table className="w-full text-xs">
              <tbody>
                {[
                  ['EVENT ID', event.id],
                  ['SOURCE', event.source],
                  ['STORE', event.store],
                  ['SEVERITY', event.severity],
                  ['CONFIDENCE', event.confidence?.toFixed(2) ?? '—'],
                  ...Object.entries(event.metadata ?? {}).map(([k, v]) => [k.toUpperCase(), v]),
                ].map(([key, value]) => (
                  <tr key={key} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td className="section-label px-4 py-2.5 w-1/2">{key}</td>
                    <td className="data-mono px-4 py-2.5" style={{ color: 'var(--fg)' }}>{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Comments */}
          <div style={{ border: '1px solid var(--border)', background: 'var(--bg-panel)' }}>
            <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
              <p className="section-label">COMMENTS</p>
            </div>
            <div className="flex flex-col gap-0">
              {[
                { author: 'Elena M.', text: 'Confirmed from store walkthrough. Item not on shelf.', time: '14:32' },
                { author: 'Carlos R.', text: 'High confidence pick. Escalating to LP.', time: '14:38' },
              ].map((comment, i) => (
                <div key={i} className="px-4 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
                  <div className="flex justify-between mb-1">
                    <span className="text-xs font-medium" style={{ color: 'var(--fg)' }}>{comment.author}</span>
                    <span className="data-mono text-xs" style={{ color: 'var(--fg-dim)' }}>{comment.time}</span>
                  </div>
                  <p className="text-xs" style={{ color: 'var(--fg-muted)' }}>{comment.text}</p>
                </div>
              ))}
              <div
                className="flex items-center gap-2 px-4"
                style={{ borderTop: '1px solid var(--border)' }}
              >
                <MessageSquare size={12} style={{ color: 'var(--fg-dim)' }} />
                <input
                  placeholder="Add a comment..."
                  className="flex-1 py-3 text-xs bg-transparent outline-none"
                  style={{ color: 'var(--fg)' }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
