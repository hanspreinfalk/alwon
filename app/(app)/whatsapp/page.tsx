'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { Send } from 'lucide-react'
import { SectionHeader } from '@/components/section-header'
import { generateWhatsAppConversations } from '@/lib/mock-data'
import type { WhatsAppConversation } from '@/lib/types'

const conversations = generateWhatsAppConversations()

const AI_SUGGESTIONS = [
  'Your order is being processed and will be ready in 15 minutes.',
  'We apologize for the inconvenience. A store associate will assist you shortly.',
  'The item you requested is currently out of stock. Expected restock: tomorrow.',
]

function ConversationThread({ conv, onSend }: { conv: WhatsAppConversation; onSend: (msg: string) => void }) {
  const [input, setInput] = useState('')

  const handleSend = () => {
    if (!input.trim()) return
    onSend(input)
    setInput('')
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div
        className="px-4 py-3 shrink-0"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        <p className="data-mono text-sm" style={{ color: 'var(--fg)' }}>{conv.customerId}</p>
        <p className="data-mono text-xs mt-0.5" style={{ color: 'var(--fg-dim)' }}>
          {conv.messages.length} messages · {conv.status}
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto flex flex-col gap-2 p-4">
        {conv.messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.direction === 'outbound' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className="max-w-[75%] px-3 py-2 text-sm"
              style={{
                border: msg.direction === 'outbound'
                  ? '1px solid var(--border-accent)'
                  : '1px solid var(--border)',
                background: msg.direction === 'outbound'
                  ? 'rgba(6,144,252,0.06)'
                  : 'var(--bg-elevated)',
                color: 'var(--fg)',
              }}
            >
              <p>{msg.content}</p>
              <p className="data-mono text-xs mt-1" style={{ color: 'var(--fg-dim)' }}>
                {format(msg.timestamp, 'HH:mm')}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div
        className="px-4 py-3 shrink-0"
        style={{ borderTop: '1px solid var(--border)' }}
      >
        <div className="flex gap-2" style={{ border: '1px solid var(--border-strong)' }}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type a message..."
            className="flex-1 px-3 py-2 text-sm bg-transparent outline-none"
            style={{ color: 'var(--fg)' }}
          />
          <button
            onClick={handleSend}
            className="px-3 flex items-center justify-center transition-colors"
            style={{ background: 'var(--accent)', color: '#fff' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--accent-hover)' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--accent)' }}
          >
            <Send size={14} />
          </button>
        </div>
      </div>
    </div>
  )
}

export default function WhatsAppPage() {
  const [selected, setSelected] = useState<WhatsAppConversation>(conversations[0])

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold" style={{ color: 'var(--fg)' }}>
          WhatsApp <em>inbox</em>
        </h1>
        <p className="data-mono text-xs mt-1" style={{ color: 'var(--fg-dim)' }}>
          {conversations.filter((c) => c.unreadCount > 0).length} unread conversations
        </p>
      </div>

      <div
        className="flex overflow-hidden"
        style={{ border: '1px solid var(--border)', height: 600 }}
      >
        {/* Thread list */}
        <div
          className="flex flex-col overflow-y-auto shrink-0"
          style={{ width: 260, borderRight: '1px solid var(--border)' }}
        >
          {conversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => setSelected(conv)}
              className="flex items-start gap-3 px-4 py-3 text-left transition-colors"
              style={{
                borderBottom: '1px solid var(--border)',
                background: selected?.id === conv.id ? 'var(--bg-hover)' : 'transparent',
                borderLeft: selected?.id === conv.id ? '2px solid var(--accent)' : '2px solid transparent',
              }}
              onMouseEnter={(e) => {
                if (selected?.id !== conv.id) e.currentTarget.style.background = 'var(--bg-hover)'
              }}
              onMouseLeave={(e) => {
                if (selected?.id !== conv.id) e.currentTarget.style.background = 'transparent'
              }}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="data-mono text-xs" style={{ color: 'var(--fg)' }}>{conv.customerId}</span>
                  {conv.unreadCount > 0 && (
                    <span
                      className="data-mono text-xs px-1.5 py-0.5 rounded-full"
                      style={{ background: 'var(--accent)', color: '#fff', fontSize: 9 }}
                    >
                      {conv.unreadCount}
                    </span>
                  )}
                </div>
                <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--fg-dim)' }}>
                  {conv.lastMessage}
                </p>
                <div className="flex items-center justify-between mt-1">
                  <span className="data-mono text-xs" style={{ color: 'var(--fg-dim)', fontSize: '0.6rem' }}>
                    {format(conv.lastMessageTime, 'HH:mm')}
                  </span>
                  <span className="flex items-center gap-0.5">
                    <span style={{ fontSize: 6, color: conv.status === 'open' ? 'var(--warning)' : conv.status === 'resolved' ? 'var(--success)' : 'var(--fg-dim)' }}>●</span>
                    <span className="section-label" style={{ fontSize: '0.55rem' }}>{conv.status}</span>
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Conversation */}
        <div className="flex-1 overflow-hidden" style={{ background: 'var(--bg-panel)' }}>
          {selected ? (
            <ConversationThread
              conv={selected}
              onSend={(msg) => console.log('send:', msg)}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="section-label">SELECT A CONVERSATION</p>
            </div>
          )}
        </div>

        {/* Context panel */}
        <div
          className="hidden lg:flex flex-col overflow-y-auto shrink-0"
          style={{ width: 240, borderLeft: '1px solid var(--border)' }}
        >
          {selected && (
            <>
              <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
                <p className="section-label">CUSTOMER CONTEXT</p>
              </div>
              <div className="flex flex-col gap-0 px-4 py-3">
                {[
                  ['ID', selected.customerId],
                  ['STORE', 'LIMA-03'],
                  ['ORDERS', '7 this month'],
                  ['LAST VISIT', 'Today 11:24'],
                  ['STATUS', selected.status],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between py-2" style={{ borderBottom: '1px solid var(--border)' }}>
                    <span className="section-label">{k}</span>
                    <span className="data-mono text-xs" style={{ color: 'var(--fg-muted)' }}>{v}</span>
                  </div>
                ))}
              </div>
              <div className="px-4 py-3" style={{ borderTop: '1px solid var(--border)' }}>
                <p className="section-label mb-2">AI SUGGESTIONS</p>
                <div className="flex flex-col gap-2">
                  {AI_SUGGESTIONS.map((s, i) => (
                    <button
                      key={i}
                      className="text-left text-xs px-2 py-2 rounded-sm transition-colors"
                      style={{
                        background: 'var(--bg-elevated)',
                        border: '1px solid var(--border)',
                        color: 'var(--fg-muted)',
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--border-accent)' }}
                      onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)' }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
