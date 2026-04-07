import { useState } from 'react'
import { type Participant, type BikeType, type WheelSize } from '@/store/participantsStore'
import { WHEEL_SIZES } from '@/lib/wheelSizes'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'

type FormParticipant = Omit<Participant, 'id' | 'startNumber'>

interface Props {
  onAdd?: (p: FormParticipant) => void
  onSave?: (p: FormParticipant) => void
  onCancel?: () => void
  initial?: Participant
}

const EMPTY: FormParticipant = {
  name: '',
  bikeType: 'фикс',
  frontTeeth: undefined,
  rearTeeth: undefined,
  wheelSize: undefined,
  wheelCircumference: undefined,
}

export const ParticipantForm = ({ onAdd, onSave, onCancel, initial }: Props) => {
  const [form, setForm] = useState<FormParticipant>(
    initial
      ? { name: initial.name, bikeType: initial.bikeType, frontTeeth: initial.frontTeeth, rearTeeth: initial.rearTeeth, wheelSize: initial.wheelSize, wheelCircumference: initial.wheelCircumference }
      : EMPTY,
  )
  const [customCirc, setCustomCirc] = useState(
    initial?.wheelSize === 'custom' ? String(initial.wheelCircumference ?? '') : '',
  )
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleWheelSizeChange = (value: string) => {
    const ws = value as WheelSize
    if (ws === 'custom') {
      setForm((f) => ({ ...f, wheelSize: 'custom', wheelCircumference: undefined }))
    } else {
      const circ = WHEEL_SIZES[ws as keyof typeof WHEEL_SIZES].circumference
      setForm((f) => ({ ...f, wheelSize: ws, wheelCircumference: circ }))
    }
  }

  const validate = (): boolean => {
    const e: Record<string, string> = {}
    if (!form.name.trim()) e.name = 'Введите имя'
    if (!form.bikeType) e.bikeType = 'Выберите тип'
    const hasFront = form.frontTeeth !== undefined && form.frontTeeth > 0
    const hasRear = form.rearTeeth !== undefined && form.rearTeeth > 0
    if (hasFront !== hasRear) e.gearing = 'Укажите оба значения передачи'
    if (form.wheelSize === 'custom') {
      const v = Number(customCirc)
      if (!customCirc || isNaN(v) || v < 1000 || v > 3000) {
        e.customCirc = 'Введите длину окружности в мм (1000–3000)'
      }
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    const finalCirc =
      form.wheelSize === 'custom' ? Number(customCirc) : form.wheelCircumference

    const data = { ...form, name: form.name.trim(), wheelCircumference: finalCirc }

    if (onSave) {
      onSave(data)
    } else {
      onAdd!(data)
      setForm(EMPTY)
      setCustomCirc('')
      setErrors({})
    }
  }

  return (
    <Card>
      <CardContent className="p-5">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="pname">Имя *</Label>
            <Input
              id="pname"
              placeholder="Имя участника"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className={errors.name ? 'border-destructive' : ''}
            />
            {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
          </div>

          <div className="space-y-1.5">
            <Label>Тип велосипеда *</Label>
            <RadioGroup
              value={form.bikeType}
              onValueChange={(v) => setForm((f) => ({ ...f, bikeType: v as BikeType }))}
              className="flex gap-6"
            >
              {(['фикс', 'шоссе'] as BikeType[]).map((t) => (
                <div key={t} className="flex items-center space-x-2">
                  <RadioGroupItem value={t} id={`bike-${t}`} />
                  <Label htmlFor={`bike-${t}`} className="capitalize cursor-pointer">
                    {t}
                  </Label>
                </div>
              ))}
            </RadioGroup>
            {errors.bikeType && <p className="text-xs text-destructive">{errors.bikeType}</p>}
          </div>

          <div className="space-y-1.5">
            <Label>Передача (зубья)</Label>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="front" className="text-xs text-muted-foreground">
                  Передняя звезда
                </Label>
                <Input
                  id="front"
                  type="number"
                  min={1}
                  max={99}
                  placeholder="48"
                  value={form.frontTeeth ?? ''}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      frontTeeth: e.target.value ? Number(e.target.value) : undefined,
                    }))
                  }
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="rear" className="text-xs text-muted-foreground">
                  Задняя звезда
                </Label>
                <Input
                  id="rear"
                  type="number"
                  min={1}
                  max={99}
                  placeholder="14"
                  value={form.rearTeeth ?? ''}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      rearTeeth: e.target.value ? Number(e.target.value) : undefined,
                    }))
                  }
                />
              </div>
            </div>
            {errors.gearing && <p className="text-xs text-destructive">{errors.gearing}</p>}
          </div>

          <div className="space-y-1.5">
            <Label>Размер заднего колеса</Label>
            <Select
              value={form.wheelSize ?? ''}
              onValueChange={(v) => (v ? handleWheelSizeChange(v) : setForm((f) => ({ ...f, wheelSize: undefined, wheelCircumference: undefined })))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Не указан" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(WHEEL_SIZES).map(([key, val]) => (
                  <SelectItem key={key} value={key}>
                    {val.label}
                  </SelectItem>
                ))}
                <SelectItem value="custom">Ввести длину окружности</SelectItem>
              </SelectContent>
            </Select>

            {form.wheelSize === 'custom' && (
              <div className="space-y-1">
                <Label htmlFor="customCirc" className="text-xs text-muted-foreground">
                  Длина окружности, мм
                </Label>
                <Input
                  id="customCirc"
                  type="number"
                  min={1000}
                  max={3000}
                  placeholder="2096"
                  value={customCirc}
                  onChange={(e) => setCustomCirc(e.target.value)}
                  className={errors.customCirc ? 'border-destructive' : ''}
                />
                {errors.customCirc && (
                  <p className="text-xs text-destructive">{errors.customCirc}</p>
                )}
              </div>
            )}
          </div>

          <div className="flex gap-2">
            {onCancel && (
              <Button type="button" variant="outline" className="flex-1" onClick={onCancel}>
                Отмена
              </Button>
            )}
            <Button type="submit" className="flex-1">
              {onSave ? 'Сохранить' : 'Добавить участника'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
