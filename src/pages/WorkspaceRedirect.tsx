import { FolderOpen, Moon, PanelLeft, Plus, Sparkles, Sun } from 'lucide-react'
import { useState } from 'react'
import { Navigate, useNavigate, useOutletContext, useParams } from 'react-router-dom'
import type { AppShellOutletContext } from '../components/layout/AppShell'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Modal } from '../components/ui/Modal'
import { Skeleton } from '../components/ui/Skeleton'
import { useAppData } from '../contexts/AppDataContext'
import { useTheme } from '../hooks/useTheme'
import { cn } from '../lib/utils'

export function WorkspaceRedirect() {
  const { workspaceId } = useParams()
  const navigate = useNavigate()
  const ctx = useOutletContext<AppShellOutletContext>()
  const { data, loading, addSubspace } = useAppData()
  const { theme, toggle } = useTheme()
  const [modalOpen, setModalOpen] = useState(false)
  const [name, setName] = useState('')

  if (loading || !data || !workspaceId) {
    return (
      <div className="flex min-h-dvh items-center justify-center surface-page p-8">
        <Skeleton className="h-12 w-64 rounded-2xl" />
      </div>
    )
  }

  const workspace = data.workspaces.find((w) => w.id === workspaceId)
  const subs = data.subspaces
    .filter((s) => s.workspaceId === workspaceId)
    .sort((a, b) => a.order - b.order)
  const first = subs[0]

  if (first) {
    return <Navigate to={`/w/${workspaceId}/s/${first.id}`} replace />
  }

  if (!workspace) {
    return (
      <div className="flex min-h-dvh items-center justify-center px-6 text-center text-secondary-ink">
        Workspace não encontrado.
      </div>
    )
  }

  return (
    <div className="min-h-dvh w-full min-w-0 overflow-x-hidden surface-page">
      <header className="sticky top-0 z-30 flex flex-col gap-3 border-b border-subtle/80 bg-[var(--surface-page)]/90 px-4 py-3 backdrop-blur-xl sm:h-auto sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            className="inline-flex rounded-xl p-2 text-secondary-ink hover:bg-black/[0.04] md:hidden dark:hover:bg-white/[0.06]"
            onClick={() => ctx?.openMobileSidebar()}
            aria-label="Abrir menu"
          >
            <PanelLeft className="h-5 w-5" />
          </button>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-primary-ink">{workspace.name}</p>
            <p className="text-xs text-secondary-ink">Sem subespaços ainda</p>
          </div>
        </div>
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            type="button"
            onClick={toggle}
            className={cn(
              'inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-subtle surface-card shadow-soft',
            )}
            title={theme === 'dark' ? 'Modo claro' : 'Modo escuro'}
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        </div>
      </header>

      <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-16 text-center md:py-24">
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/12 text-primary">
          <FolderOpen className="h-8 w-8" />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-primary-ink">
          Crie o primeiro subespaço
        </h1>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-secondary-ink">
          Cada workspace precisa de pelo menos um subespaço (ex.: Backend, Sprint 1). Depois você
          adiciona seções e tarefas.
        </p>
        <Button type="button" className="mt-8 gap-2" onClick={() => setModalOpen(true)}>
          <Plus className="h-4 w-4" />
          Novo subespaço
        </Button>
        <p className="mt-8 flex items-center gap-2 text-xs text-secondary-ink">
          <Sparkles className="h-3.5 w-3.5" />
          Dica: use subespaços como áreas do produto ou squads.
        </p>
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Novo subespaço"
        description={`Em "${workspace.name}"`}
      >
        <form
          className="flex flex-col gap-4"
          onSubmit={async (e) => {
            e.preventDefault()
            const sid = await addSubspace(workspaceId, name)
            setName('')
            setModalOpen(false)
            if (sid) navigate(`/w/${workspaceId}/s/${sid}`, { replace: true })
          }}
        >
          <Input
            autoFocus
            placeholder="Ex: Backend, Mobile, Infra…"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit">Criar e abrir</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
