import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { Trash2, Timer, Pencil } from 'lucide-react'
import { useParticipantsStore } from '@/store/participantsStore'
import { useResultsStore } from '@/store/resultsStore'
import { ParticipantForm } from '@/components/ParticipantForm'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

const ParticipantsPage = () => {
  const navigate = useNavigate()
  const { participants, addParticipant, updateParticipant, removeParticipant } = useParticipantsStore()
  const { results } = useResultsStore()
  const [showForm, setShowForm] = useState(participants.length === 0)
  const [editingId, setEditingId] = useState<string | null>(null)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Участники</h1>
          <p className="text-muted-foreground text-sm">{participants.length} участников добавлено</p>
        </div>
        <Button
          size="sm"
          onClick={() => setShowForm((v) => !v)}
          variant={showForm ? 'outline' : 'default'}
        >
          {showForm ? 'Скрыть форму' : '+ Добавить'}
        </Button>
      </div>

      {showForm && (
        <>
          <ParticipantForm
            onAdd={(p) => {
              addParticipant(p)
              setShowForm(false)
            }}
          />
          <Separator />
        </>
      )}

      <div className="space-y-3">
        {participants.map((p) => {
          const hasResult = !!results[p.id]
          const isEditing = editingId === p.id
          return (
            <Card key={p.id}>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl font-bold text-muted-foreground w-8 text-right shrink-0">
                      {p.startNumber}
                    </span>
                    <div className="space-y-1">
                      <div className="font-semibold">{p.name}</div>
                      <div className="flex flex-wrap gap-1.5">
                        <Badge variant="secondary">{p.bikeType}</Badge>
                        {p.frontTeeth && p.rearTeeth && (
                          <Badge variant="outline">
                            {p.frontTeeth}/{p.rearTeeth}
                          </Badge>
                        )}
                        {p.wheelSize && (
                          <Badge variant="outline">
                            {p.wheelSize === 'custom'
                              ? `${p.wheelCircumference} мм`
                              : p.wheelSize}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-foreground"
                      title="Редактировать"
                      onClick={() => setEditingId(isEditing ? null : p.id)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-destructive"
                      disabled={hasResult}
                      title={hasResult ? 'Нельзя удалить — есть результаты' : 'Удалить участника'}
                      onClick={() => removeParticipant(p.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                {isEditing && (
                  <ParticipantForm
                    initial={p}
                    onSave={(data) => {
                      updateParticipant(p.id, data)
                      setEditingId(null)
                    }}
                    onCancel={() => setEditingId(null)}
                  />
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {participants.length > 0 && (
        <Button
          className="w-full"
          size="lg"
          onClick={() => navigate({ to: '/timing' })}
        >
          <Timer className="h-5 w-5" />
          Начать хронометраж
        </Button>
      )}
    </div>
  )
}

export const Route = createFileRoute('/participants')({
  component: ParticipantsPage,
})
