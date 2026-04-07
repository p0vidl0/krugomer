import { useEffect, useRef, useState } from 'react'
import { createRootRoute, Link, Outlet, useRouterState } from '@tanstack/react-router'
import { Check, Monitor, Moon, Settings, Sun, Timer, Users, Trophy, Cog, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTheme, type ThemeMode } from '@/hooks/useTheme'

const NavLink = ({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) => (
  <Link
    to={to}
    className="flex flex-col items-center gap-1 px-3 py-2 text-xs text-muted-foreground transition-colors [&.active]:text-foreground"
    activeOptions={{ exact: to === '/' }}
  >
    {icon}
    <span>{label}</span>
  </Link>
)

const RootLayout = () => {
  const { themeMode, setThemeMode } = useTheme()
  const [isThemeMenuOpen, setThemeMenuOpen] = useState(false)
  const themeMenuRef = useRef<HTMLDivElement>(null)
  const pathname = useRouterState({ select: (state) => state.location.pathname })
  const isSettingsPage = pathname === '/settings'

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!themeMenuRef.current?.contains(event.target as Node)) {
        setThemeMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (!isSettingsPage) setThemeMenuOpen(false)
  }, [isSettingsPage])

  const themeOptions: Array<{ value: ThemeMode; label: string; icon: React.ReactNode }> = [
    { value: 'light', label: 'Светлая', icon: <Sun className="h-4 w-4" /> },
    { value: 'dark', label: 'Темная', icon: <Moon className="h-4 w-4" /> },
    { value: 'system', label: 'Авто', icon: <Monitor className="h-4 w-4" /> },
  ]

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <main className="flex-1 container mx-auto px-4 py-6 max-w-2xl pb-24">
        <div className="mb-4 flex justify-end items-center gap-2">
          {isSettingsPage ? (
            <>
              <div className="relative" ref={themeMenuRef}>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  aria-label="Выбрать тему"
                  onClick={() => setThemeMenuOpen((prev) => !prev)}
                >
                  <Sun className="h-4 w-4 dark:hidden" />
                  <Moon className="hidden h-4 w-4 dark:block" />
                </Button>
                {isThemeMenuOpen ? (
                  <div className="absolute right-0 top-11 w-44 rounded-md border bg-popover text-popover-foreground shadow-md p-1 z-50">
                    {themeOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        className="w-full flex items-center justify-between rounded-sm px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground"
                        onClick={() => {
                          setThemeMode(option.value)
                          setThemeMenuOpen(false)
                        }}
                      >
                        <span className="flex items-center gap-2">
                          {option.icon}
                          {option.label}
                        </span>
                        {themeMode === option.value ? <Check className="h-4 w-4" /> : null}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
              <Button asChild type="button" variant="outline" size="icon" aria-label="Закрыть настройки">
                <Link to="/">
                  <X className="h-4 w-4" />
                </Link>
              </Button>
            </>
          ) : (
            <Button asChild type="button" variant="outline" size="icon" aria-label="Открыть настройки">
              <Link to="/settings">
                <Cog className="h-4 w-4" />
              </Link>
            </Button>
          )}
        </div>
        <Outlet />
      </main>

      {/* Mobile bottom navigation */}
      <nav className="fixed bottom-0 left-0 right-0 border-t bg-background z-50">
        <div className="flex justify-around items-center h-16 max-w-2xl mx-auto">
          <NavLink to="/" icon={<Settings className="h-5 w-5" />} label="Старт" />
          <NavLink to="/participants" icon={<Users className="h-5 w-5" />} label="Участники" />
          <NavLink to="/timing" icon={<Timer className="h-5 w-5" />} label="Хронометраж" />
          <NavLink to="/results" icon={<Trophy className="h-5 w-5" />} label="Результаты" />
        </div>
      </nav>
    </div>
  )
}

export const Route = createRootRoute({
  component: RootLayout,
})
