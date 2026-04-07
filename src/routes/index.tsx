import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { CompetitionForm } from '@/components/CompetitionForm'

const SetupPage = () => {
  const navigate = useNavigate()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Кругомер</h1>
        <p className="text-muted-foreground mt-1">Настройка соревнования</p>
      </div>
      <CompetitionForm onSubmit={() => navigate({ to: '/participants' })} />
    </div>
  )
}

export const Route = createFileRoute('/')({
  component: SetupPage,
})
