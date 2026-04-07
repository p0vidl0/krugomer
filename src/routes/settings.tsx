import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

const SettingsPage = () => {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isInstalled, setInstalled] = useState(false)
  const [isIos, setIos] = useState(false)
  const [isMobile, setMobile] = useState(false)

  const buildDate = new Date(__APP_BUILD_TIME__).toLocaleString('ru-RU', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })

  useEffect(() => {
    const inStandalone = window.matchMedia('(display-mode: standalone)').matches
    const iosStandalone = (window.navigator as Navigator & { standalone?: boolean }).standalone === true
    setInstalled(inStandalone || iosStandalone)

    const ua = window.navigator.userAgent.toLowerCase()
    const isIosDevice = /iphone|ipad|ipod/.test(ua)
    const isSafari = /safari/.test(ua) && !/crios|fxios|edgios/.test(ua)
    setIos(isIosDevice && isSafari)

    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault()
      setInstallPrompt(event as BeforeInstallPromptEvent)
    }

    const onInstalled = () => {
      setInstalled(true)
      setInstallPrompt(null)
    }

    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt)
    window.addEventListener('appinstalled', onInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  useEffect(() => {
    const media = window.matchMedia('(max-width: 768px), (pointer: coarse)')
    const update = () => setMobile(media.matches)
    update()
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])

  const handleInstallClick = async () => {
    if (!installPrompt) return
    await installPrompt.prompt()
    const choice = await installPrompt.userChoice
    if (choice.outcome === 'accepted') {
      setInstallPrompt(null)
    }
  }

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

      {isMobile && (
        <Card>
          <CardHeader>
            <CardTitle>Установка приложения</CardTitle>
            <CardDescription>Добавьте Кругомер на экран телефона</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {!isInstalled && installPrompt && (
              <Button onClick={handleInstallClick}>Установить приложение</Button>
            )}
            {!isInstalled && !installPrompt && isIos && (
              <p className="text-sm text-muted-foreground">
                В Safari нажмите «Поделиться» и выберите «На экран Домой».
              </p>
            )}
            {!isInstalled && !installPrompt && !isIos && (
              <p className="text-sm text-muted-foreground">
                Откройте сайт в браузере на телефоне и используйте пункт «Установить приложение».
              </p>
            )}
            {isInstalled && (
              <p className="text-sm text-muted-foreground">Приложение уже установлено.</p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export const Route = createFileRoute('/settings')({
  component: SettingsPage,
})
