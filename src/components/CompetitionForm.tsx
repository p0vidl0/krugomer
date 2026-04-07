import { useState } from 'react'
import { useCompetitionStore, type Competition } from '@/store/competitionStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'

interface Props {
  onSubmit: () => void
}

export const CompetitionForm = ({ onSubmit }: Props) => {
  const { competition, setCompetition } = useCompetitionStore()
  const [form, setForm] = useState<Competition>({
    name: competition.name,
    laps: competition.laps,
    trackLength: competition.trackLength,
  })
  const [errors, setErrors] = useState<Partial<Record<keyof Competition, string>>>({})

  const validate = (): boolean => {
    const e: typeof errors = {}
    if (!form.name.trim()) e.name = 'Введите название'
    if (!form.laps || form.laps < 1 || form.laps > 50) e.laps = 'От 1 до 50'
    if (!form.trackLength || form.trackLength < 50 || form.trackLength > 2000)
      e.trackLength = 'От 50 до 2000 м'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setCompetition({ ...form, name: form.name.trim() })
    onSubmit()
  }

  return (
    <Card>
      <CardContent className="p-5">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Название соревнования *</Label>
            <Input
              id="name"
              placeholder="Например: Открытое первенство"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className={errors.name ? 'border-destructive' : ''}
            />
            {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="laps">Количество кругов *</Label>
              <Input
                id="laps"
                type="number"
                min={1}
                max={50}
                value={form.laps}
                onChange={(e) => setForm((f) => ({ ...f, laps: Number(e.target.value) }))}
                className={errors.laps ? 'border-destructive' : ''}
              />
              {errors.laps && <p className="text-xs text-destructive">{errors.laps}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="trackLength">Длина круга, м *</Label>
              <Input
                id="trackLength"
                type="number"
                min={50}
                max={2000}
                value={form.trackLength}
                onChange={(e) => setForm((f) => ({ ...f, trackLength: Number(e.target.value) }))}
                className={errors.trackLength ? 'border-destructive' : ''}
              />
              {errors.trackLength && (
                <p className="text-xs text-destructive">{errors.trackLength}</p>
              )}
              <p className="text-xs text-muted-foreground">Стандарт: 250 м или 333 м</p>
            </div>
          </div>

          <Button type="submit" className="w-full" size="lg">
            Сохранить и продолжить →
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
