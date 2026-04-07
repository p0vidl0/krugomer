import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type WheelSize = '25/622' | '28/622' | '29/622' | 'custom'
export type BikeType = 'фикс' | 'шоссе'

export interface Participant {
  id: string
  startNumber: number
  name: string
  bikeType: BikeType
  frontTeeth?: number
  rearTeeth?: number
  wheelSize?: WheelSize
  wheelCircumference?: number // cm — always set when wheelSize is selected
}

interface ParticipantsState {
  participants: Participant[]
  addParticipant: (p: Omit<Participant, 'id' | 'startNumber'>) => void
  updateParticipant: (id: string, data: Omit<Participant, 'id' | 'startNumber'>) => void
  removeParticipant: (id: string) => void
  clearAll: () => void
}

export const useParticipantsStore = create<ParticipantsState>()(
  persist(
    (set, get) => ({
      participants: [],
      addParticipant: (p) => {
        const existing = get().participants
        const startNumber = existing.length + 1
        const id = crypto.randomUUID()
        set({ participants: [...existing, { ...p, id, startNumber }] })
      },
      updateParticipant: (id, data) =>
        set((s) => ({
          participants: s.participants.map((p) =>
            p.id === id ? { ...p, ...data } : p,
          ),
        })),
      removeParticipant: (id) =>
        set((s) => ({
          participants: s.participants
            .filter((p) => p.id !== id)
            .map((p, i) => ({ ...p, startNumber: i + 1 })),
        })),
      clearAll: () => set({ participants: [] }),
    }),
    { name: 'krugomer-participants' },
  ),
)
