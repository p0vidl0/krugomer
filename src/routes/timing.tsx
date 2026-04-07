import { createFileRoute } from '@tanstack/react-router'
import { useState, useRef, useCallback } from 'react'
import { useParticipantsStore } from '@/store/participantsStore'
import { useResultsStore, getTimerState } from '@/store/resultsStore'
import { useCompetitionStore } from '@/store/competitionStore'
import { useTimer } from '@/hooks/useTimer'
import { computeLapStats, hasCadenceData } from '@/lib/calculations'
import { formatTime, cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const TimingPage = () => {
  const { participants } = useParticipantsStore()
  const { competition } = useCompetitionStore()
  const { results, startTimer, recordLap, finishTimer, resetResult } = useResultsStore()
  const [selectedId, setSelectedId] = useState<string>(participants[0]?.id ?? '')
  const [confirmFinish, setConfirmFinish] = useState(false)
  const confirmTimer = useRef<ReturnType<typeof setTimeout>>(undefined)
  const lastTap = useRef(0)

  const participant = participants.find((p) => p.id === selectedId)
  const result = selectedId ? results[selectedId] : undefined
  const timerState = getTimerState(result)
  const elapsed = useTimer(result?.startTime, result?.finished ?? false)

  const displayElapsed = timerState === 'finished' ? (result?.totalTime ?? 0) : elapsed

  // Current lap elapsed = total elapsed minus time of all completed laps
  const completedLapsTime = result
    ? (result.laps.at(-1)?.endTime ?? result.startTime) - result.startTime
    : 0
  const currentLapElapsed = timerState === 'running' ? elapsed - completedLapsTime : 0

  const isLastLap = result && result.laps.length === competition.laps - 1

  const guard = (fn: () => void) => {
    const now = Date.now()
    if (now - lastTap.current < 300) return
    lastTap.current = now
    fn()
  }

  const handleFinishPress = useCallback(() => {
    if (confirmFinish) {
      clearTimeout(confirmTimer.current)
      setConfirmFinish(false)
      guard(() => finishTimer(selectedId))
    } else {
      setConfirmFinish(true)
      confirmTimer.current = setTimeout(() => setConfirmFinish(false), 3000)
    }
  }, [confirmFinish, selectedId, finishTimer])

  const handleSelectParticipant = (id: string) => {
    setSelectedId(id)
    setConfirmFinish(false)
    clearTimeout(confirmTimer.current)
  }

  if (participants.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 text-center">
        <p className="text-muted-foreground text-lg">Участники не добавлены</p>
        <p className="text-sm text-muted-foreground">Перейдите на вкладку «Участники»</p>
      </div>
    )
  }

  const showCadence = participant ? hasCadenceData(participant) : false

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Хронометраж</h1>
        <p className="text-muted-foreground text-sm">{competition.name || 'Соревнование'}</p>
      </div>

      {/* Participant selector */}
      <Select value={selectedId} onValueChange={handleSelectParticipant}>
        <SelectTrigger className="h-12 text-base">
          <SelectValue placeholder="Выберите участника" />
        </SelectTrigger>
        <SelectContent>
          {participants.map((p) => (
            <SelectItem key={p.id} value={p.id}>
              #{p.startNumber} {p.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {participant && (
        <>
          {/* Timer display */}
          <Card>
            <CardContent className="p-6 text-center space-y-1">
              <div className="text-xs text-muted-foreground uppercase tracking-wide">Общее время</div>
              <div className="font-mono text-5xl font-bold tracking-tight tabular-nums">
                {formatTime(displayElapsed)}
              </div>
              {timerState === 'running' && (
                <div className="pt-3 border-t mt-3">
                  <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                    Круг {Math.min((result?.laps.length ?? 0) + 1, competition.laps)} из {competition.laps}
                  </div>
                  <div className="font-mono text-3xl font-semibold tabular-nums text-primary">
                    {formatTime(currentLapElapsed)}
                  </div>
                </div>
              )}
              {timerState === 'finished' && (
                <Badge variant="secondary" className="text-sm">Финиш</Badge>
              )}
            </CardContent>
          </Card>

          {/* Controls */}
          <div className="grid gap-3">
            {timerState === 'idle' && (
              <Button
                className="h-20 text-2xl font-bold rounded-2xl touch-manipulation select-none bg-green-600 hover:bg-green-700 text-white"
                onClick={() => guard(() => startTimer(selectedId))}
              >
                СТАРТ
              </Button>
            )}

            {timerState === 'running' && (
              <>
                {/* КРУГ → ФИНИШ на последнем круге, primary */}
                <Button
                  className="h-20 text-2xl font-bold rounded-2xl touch-manipulation select-none"
                  onClick={() => guard(() => isLastLap ? finishTimer(selectedId) : recordLap(selectedId))}
                >
                  {isLastLap ? 'ФИНИШ' : 'КРУГ'}
                </Button>
                {/* СТОП с подтверждением */}
                <Button
                  className={cn(
                    'h-14 text-lg font-semibold rounded-2xl touch-manipulation select-none transition-all',
                    confirmFinish
                      ? 'bg-red-600 hover:bg-red-700 text-white'
                      : 'bg-muted/60 hover:bg-muted text-muted-foreground border border-border',
                  )}
                  onClick={handleFinishPress}
                >
                  {confirmFinish ? 'Подтвердить остановку?' : 'СТОП'}
                </Button>
              </>
            )}

            {timerState === 'finished' && (
              <Button
                variant="outline"
                className="h-14 text-lg rounded-2xl touch-manipulation select-none"
                onClick={() => { setConfirmFinish(false); guard(() => resetResult(selectedId)) }}
              >
                Сбросить
              </Button>
            )}
          </div>

          {/* Lap list */}
          {result && result.laps.length > 0 && (
            <div className="space-y-2">
              <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Круги
              </h2>
              <div className="space-y-1">
                {(() => {
                  const durations = result.laps.map((l) => l.duration)
                  const minDur = result.laps.length > 1 ? Math.min(...durations) : undefined
                  const maxDur = result.laps.length > 1 ? Math.max(...durations) : undefined
                  return [...result.laps].reverse().map((lap) => {
                    const stats = computeLapStats(lap, competition.trackLength, participant)
                    const isBest = minDur !== undefined && lap.duration === minDur
                    const isWorst = maxDur !== undefined && lap.duration === maxDur
                    return (
                      <div
                        key={lap.lapNumber}
                        className={cn(
                          'flex items-center justify-between py-2 px-3 rounded-lg',
                          isBest && 'bg-green-500/10',
                          isWorst && 'bg-red-500/10',
                          !isBest && !isWorst && 'bg-muted/50',
                        )}
                      >
                        <span className={cn(
                          'text-sm w-16',
                          isBest && 'text-green-700 dark:text-green-400 font-medium',
                          isWorst && 'text-red-700 dark:text-red-400 font-medium',
                          !isBest && !isWorst && 'text-muted-foreground',
                        )}>
                          Круг {lap.lapNumber}
                        </span>
                        <span className={cn(
                          'font-mono font-medium',
                          isBest && 'text-green-700 dark:text-green-400',
                          isWorst && 'text-red-700 dark:text-red-400',
                        )}>
                          {formatTime(lap.duration)}
                        </span>
                        <span className="text-sm text-muted-foreground w-20 text-right">
                          {stats.speed.toFixed(1)} км/ч
                        </span>
                        {showCadence && stats.cadence !== undefined && (
                          <span className="text-sm text-muted-foreground w-20 text-right">
                            {Math.round(stats.cadence)} об/мин
                          </span>
                        )}
                      </div>
                    )
                  })
                })()}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}


export const Route = createFileRoute('/timing')({
  component: TimingPage,
})
