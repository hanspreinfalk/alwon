'use client'

import { create } from 'zustand'
import type { StoreEvent } from './types'
import { seedEvents } from './mock-data'

const MAX_BUFFER = 500

interface EventStreamState {
  events: StoreEvent[]
  paused: boolean
  selectedEventId: string | null
  addEvent: (event: StoreEvent) => void
  pauseStream: () => void
  resumeStream: () => void
  selectEvent: (id: string | null) => void
}

export const useEventStore = create<EventStreamState>((set) => ({
  events: seedEvents(50),
  paused: false,
  selectedEventId: null,
  addEvent: (event) =>
    set((state) => ({
      events: [event, ...state.events].slice(0, MAX_BUFFER),
    })),
  pauseStream: () => set({ paused: true }),
  resumeStream: () => set({ paused: false }),
  selectEvent: (id) => set({ selectedEventId: id }),
}))

interface FilterState {
  categories: string[]
  severities: string[]
  search: string
  setCategories: (cats: string[]) => void
  setSeverities: (sevs: string[]) => void
  setSearch: (q: string) => void
}

export const useFilterStore = create<FilterState>((set) => ({
  categories: [],
  severities: [],
  search: '',
  setCategories: (categories) => set({ categories }),
  setSeverities: (severities) => set({ severities }),
  setSearch: (search) => set({ search }),
}))

interface StoreSelectionState {
  selectedStore: string
  setStore: (id: string) => void
}

export const useStoreSelection = create<StoreSelectionState>((set) => ({
  selectedStore: 'LIMA-03',
  setStore: (id) => set({ selectedStore: id }),
}))
