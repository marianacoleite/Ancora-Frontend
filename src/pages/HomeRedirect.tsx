import { Navigate } from 'react-router-dom'
import { useAppData } from '../contexts/AppDataContext'
import { Skeleton } from '../components/ui/Skeleton'

export function HomeRedirect() {
  const { data, loading } = useAppData()

  if (loading || !data) {
    return (
      <div className="flex min-h-dvh items-center justify-center surface-page p-8">
        <Skeleton className="h-12 w-64 rounded-2xl" />
      </div>
    )
  }

  if (data.workspaces.length === 0) {
    return <Navigate to="/" replace />
  }

  const w = data.workspaces[0]
  const sub = data.subspaces.find((s) => s.workspaceId === w.id)
  if (!sub) return <Navigate to={`/w/${w.id}`} replace />
  return <Navigate to={`/w/${w.id}/s/${sub.id}`} replace />
}
