'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { format } from 'date-fns'
import { Send, Bot, User, RotateCcw, Sparkles } from 'lucide-react'
import { LiveIndicator } from '@/components/live-indicator'
import { generateAIResponse, type ChatMessage } from '@/lib/ai-responses'
import { getDashboardMetrics, generateStores, generateFlaggedIncidents } from '@/lib/mock-data'

const metrics = getDashboardMetrics()
const stores = generateStores()
const incidents = generateFlaggedIncidents()

const SUGGESTED_PROMPTS = [
  'What are the biggest shrink issues today?',
  'Which stores are performing best?',
  'Show me the current inventory alerts.',
  'How is payment processing running?',
  'Are there any camera outages?',
  "What's in the LP incident queue?",
  "Summarize today's operations.",
  'Which SKUs are about to go out of stock?',
]

let msgIdCounter = 0
function nextMsgId() {
  return `msg-${++msgIdCounter}`
}

const INITIAL_MESSAGE: ChatMessage = {
  id: nextMsgId(),
  role: 'assistant',
  content: `Hello. I'm the Alwon AI assistant — I have full visibility into your store network.\n\nRight now I can see **${metrics.eventsProcessed.toLocaleString()} events** processed today, **${incidents.filter(i => i.status === 'open').length} open LP incidents**, and **${metrics.activeCameras}/${metrics.totalCameras} cameras** online across ${stores.length} stores.\n\nAsk me anything about operations, inventory, loss prevention, payments, or store performance.`,
  timestamp: new Date(),
}

// Render markdown-lite: bold, line breaks
function renderContent(text: string) {
  const lines = text.split('\n')
  return lines.map((line, i) => {
    const parts = line.split(/(\*\*[^*]+\*\*)/g)
    return (
      <span key={i}>
        {parts.map((part, j) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={j} style={{ color: 'var(--fg)', fontWeight: 600 }}>{part.slice(2, -2)}</strong>
          }
          if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
            return <em key={j} style={{ color: 'var(--fg-muted)' }}>{part.slice(1, -1)}</em>
          }
          return <span key={j}>{part}</span>
        })}
        {i < lines.length - 1 && <br />}
      </span>
    )
  })
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1.5 px-1">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--brand-accent)', display: 'inline-block' }}
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
        />
      ))}
    </div>
  )
}

