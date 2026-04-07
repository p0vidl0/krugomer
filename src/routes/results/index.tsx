import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { useParticipantsStore } from '@/store/participantsStore'
import { useResultsStore } from '@/store/resultsStore'
import { useCompetitionStore } from '@/store/competitionStore'
import { formatTimeShort } from '@/lib/utils'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'


interface RankedParticipant {
  id: string
  startNumber: number
  name: string
  totalTime?: number
  laps: number[]
  finished: boolean
  place?: number
}

const ResultsPage = () => {
  const { participants } = useParticipantsStore()
  const { results } = useResultsStore()
  const { competition } = useCompetitionStore()
  const [sort, setSort] = useState<'startNumber' | 'place'>('startNumber')

  const ranked: RankedParticipant[] = participants.map((p) => {
    const r = results[p.id]
    return {
      id: p.id,
      startNumber: p.startNumber,
      name: p.name,
      totalTime: r?.totalTime,
      laps: r?.laps.map((l) => l.duration) ?? [],
      finished: r?.finished ?? false,
    }
  })

  // Assign places to finished participants
  const finished = ranked.filter((r) => r.finished).sort((a, b) => (a.totalTime ?? 0) - (b.totalTime ?? 0))
  finished.forEach((r, i) => {
    r.place = i + 1
  })

  const sorted =
    sort === 'startNumber'
      ? [...ranked].sort((a, b) => a.startNumber - b.startNumber)
      : [...ranked].sort((a, b) => {
          if (a.place && b.place) return a.place - b.place
          if (a.place) return -1
          if (b.place) return 1
          return a.startNumber - b.startNumber
        })

  const lapIndices = Array.from({ length: competition.laps }, (_, i) => i)

  if (participants.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-2">
        <p className="text-muted-foreground text-lg">Участников нет</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Результаты</h1>
        <p className="text-muted-foreground text-sm">{competition.name || 'Соревнование'}</p>
      </div>

      <Tabs value={sort} onValueChange={(v) => setSort(v as typeof sort)}>
        <TabsList>
          <TabsTrigger value="startNumber">По номеру</TabsTrigger>
          <TabsTrigger value="place">По месту</TabsTrigger>
        </TabsList>

        <TabsContent value={sort}>
          <div className="overflow-x-auto -mx-4 px-4">
            <table className="w-full text-sm min-w-max">
              <thead>
                <tr className="border-b text-muted-foreground">
                  <th className="text-left py-2 pr-3 font-medium w-8">#</th>
                  <th className="text-left py-2 pr-3 font-medium">Участник</th>
                  {lapIndices.map((i) => (
                    <th key={i} className="text-right py-2 px-2 font-medium whitespace-nowrap">
                      Кр.{i + 1}
                    </th>
                  ))}
                  <th className="text-right py-2 px-2 font-medium">Итого</th>
                  <th className="text-right py-2 pl-2 font-medium">Место</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((row) => (
                  <tr key={row.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="py-3 pr-3 text-muted-foreground">{row.startNumber}</td>
                    <td className="py-3 pr-3">
                      <Link
                        to="/results/$participantId"
                        params={{ participantId: row.id }}
                        className="font-medium hover:underline"
                      >
                        {row.name}
                      </Link>
                    </td>
                    {lapIndices.map((i) => (
                      <td key={i} className="py-3 px-2 text-right font-mono">
                        {row.laps[i] !== undefined ? formatTimeShort(row.laps[i]) : '—'}
                      </td>
                    ))}
                    <td className="py-3 px-2 text-right font-mono font-medium">
                      {row.totalTime !== undefined ? formatTimeShort(row.totalTime) : '—'}
                    </td>
                    <td className="py-3 pl-2 text-right">
                      {row.place ? (
                        <Badge variant={row.place === 1 ? 'default' : 'secondary'}>
                          {row.place}
                        </Badge>
                      ) : row.finished ? (
                        '—'
                      ) : (
                        <span className="text-muted-foreground text-xs">DNF</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export const Route = createFileRoute('/results/')({
  component: ResultsPage,
})
