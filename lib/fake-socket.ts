'use client'

import { useEffect, useRef } from 'react'
import { generateEvent } from './mock-data'
import { useEventStore } from './store'

export function useEventStream() {
  const { paused, addEvent } = useEventStore()
  const pausedRef = useRef(paused)
  pausedRef.current = paused

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>

    const schedule = () => {
      const delay = Math.random() * 3000 + 1000
      timeout = setTimeout(() => {
        if (!pausedRef.current) {
          addEvent(generateEvent())
        }
        schedule()
      }, delay)
    }

    schedule()

    return () => clearTimeout(timeout)
  }, [addEvent])
}
