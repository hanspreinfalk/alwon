'use client'

import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useEventStore } from '@/lib/store'
import { useEventStream } from '@/lib/fake-socket'
import { EventRow } from './event-row'
import type { StoreEvent } from '@/lib/types'

interface EventStreamProps {
  limit?: number
  showActions?: boolean
}

export function EventStream({ limit = 50 }: EventStreamProps) {
  const { events, selectedEventId, selectEvent } = useEventStore()
  const [flashId, setFlashId] = useState<string | null>(null)
  const prevTopId = useRef<string | null>(null)

  useEventStream()

  // Flash new events
  useEffect(() => {
    const topEvent = events[0]
    if (topEvent && topEvent.id !== prevTopId.current) {
      setFlashId(topEvent.id)
      prevTopId.current = topEvent.id
      const t = setTimeout(() => setFlashId(null), 800)
      return () => clearTimeout(t)
    }
  }, [events])

  const displayed = events.slice(0, limit)

  return (
    <div className="flex flex-col h-full overflow-hidden">

      <div className="flex-1 overflow-y-auto h-full">
        <AnimatePresence initial={false}>
          {displayed.map((event: StoreEvent) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              layout
            >
              <EventRow
                event={event}
                isSelected={selectedEventId === event.id}
                onClick={() => selectEvent(event.id === selectedEventId ? null : event.id)}
                flash={flashId === event.id}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}
