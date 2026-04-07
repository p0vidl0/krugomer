import type { Participant } from '@/store/participantsStore'
import type { LapRecord } from '@/store/resultsStore'

export interface LapStats {
  lapNumber: number
  duration: number // ms
  speed: number // km/h — always computed from trackLength
  cadence?: number // rpm — only when gearing + wheel available
}

export interface OverallStats {
  totalTime: number // ms
  avgSpeed: number // km/h
  avgCadence?: number // rpm
}

export function computeLapStats(
  lap: LapRecord,
  trackLength: number, // metres
  participant: Participant,
): LapStats {
  const durationSec = lap.duration / 1000
  const speed = (trackLength / durationSec) * 3.6

  let cadence: number | undefined
  const circ = participant.wheelCircumference
  if (circ && participant.frontTeeth && participant.rearTeeth) {
    const circMetres = circ / 1000 // circ stored in mm
    const distPerRev = (participant.frontTeeth / participant.rearTeeth) * circMetres
    const revs = trackLength / distPerRev
    cadence = revs / (lap.duration / 60000)
  }

  return { lapNumber: lap.lapNumber, duration: lap.duration, speed, cadence }
}

export function computeOverallStats(
  laps: LapRecord[],
  trackLength: number,
  participant: Participant,
): OverallStats {
  if (!laps.length) return { totalTime: 0, avgSpeed: 0 }
  const totalTime = laps.reduce((acc, l) => acc + l.duration, 0)
  const lapStatsList = laps.map((l) => computeLapStats(l, trackLength, participant))

  const avgSpeed = lapStatsList.reduce((a, b) => a + b.speed, 0) / lapStatsList.length

  const cadences = lapStatsList.map((s) => s.cadence).filter((c): c is number => c !== undefined)
  const avgCadence = cadences.length ? cadences.reduce((a, b) => a + b, 0) / cadences.length : undefined

  return { totalTime, avgSpeed, avgCadence }
}

export function hasCadenceData(participant: Participant): boolean {
  return !!(participant.wheelCircumference && participant.frontTeeth && participant.rearTeeth)
}
