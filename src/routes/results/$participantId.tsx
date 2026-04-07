import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import { useParticipantsStore } from '@/store/participantsStore'
import { useResultsStore } from '@/store/resultsStore'
import { useCompetitionStore } from '@/store/competitionStore'
import { computeLapStats, computeOverallStats, hasCadenceData } from '@/lib/calculations'
import { formatTime, formatTimeShort, cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

const ParticipantDetailPage = () => {
  const { participantId } = Route.useParams()
  const { participants } = useParticipantsStore()
  const { results } = useResultsStore()
  const { competition } = useCompetitionStore()

  const participant = participants.find((p) => p.id === participantId)
  const result = results[participantId]

  if (!participant || !result) {
    return (
      <div className="space-y-4">
        <Link to="/results">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4" />
            Назад
          </Button>
        </Link>
        <p className="text-muted-foreground">Результат не найден</p>
      </div>
    )
  }

  const showCadence = hasCadenceData(participant)
  const lapStatsList = result.laps.map((l) =>
    computeLapStats(l, competition.trackLength, participant),
  )
  const overall = computeOverallStats(result.laps, competition.trackLength, participant)

  const durations = result.laps.map((l) => l.duration)
  const minDuration = durations.length ? Math.min(...durations) : undefined
  const maxDuration = durations.length ? Math.max(...durations) : undefined

  return (
    <div className="space-y-5">
      <Link to="/results">
        <Button variant="ghost" size="sm" className="-ml-2">
          <ArrowLeft className="h-4 w-4" />
          Все результаты
        </Button>
      </Link>

      <div>
        <div className="flex items-center gap-3">
          <span className="text-3xl font-bold text-muted-foreground">#{participant.startNumber}</span>
          <h1 className="text-2xl font-bold">{participant.name}</h1>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          <Badge variant="secondary">{participant.bikeType}</Badge>
          {participant.frontTeeth && participant.rearTeeth && (
            <Badge variant="outline">
              {participant.frontTeeth}/{participant.rearTeeth}
            </Badge>
          )}
          {participant.wheelSize && (
            <Badge variant="outline">
              {participant.wheelSize === 'custom'
                ? `${participant.wheelCircumference} мм`
                : participant.wheelSize}
            </Badge>
          )}
          {result.finished ? (
            <Badge>Финиш</Badge>
          ) : (
            <Badge variant="destructive">DNF</Badge>
          )}
        </div>
      </div>

      {/* Overall stats */}
      <Card>
        <CardContent className="p-4 grid grid-cols-2 gap-4">
          <div>
            <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Общее время</div>
            <div className="font-mono text-2xl font-bold">
              {result.totalTime !== undefined ? formatTime(result.totalTime) : '—'}
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Средняя скорость</div>
            <div className="font-mono text-2xl font-bold">
              {overall.avgSpeed.toFixed(1)} <span className="text-sm font-normal">км/ч</span>
            </div>
          </div>
          {showCadence && overall.avgCadence !== undefined && (
            <div>
              <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Средний каденс</div>
              <div className="font-mono text-2xl font-bold">
                {Math.round(overall.avgCadence)} <span className="text-sm font-normal">об/мин</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Separator />

      {/* Lap table */}
      <div>
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-3">
          Круги
        </h2>
        <div className="space-y-1">
          {lapStatsList.map((stats, i) => {
            const lap = result.laps[i]
            const isBest = lap.duration === minDuration && durations.length > 1
            const isWorst = lap.duration === maxDuration && durations.length > 1

            return (
              <div
                key={stats.lapNumber}
                className={cn(
                  'flex items-center justify-between py-2.5 px-3 rounded-lg',
                  isBest && 'bg-green-500/10',
                  isWorst && 'bg-red-500/10',
                  !isBest && !isWorst && 'bg-muted/40',
                )}
              >
                <span
                  className={cn(
                    'text-sm w-14',
                    isBest && 'text-green-700 dark:text-green-400 font-medium',
                    isWorst && 'text-red-700 dark:text-red-400 font-medium',
                    !isBest && !isWorst && 'text-muted-foreground',
                  )}
                >
                  Круг {stats.lapNumber}
                </span>
                <span
                  className={cn(
                    'font-mono font-semibold',
                    isBest && 'text-green-700 dark:text-green-400',
                    isWorst && 'text-red-700 dark:text-red-400',
                  )}
                >
                  {formatTimeShort(stats.duration)}
                </span>
                <span className="text-sm text-muted-foreground w-24 text-right">
                  {stats.speed.toFixed(1)} км/ч
                </span>
                {showCadence && (
                  <span className="text-sm text-muted-foreground w-24 text-right">
                    {stats.cadence !== undefined ? `${Math.round(stats.cadence)} об/мин` : '—'}
                  </span>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}


export const Route = createFileRoute('/results/$participantId')({
  component: ParticipantDetailPage,
})