function MessageBubble({ msg }: { msg: ChatMessage }) {
  const isUser = msg.role === 'user'
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
    >
      {/* Avatar */}
      <div
        className="flex items-center justify-center rounded-full shrink-0 mt-0.5"
        style={{
          width: 28,
          height: 28,
          background: isUser ? 'var(--bg-panel)' : 'rgba(6,144,252,0.15)',
          border: `1px solid ${isUser ? 'var(--border-strong)' : 'var(--border-accent)'}`,
          color: isUser ? 'var(--fg)' : 'var(--brand-accent)',
        }}
      >
        {isUser ? <User size={13} /> : <Bot size={13} />}
      </div>

      {/* Content */}
      <div className={`flex flex-col gap-1 max-w-[80%] ${isUser ? 'items-end' : 'items-start'}`}>
        <div
          className="px-4 py-3 text-sm leading-relaxed"
          style={{
            background: isUser ? 'var(--bg-elevated)' : 'var(--bg-panel)',
            border: `1px solid ${isUser ? 'var(--border-strong)' : 'var(--border-accent)'}`,
            color: 'var(--fg-muted)',
          }}
        >
          {renderContent(msg.content)}
        </div>
        <span className="data-mono text-xs" style={{ color: 'var(--fg-dim)' }}>
          {format(msg.timestamp, 'HH:mm:ss')}
        </span>
      </div>
    </motion.div>
  )
}

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MESSAGE])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping, scrollToBottom])

  const sendMessage = useCallback(async (text: string) => {
    const trimmed = text.trim()
    if (!trimmed || isTyping) return

    const userMsg: ChatMessage = {
      id: nextMsgId(),
      role: 'user',
      content: trimmed,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setIsTyping(true)

    // Simulate response latency (600–1400ms)
    const delay = 600 + Math.random() * 800
    await new Promise((r) => setTimeout(r, delay))

    const responseText = generateAIResponse(trimmed)
    const assistantMsg: ChatMessage = {
      id: nextMsgId(),
      role: 'assistant',
      content: responseText,
      timestamp: new Date(),
    }

    setIsTyping(false)
    setMessages((prev) => [...prev, assistantMsg])
  }, [isTyping])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(input)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  const clearChat = () => {
    setMessages([INITIAL_MESSAGE])
  }

  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 56px - 48px)' }}>
      {/* Header */}
      <div className="flex items-center justify-between pb-4 shrink-0">
        <div>
          <h1 className="text-2xl font-semibold" style={{ color: 'var(--fg)' }}>
            Ask AI
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <LiveIndicator />
            <span className="text-sm" style={{ color: 'var(--fg-muted)' }}>
              I know about your {stores.length} stores and the {metrics.eventsProcessed.toLocaleString()} things that happened today.
            </span>
          </div>
        </div>
        <button
          onClick={clearChat}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md transition-colors"
          style={{ border: '1px solid var(--border-strong)', color: 'var(--fg-muted)' }}
          onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--fg)' }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--fg-muted)' }}
        >
          <RotateCcw size={13} /> Clear chat
        </button>
      </div>

      <div
        className="flex flex-1 gap-4 overflow-hidden"
        style={{ borderRadius: 'var(--radius)', border: '1px solid var(--border)', background: 'var(--bg-panel)' }}
      >
        {/* Chat area */}
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-5">
            <AnimatePresence initial={false}>
              {messages.map((msg) => (
                <MessageBubble key={msg.id} msg={msg} />
              ))}
            </AnimatePresence>

            {/* Typing indicator */}
            <AnimatePresence>
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex gap-3"
                >
                  <div
                    className="flex items-center justify-center rounded-full shrink-0"
                    style={{
                      width: 28,
                      height: 28,
                      background: 'rgba(6,144,252,0.15)',
                      border: '1px solid var(--border-accent)',
                      color: 'var(--brand-accent)',
                    }}
                  >
                    <Bot size={13} />
                  </div>
                  <div
                    className="px-4 py-3 flex items-center"
                    style={{
                      background: 'var(--bg-panel)',
                      border: '1px solid var(--border-accent)',
                    }}
                  >
                    <TypingIndicator />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div ref={messagesEndRef} />
          </div>

          {/* Input area */}
          <div
            className="shrink-0 px-4 py-4"
            style={{ borderTop: '1px solid var(--border)' }}
          >
            {/* Suggested prompts (only show if no user message yet) */}
            {messages.length === 1 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {SUGGESTED_PROMPTS.slice(0, 4).map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => sendMessage(prompt)}
                    className="px-3 py-1.5 text-xs transition-colors"
                    style={{
                      border: '1px solid var(--border-strong)',
                      color: 'var(--fg-muted)',
                      background: 'var(--bg-elevated)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border-accent)'
                      e.currentTarget.style.color = 'var(--brand-accent)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border-strong)'
                      e.currentTarget.style.color = 'var(--fg-muted)'
                    }}
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about stores, inventory, loss prevention, payments..."
                disabled={isTyping}
                className="flex-1 px-4 py-2.5 text-sm outline-none transition-colors"
                style={{
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-strong)',
                  color: 'var(--fg)',
                  opacity: isTyping ? 0.6 : 1,
                }}
                onFocus={(e) => { e.target.style.borderColor = 'var(--border-accent)' }}
                onBlur={(e) => { e.target.style.borderColor = 'var(--border-strong)' }}
              />
              <button
                type="submit"
                disabled={!input.trim() || isTyping}
                className="px-4 py-2.5 flex items-center gap-2 data-mono text-xs transition-colors"
                style={{
                  background: input.trim() && !isTyping ? 'var(--brand-accent)' : 'var(--bg-elevated)',
                  color: input.trim() && !isTyping ? '#fff' : 'var(--fg-dim)',
                  border: `1px solid ${input.trim() && !isTyping ? 'var(--brand-accent)' : 'var(--border-strong)'}`,
                }}
              >
                <Send size={13} />
                <span className="hidden sm:inline">SEND</span>
              </button>
            </form>
          </div>
        </div>

        {/* Right panel — context summary */}
        <div
          className="hidden lg:flex flex-col shrink-0 overflow-y-auto"
          style={{ width: 240, borderLeft: '1px solid var(--border)' }}
        >
          <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
            <div className="flex items-center gap-2">
              <Sparkles size={12} style={{ color: 'var(--brand-accent)' }} />
              <p className="text-sm font-medium" style={{ color: 'var(--fg)' }}>What I&apos;m looking at</p>
            </div>
          </div>

          <div className="flex flex-col gap-0 px-4 py-3">
            <p className="text-xs mb-2" style={{ color: 'var(--fg-muted)' }}>System status</p>
            {[
              { label: 'Events today', value: metrics.eventsProcessed.toLocaleString() },
              { label: 'Open incidents', value: String(incidents.filter(i => i.status === 'open').length) },
              { label: 'Cameras online', value: `${metrics.activeCameras}/${metrics.totalCameras}` },
              { label: 'Payment rate', value: `${metrics.paymentSuccessRate}%` },
              { label: 'Shrink prevented', value: `$${metrics.shrinkPrevented.toLocaleString()}` },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between py-2" style={{ borderBottom: '1px solid var(--border)' }}>
                <span className="text-xs" style={{ color: 'var(--fg-muted)' }}>{label}</span>
                <span className="data-mono text-xs" style={{ color: 'var(--fg)' }}>{value}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-0 px-4 py-3" style={{ borderTop: '1px solid var(--border)' }}>
            <p className="text-xs mb-2" style={{ color: 'var(--fg-muted)' }}>Stores</p>
            {stores.slice(0, 6).map((store) => (
              <div key={store.id} className="flex items-center gap-2 py-2" style={{ borderBottom: '1px solid var(--border)' }}>
                <span style={{
                  width: 5,
                  height: 5,
                  borderRadius: '50%',
                  flexShrink: 0,
                  background: store.status === 'online' ? 'var(--success)' : store.status === 'degraded' ? 'var(--warning)' : 'var(--danger)',
                }} />
                <span className="data-mono text-xs flex-1 truncate" style={{ color: 'var(--fg-muted)' }}>{store.id}</span>
                <span className="data-mono text-xs" style={{ color: store.shrinkDelta > 0 ? 'var(--danger)' : 'var(--success)' }}>
                  {store.shrinkDelta > 0 ? '+' : ''}{store.shrinkDelta}%
                </span>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-2 px-4 py-3" style={{ borderTop: '1px solid var(--border)' }}>
            <p className="text-xs mb-1" style={{ color: 'var(--fg-muted)' }}>Try asking</p>
            {SUGGESTED_PROMPTS.slice(4).map((prompt) => (
              <button
                key={prompt}
                onClick={() => {
                  setInput(prompt)
                  inputRef.current?.focus()
                }}
                className="text-left text-xs px-2 py-2 transition-colors"
                style={{
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border)',
                  color: 'var(--fg-muted)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-accent)'
                  e.currentTarget.style.color = 'var(--brand-accent)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border)'
                  e.currentTarget.style.color = 'var(--fg-muted)'
                }}
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
