import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Competition {
  name: string
  laps: number
  trackLength: number // metres
}

interface CompetitionState {
  competition: Competition
  setCompetition: (c: Competition) => void
  reset: () => void
}

const DEFAULT: Competition = { name: '', laps: 8, trackLength: 250 }

export const useCompetitionStore = create<CompetitionState>()(
  persist(
    (set) => ({
      competition: DEFAULT,
      setCompetition: (c) => set({ competition: c }),
      reset: () => set({ competition: DEFAULT }),
    }),
    { name: 'krugomer-competition' },
  ),
)
