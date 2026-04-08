import { AnimatePresence, motion } from 'framer-motion'
import { useMemo, useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAppData } from '../../contexts/AppDataContext'
import { useAuth } from '../../contexts/AuthContext'
import { cn } from '../../lib/utils'
import { Modal } from '../ui/Modal'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'
import { Sidebar } from './Sidebar'
import { Skeleton } from '../ui/Skeleton'

export type AppShellOutletContext = {
  sidebarCollapsed: boolean
  sidebarWidthPx: number
  openMobileSidebar: () => void
  closeMobileSidebar: () => void
}

export function AppShell() {
  const { data, loading, addWorkspace, deleteWorkspace, renameWorkspace } = useAppData()
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [workspaceModal, setWorkspaceModal] = useState(false)
  const [workspaceName, setWorkspaceName] = useState('')

  const workspaces = data?.workspaces ?? []
  const sidebarWidthPx = collapsed ? 72 : 260

  const defaultRedirect = useMemo(() => {
    if (!data || data.workspaces.length === 0) return null
    const w = data.workspaces[0]
    const sub = data.subspaces.find((s) => s.workspaceId === w.id)
    if (!sub) return `/w/${w.id}`
    return `/w/${w.id}/s/${sub.id}`
  }, [data])

  if (loading || !user) {
    return (
      <div className="flex min-h-dvh surface-page p-8">
        <div className="flex w-full max-w-3xl flex-col gap-4">
          <Skeleton className="h-10 w-48 rounded-2xl" />
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
      </div>
    )
  }

  if (!data || workspaces.length === 0) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-6 surface-page px-6">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-primary-ink">Nenhum espaço</h1>
          <p className="mt-2 text-secondary-ink">
            Crie seu primeiro espaço para organizar subespaços e tarefas.
          </p>
        </div>
        <Button type="button" onClick={() => setWorkspaceModal(true)}>
          Criar espaço
        </Button>
        <Modal
          open={workspaceModal}
          onClose={() => setWorkspaceModal(false)}
          title="Novo espaço"
          description="Um espaço agrupa seus projetos e equipes."
        >
          <form
            className="flex flex-col gap-4"
            onSubmit={async (e) => {
              e.preventDefault()
              const wid = await addWorkspace(workspaceName)
              setWorkspaceName('')
              setWorkspaceModal(false)
              if (wid) navigate(`/w/${wid}`)
              else if (defaultRedirect) navigate(defaultRedirect)
            }}
          >
            <Input
              autoFocus
              placeholder="Ex: Produto, Infra, Time Mobile…"
              value={workspaceName}
              onChange={(e) => setWorkspaceName(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="secondary" onClick={() => setWorkspaceModal(false)}>
                Cancelar
              </Button>
              <Button type="submit">Criar</Button>
            </div>
          </form>
        </Modal>
      </div>
    )
  }

  const outletContext: AppShellOutletContext = {
    sidebarCollapsed: collapsed,
    sidebarWidthPx,
    openMobileSidebar: () => setMobileOpen(true),
    closeMobileSidebar: () => setMobileOpen(false),
  }

  async function handleDeleteWorkspace(id: string) {
    const others = workspaces.filter((w) => w.id !== id)
    const wasViewing =
      location.pathname === `/w/${id}` || location.pathname.startsWith(`/w/${id}/`)
    await deleteWorkspace(id)
    if (!wasViewing) return
    if (others.length === 0) {
      navigate('/', { replace: true })
      return
    }
    const w = others[0]
    const sub = data?.subspaces.find((s) => s.workspaceId === w.id)
    navigate(sub ? `/w/${w.id}/s/${sub.id}` : `/w/${w.id}`, { replace: true })
  }

  return (
    <div className="min-h-dvh surface-page">
      <Sidebar
        workspaces={workspaces}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((c) => !c)}
        onNewWorkspace={() => setWorkspaceModal(true)}
        onDeleteWorkspace={handleDeleteWorkspace}
        onRenameWorkspace={(id, name) => void renameWorkspace(id, name)}
        mobileOpen={mobileOpen}
        onNavigate={() => setMobileOpen(false)}
      />

      <AnimatePresence>
        {mobileOpen && (
          <motion.button
            type="button"
            className="fixed inset-0 z-30 bg-slate-900/40 backdrop-blur-sm md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileOpen(false)}
            aria-label="Fechar menu"
          />
        )}
      </AnimatePresence>

      <main
        className={cn(
          'min-h-dvh min-w-0 transition-[padding] duration-300 ease-out max-md:pl-0',
          collapsed ? 'md:pl-[72px]' : 'md:pl-[260px]',
        )}
      >
        <Outlet context={outletContext} />
      </main>

      <Modal
        open={workspaceModal}
        onClose={() => setWorkspaceModal(false)}
        title="Novo espaço"
        description="Nomeie seu espaço — você pode mudar depois."
      >
        <form
          className="flex flex-col gap-4"
          onSubmit={async (e) => {
            e.preventDefault()
            const wid = await addWorkspace(workspaceName)
            setWorkspaceName('')
            setWorkspaceModal(false)
            if (wid) navigate(`/w/${wid}`)
          }}
        >
          <Input
            autoFocus
            placeholder="Nome do espaço"
            value={workspaceName}
            onChange={(e) => setWorkspaceName(e.target.value)}
          />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setWorkspaceModal(false)}>
              Cancelar
            </Button>
            <Button type="submit">Criar espaço</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
