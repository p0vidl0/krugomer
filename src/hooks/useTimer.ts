import { useEffect, useRef, useState } from 'react'

/**
 * Returns live elapsed time in ms relative to startTime.
 * Uses requestAnimationFrame (~60fps). Stops when finished=true.
 */
export function useTimer(startTime: number | undefined, finished: boolean): number {
  const [elapsed, setElapsed] = useState(0)
  const rafRef = useRef<number>(undefined)

  useEffect(() => {
    if (!startTime || finished) {
      if (rafRef.current !== undefined) cancelAnimationFrame(rafRef.current)
      return
    }

    const tick = () => {
      setElapsed(Date.now() - startTime)
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)

    return () => {
      if (rafRef.current !== undefined) cancelAnimationFrame(rafRef.current)
    }
  }, [startTime, finished])

  return elapsed
}
