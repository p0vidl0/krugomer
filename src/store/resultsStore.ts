import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface LapRecord {
  lapNumber: number
  startTime: number // Date.now() ms
  endTime: number
  duration: number // ms
}

export interface ParticipantResult {
  participantId: string
  startTime: number
  laps: LapRecord[]
  finished: boolean
  totalTime?: number // ms
}

interface ResultsState {
  results: Record<string, ParticipantResult>
  startTimer: (participantId: string) => void
  recordLap: (participantId: string) => void
  finishTimer: (participantId: string) => void
  resetResult: (participantId: string) => void
  clearAll: () => void
}

export const useResultsStore = create<ResultsState>()(
  persist(
    (set) => ({
      results: {},

      startTimer: (participantId) => {
        const now = Date.now()
        set((s) => ({
          results: {
            ...s.results,
            [participantId]: {
              participantId,
              startTime: now,
              laps: [],
              finished: false,
            },
          },
        }))
      },

      recordLap: (participantId) => {
        const now = Date.now()
        set((s) => {
          const result = s.results[participantId]
          if (!result || result.finished) return s
          const prevEnd = result.laps.at(-1)?.endTime ?? result.startTime
          const lapNumber = result.laps.length + 1
          const newLap: LapRecord = {
            lapNumber,
            startTime: prevEnd,
            endTime: now,
            duration: now - prevEnd,
          }
          return {
            results: {
              ...s.results,
              [participantId]: { ...result, laps: [...result.laps, newLap] },
            },
          }
        })
      },

      finishTimer: (participantId) => {
        const now = Date.now()
        set((s) => {
          const result = s.results[participantId]
          if (!result || result.finished) return s
          const prevEnd = result.laps.at(-1)?.endTime ?? result.startTime
          const lapNumber = result.laps.length + 1
          const finalLap: LapRecord = {
            lapNumber,
            startTime: prevEnd,
            endTime: now,
            duration: now - prevEnd,
          }
          const allLaps = [...result.laps, finalLap]
          const totalTime = now - result.startTime
          return {
            results: {
              ...s.results,
              [participantId]: { ...result, laps: allLaps, finished: true, totalTime },
            },
          }
        })
      },

      resetResult: (participantId) =>
        set((s) => {
          const next = { ...s.results }
          delete next[participantId]
          return { results: next }
        }),

      clearAll: () => set({ results: {} }),
    }),
    { name: 'krugomer-results' },
  ),
)

export function getTimerState(result: ParticipantResult | undefined): 'idle' | 'running' | 'finished' {
  if (!result) return 'idle'
  if (result.finished) return 'finished'
  return 'running'
}
