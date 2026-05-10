'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { format } from 'date-fns'
import { Send, RotateCcw, Bot, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
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

function renderContent(text: string) {
  const lines = text.split('\n')
  return lines.map((line, i) => {
    const parts = line.split(/(\*\*[^*]+\*\*)/g)
    return (
      <span key={i}>
        {parts.map((part, j) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={j} className="font-semibold text-foreground">{part.slice(2, -2)}</strong>
          }
          if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
            return <em key={j} className="text-muted-foreground">{part.slice(1, -1)}</em>
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
    <div className="flex items-center gap-1 px-1 py-0.5">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="size-1.5 rounded-full bg-muted-foreground/50 inline-block"
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
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18 }}
      className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
    >
      <Avatar size="sm" className="mt-0.5 shrink-0">
        <AvatarFallback className={isUser ? 'bg-muted' : 'bg-primary/10 text-primary'}>
          {isUser ? <User className="size-3" /> : <Bot className="size-3" />}
        </AvatarFallback>
      </Avatar>

      <div className={`flex flex-col gap-1 max-w-[78%] ${isUser ? 'items-end' : 'items-start'}`}>
        <div
          className={`rounded-lg px-3.5 py-2.5 text-sm leading-relaxed ${
            isUser
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground'
          }`}
        >
          {renderContent(msg.content)}
        </div>
        <span className="text-xs text-muted-foreground/60 tabular-nums">
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
    <div className="flex min-h-0 flex-col" style={{ height: 'calc(100vh - 52px - 48px)' }}>
      {/* Header */}
      <div className="flex items-center justify-between pb-4 shrink-0">
        <div>
          <h1 className="text-[18px] font-semibold tracking-tight">Ask AI</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {stores.length} stores · {metrics.eventsProcessed.toLocaleString()} events today
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={clearChat} className="gap-1.5">
          <RotateCcw className="size-3.5" />
          Clear
        </Button>
      </div>

      {/* Main container */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-border bg-card">
        {/* Messages */}
        <ScrollArea className="min-h-0 flex-1 px-5 py-5">
          <div className="flex flex-col gap-5">
            <AnimatePresence initial={false}>
              {messages.map((msg) => (
                <MessageBubble key={msg.id} msg={msg} />
              ))}
            </AnimatePresence>

            <AnimatePresence>
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex gap-3"
                >
                  <Avatar size="sm" className="mt-0.5 shrink-0">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      <Bot className="size-3" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="rounded-lg px-3.5 py-2.5 bg-muted flex items-center">
                    <TypingIndicator />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Suggestions + input */}
        <div className="shrink-0 border-t border-border bg-card px-4 pb-3 pt-3">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Try asking
          </p>
          <div className="mb-3 flex max-h-28 flex-wrap gap-1.5 overflow-y-auto overscroll-contain sm:max-h-none">
            {SUGGESTED_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => sendMessage(prompt)}
                disabled={isTyping}
                className="rounded-md border border-border bg-muted/50 px-2.5 py-1.5 text-left text-xs text-muted-foreground transition-colors hover:border-border hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
              >
                {prompt}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about stores, inventory, loss prevention, payments…"
              disabled={isTyping}
              className="h-9 flex-1"
            />
            <Button
              type="submit"
              size="sm"
              disabled={!input.trim() || isTyping}
              className="h-9 gap-1.5 px-3"
            >
              <Send className="size-3.5" />
              <span className="hidden sm:inline">Send</span>
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
