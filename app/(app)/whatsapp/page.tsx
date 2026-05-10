'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { Send } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
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
      <div className="px-4 py-3 shrink-0 border-b">
        <p className="font-mono text-sm font-medium">{conv.customerId}</p>
        <p className="font-mono text-xs mt-0.5 text-muted-foreground">
          {conv.messages.length} messages · {conv.status}
        </p>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1">
        <div className="flex flex-col gap-2 p-4">
          {conv.messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.direction === 'outbound' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[75%] px-3 py-2 text-sm rounded-lg ${
                  msg.direction === 'outbound'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-foreground'
                }`}
              >
                <p>{msg.content}</p>
                <p className="font-mono text-[10px] mt-1 opacity-60">
                  {format(msg.timestamp, 'HH:mm')}
                </p>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="px-4 py-3 shrink-0 border-t">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type a message…"
            className="h-9 flex-1"
          />
          <Button size="sm" className="h-9" onClick={handleSend} disabled={!input.trim()}>
            <Send className="size-3.5" />
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function WhatsAppPage() {
  const [selected, setSelected] = useState<WhatsAppConversation>(conversations[0])

  const unreadCount = conversations.filter((c) => c.unreadCount > 0).length

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-[18px] font-semibold tracking-tight">Messages</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {unreadCount} unread {unreadCount === 1 ? 'message' : 'messages'} from customers
        </p>
      </div>

      <div className="flex overflow-hidden rounded-xl border bg-card" style={{ height: 'calc(100vh - 52px - 48px - 80px)' }}>
        {/* Thread list */}
        <div className="flex flex-col overflow-y-auto shrink-0 border-r" style={{ width: 260 }}>
          {conversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => setSelected(conv)}
              className="flex items-start gap-3 px-4 py-3 text-left transition-colors border-b hover:bg-muted/40"
              style={{
                background: selected?.id === conv.id ? 'var(--muted)' : undefined,
                borderLeft: selected?.id === conv.id ? '2px solid var(--foreground)' : '2px solid transparent',
              }}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-medium">{conv.customerId}</span>
                  {conv.unreadCount > 0 && (
                    <span className="font-mono text-[9px] px-1.5 py-0.5 rounded-full bg-foreground text-background font-semibold">
                      {conv.unreadCount}
                    </span>
                  )}
                </div>
                <p className="text-xs mt-0.5 truncate text-muted-foreground">
                  {conv.lastMessage}
                </p>
                <div className="flex items-center justify-between mt-1">
                  <span className="font-mono text-[10px] text-muted-foreground">
                    {format(conv.lastMessageTime, 'HH:mm')}
                  </span>
                  <span className="flex items-center gap-1">
                    <span className={`size-1.5 rounded-full shrink-0 ${
                      conv.status === 'open' ? 'bg-amber-500' :
                      conv.status === 'resolved' ? 'bg-green-500' : 'bg-muted-foreground'
                    }`} />
                    <span className="text-[10px] text-muted-foreground">
                      {conv.status === 'open' ? 'Waiting' : conv.status === 'resolved' ? 'Done' : 'Pending'}
                    </span>
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Conversation */}
        <div className="flex-1 overflow-hidden bg-card">
          {selected ? (
            <ConversationThread
              conv={selected}
              onSend={(msg) => console.log('send:', msg)}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-sm text-muted-foreground">Choose a conversation to view it</p>
            </div>
          )}
        </div>

        {/* Context panel */}
        <div className="hidden lg:flex flex-col overflow-y-auto shrink-0 border-l" style={{ width: 240 }}>
          {selected && (
            <>
              <div className="px-4 py-3 border-b">
                <p className="text-sm font-semibold">About this customer</p>
              </div>
              <div className="flex flex-col gap-0 px-4 py-3">
                {[
                  ['Customer ID', selected.customerId],
                  ['Their store', 'LIMA-03'],
                  ['Recent orders', '7 this month'],
                  ['Last visit', 'Today, 11:24 AM'],
                  ['Status', selected.status === 'open' ? 'Waiting' : selected.status === 'resolved' ? 'Done' : 'Pending'],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between py-2 border-b">
                    <span className="text-xs text-muted-foreground">{k}</span>
                    <span className="text-xs font-medium">{v}</span>
                  </div>
                ))}
              </div>
              <div className="px-4 py-3 border-t">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">Suggested replies</p>
                <div className="flex flex-col gap-2">
                  {AI_SUGGESTIONS.map((s, i) => (
                    <button
                      key={i}
                      className="text-left text-xs px-3 py-2 rounded-lg border bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground hover:border-border transition-colors"
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
