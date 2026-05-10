'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { format } from 'date-fns'
import { Send, RotateCcw, Sparkles, Bot, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
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

  const openIncidents = incidents.filter(i => i.status === 'open').length

  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 52px - 48px)' }}>
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
      <div className="flex flex-1 overflow-hidden rounded-lg border border-border bg-card">
        {/* Chat area */}
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          {/* Messages */}
          <ScrollArea className="flex-1 px-5 py-5">
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

          <Separator />

          {/* Input area */}
          <div className="shrink-0 px-4 py-3">
            {messages.length === 1 && (
              <div className="flex flex-wrap gap-1.5 mb-3">
                {SUGGESTED_PROMPTS.slice(0, 4).map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => sendMessage(prompt)}
                    className="px-2.5 py-1 text-xs rounded-md border border-border bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground hover:border-border transition-colors"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            )}

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

        {/* Right sidebar */}
        <div className="hidden lg:flex flex-col shrink-0 w-56 border-l border-border overflow-hidden">
          <div className="px-4 py-3 flex items-center gap-2">
            <Sparkles className="size-3.5 text-muted-foreground" />
            <span className="text-sm font-medium">Context</span>
          </div>
          <Separator />

          <ScrollArea className="flex-1">
            {/* System stats */}
            <div className="px-4 py-3">
              <p className="text-xs font-medium text-muted-foreground mb-2">System status</p>
              <div className="space-y-1">
                {[
                  { label: 'Events today', value: metrics.eventsProcessed.toLocaleString() },
                  { label: 'Open incidents', value: String(openIncidents) },
                  { label: 'Cameras online', value: `${metrics.activeCameras}/${metrics.totalCameras}` },
                  { label: 'Payment rate', value: `${metrics.paymentSuccessRate}%` },
                  { label: 'Shrink prevented', value: `$${metrics.shrinkPrevented.toLocaleString()}` },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between py-1.5 border-b border-border last:border-0">
                    <span className="text-xs text-muted-foreground">{label}</span>
                    <span className="text-xs font-medium tabular-nums">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Stores */}
            <div className="px-4 py-3">
              <p className="text-xs font-medium text-muted-foreground mb-2">Stores</p>
              <div className="space-y-1">
                {stores.slice(0, 6).map((store) => (
                  <div key={store.id} className="flex items-center gap-2 py-1.5 border-b border-border last:border-0">
                    <span className={`size-1.5 rounded-full shrink-0 ${
                      store.status === 'online' ? 'bg-green-500' :
                      store.status === 'degraded' ? 'bg-yellow-500' : 'bg-red-500'
                    }`} />
                    <span className="text-xs text-muted-foreground flex-1 font-mono truncate">{store.id}</span>
                    <Badge
                      variant={store.shrinkDelta > 0 ? 'destructive' : 'secondary'}
                      className="text-[10px] h-4 px-1.5 font-mono"
                    >
                      {store.shrinkDelta > 0 ? '+' : ''}{store.shrinkDelta}%
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Suggested prompts */}
            <div className="px-4 py-3">
              <p className="text-xs font-medium text-muted-foreground mb-2">Try asking</p>
              <div className="flex flex-col gap-1">
                {SUGGESTED_PROMPTS.slice(4).map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => {
                      setInput(prompt)
                      inputRef.current?.focus()
                    }}
                    className="text-left text-xs px-2.5 py-2 rounded-md border border-border bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  )
}
