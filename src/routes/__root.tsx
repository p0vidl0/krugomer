import { createRootRoute, Link, Outlet } from '@tanstack/react-router'
import { Timer, Users, Trophy, Settings } from 'lucide-react'

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

const RootLayout = () => (
  <div className="min-h-screen bg-background text-foreground flex flex-col">
    <main className="flex-1 container mx-auto px-4 py-6 max-w-2xl pb-24">
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

export const Route = createRootRoute({
  component: RootLayout,
})
