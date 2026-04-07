import { createFileRoute } from '@tanstack/react-router'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const SettingsPage = () => {
  const buildDate = new Date(__APP_BUILD_TIME__).toLocaleString('ru-RU', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Настройки</h1>
        <p className="text-muted-foreground mt-1">Информация о приложении</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Кругомер</CardTitle>
          <CardDescription>Хронометраж на велодроме</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p className="pt-1 text-muted-foreground">Специально для Ночной Лиги © 2026</p>
          <p>
            <span className="text-muted-foreground">Версия: </span>
            <span className="font-medium">{__APP_VERSION__}</span>
          </p>
          <p>
            <span className="text-muted-foreground">Билд: </span>
            <span className="font-medium">{buildDate}</span>
          </p>
          <p>
            <span className="text-muted-foreground">Commit: </span>
            <span className="font-medium">{__APP_BUILD_SHA__}</span>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

export const Route = createFileRoute('/settings')({
  component: SettingsPage,
})
