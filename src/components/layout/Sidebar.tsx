import { motion } from 'framer-motion'
import {
  Anchor,
  ChevronLeft,
  Copy,
  LayoutGrid,
  LogOut,
  Pencil,
  Plus,
  Trash2,
  UserPlus,
} from 'lucide-react'
import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { toast } from 'sonner'
import { useAuth } from '../../contexts/AuthContext'
import { cn } from '../../lib/utils'
import type { Workspace } from '../../types/models'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Modal } from '../ui/Modal'

type SidebarProps = {
  workspaces: Workspace[]
  collapsed: boolean
  onToggleCollapse: () => void
  onNewWorkspace: () => void
  onDeleteWorkspace?: (id: string) => void | Promise<void>
  onRenameWorkspace?: (id: string, name: string) => void | Promise<void>
  mobileOpen?: boolean
  onNavigate?: () => void
}

export function Sidebar({
  workspaces,
  collapsed,
  onToggleCollapse,
  onNewWorkspace,
  onDeleteWorkspace,
  onRenameWorkspace,
  mobileOpen = true,
  onNavigate,
}: SidebarProps) {
  const { user, logout, mode } = useAuth()
  const location = useLocation()
  const [inviteOpen, setInviteOpen] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [workspacePendingDelete, setWorkspacePendingDelete] = useState<Workspace | null>(null)
  const [workspacePendingRename, setWorkspacePendingRename] = useState<Workspace | null>(null)
  const [renameDraft, setRenameDraft] = useState('')

  function copyAppLink() {
    const url = window.location.origin
    void navigator.clipboard.writeText(url).then(
      () => toast.success('Link copiado'),
      () => toast.error('Não foi possível copiar'),
    )
  }

  return (
    <>
      <motion.aside
        initial={false}
        animate={{ width: collapsed ? 72 : 260 }}
        transition={{ type: 'spring', stiffness: 380, damping: 38 }}
        className={cn(
          'fixed left-0 top-0 z-40 flex h-dvh max-h-dvh flex-col border-r border-subtle surface-card shadow-soft',
          'max-md:transition-transform max-md:duration-300',
          mobileOpen ? 'max-md:translate-x-0' : 'max-md:-translate-x-full',
        )}
      >
        <div className="flex h-14 shrink-0 items-center gap-2 border-b border-subtle px-3">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-primary/15 text-primary">
              <Anchor className="h-4 w-4" />
            </span>
            {!collapsed && (
              <span className="truncate font-semibold tracking-tight text-primary-ink">Âncora</span>
            )}
          </div>
          <button
            type="button"
            onClick={onToggleCollapse}
            className="hidden rounded-xl p-2 text-secondary-ink hover:bg-black/[0.04] dark:hover:bg-white/[0.06] md:inline-flex"
            title={collapsed ? 'Expandir' : 'Recolher'}
          >
            <ChevronLeft className={cn('h-4 w-4 transition-transform', collapsed && 'rotate-180')} />
          </button>
        </div>

        <div className="min-h-0 flex flex-1 flex-col gap-1 overflow-y-auto overscroll-contain p-2">
          <p
            className={cn(
              'px-2 pb-1 text-[11px] font-semibold uppercase tracking-wider text-secondary-ink',
              collapsed && 'sr-only',
            )}
          >
            Espaços
          </p>
          {workspaces.map((w) => {
            const isActive =
              location.pathname === `/w/${w.id}` || location.pathname.startsWith(`/w/${w.id}/`)
            return (
              <div
                key={w.id}
                className={cn(
                  'flex min-w-0 items-center gap-0.5 rounded-2xl',
                  isActive
                    ? 'bg-primary/12'
                    : 'text-secondary-ink hover:bg-black/[0.04] hover:text-primary-ink dark:hover:bg-white/[0.06]',
                )}
              >
                <NavLink
                  to={`/w/${w.id}`}
                  title={w.name}
                  onClick={() => onNavigate?.()}
                  className={cn(
                    'group flex min-w-0 flex-1 items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition-colors',
                    isActive
                      ? 'text-primary'
                      : 'text-secondary-ink hover:text-primary-ink',
                  )}
                >
                  <LayoutGrid className="h-4 w-4 shrink-0 opacity-80" />
                  {!collapsed && <span className="truncate">{w.name}</span>}
                </NavLink>
                {!collapsed && (onRenameWorkspace || onDeleteWorkspace) && (
                  <div className="mr-0.5 flex shrink-0 items-center gap-0.5">
                    {onRenameWorkspace && (
                      <button
                        type="button"
                        title="Renomear espaço"
                        aria-label={`Renomear espaço ${w.name}`}
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          setRenameDraft(w.name)
                          setWorkspacePendingRename(w)
                        }}
                        className={cn(
                          'rounded-xl p-2 text-secondary-ink opacity-70 transition-opacity hover:bg-black/[0.06] hover:text-primary-ink hover:opacity-100 dark:hover:bg-white/[0.08]',
                          isActive && 'text-primary opacity-90',
                        )}
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                    )}
                    {onDeleteWorkspace && (
                      <button
                        type="button"
                        title="Excluir espaço"
                        aria-label={`Excluir espaço ${w.name}`}
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          setWorkspacePendingDelete(w)
                        }}
                        className={cn(
                          'rounded-xl p-2 text-secondary-ink opacity-70 transition-opacity hover:bg-red-500/10 hover:text-red-600 hover:opacity-100 dark:hover:text-red-400',
                          isActive && 'text-primary opacity-90',
                        )}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <div className="shrink-0 space-y-2 border-t border-subtle p-2">
          <Button
            type="button"
            variant="secondary"
            className="w-full justify-start gap-2"
            onClick={onNewWorkspace}
            title="Novo espaço"
          >
            <Plus className="h-4 w-4 shrink-0" />
            {!collapsed && <span>Novo espaço</span>}
          </Button>
          <Button
            type="button"
            variant="secondary"
            className="w-full justify-start gap-2"
            onClick={() => setInviteOpen(true)}
            title="Convidar pessoas"
          >
            <UserPlus className="h-4 w-4 shrink-0" />
            {!collapsed && <span>Convidar</span>}
          </Button>
        </div>

        <div className="shrink-0 border-t border-subtle p-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-200/80 text-sm font-semibold text-slate-700 dark:bg-slate-600/80 dark:text-slate-100">
              {(user?.email ?? '?').slice(0, 1).toUpperCase()}
            </div>
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-primary-ink">
                  {mode === 'local' ? 'Modo demo' : 'Conta'}
                </p>
                <p className="truncate text-xs text-secondary-ink">{user?.email}</p>
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={() => void logout()}
            className={cn(
              'mt-2 flex w-full items-center gap-2 rounded-xl px-2 py-2 text-sm text-secondary-ink transition-colors hover:bg-black/[0.04] dark:hover:bg-white/[0.06]',
              collapsed && 'justify-center',
            )}
            title={mode === 'local' ? 'Limpa dados locais e reinicia' : 'Sair da conta'}
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {!collapsed && (mode === 'local' ? 'Encerrar sessão' : 'Sair')}
          </button>
        </div>
      </motion.aside>

      <Modal
        open={workspacePendingDelete !== null}
        onClose={() => setWorkspacePendingDelete(null)}
        title="Excluir espaço?"
        description={
          workspacePendingDelete
            ? `“${workspacePendingDelete.name}” e todos os subespaços, seções e tarefas serão removidos permanentemente.`
            : undefined
        }
      >
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="secondary" onClick={() => setWorkspacePendingDelete(null)}>
              Cancelar
            </Button>
            <Button
              type="button"
              variant="danger"
              onClick={() => {
                const id = workspacePendingDelete?.id
                if (!id) return
                void Promise.resolve(onDeleteWorkspace?.(id)).finally(() => setWorkspacePendingDelete(null))
              }}
            >
              Excluir
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        open={workspacePendingRename !== null}
        onClose={() => setWorkspacePendingRename(null)}
        title="Renomear espaço"
        description="O novo nome aparece na barra lateral e no topo da página."
      >
        <form
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault()
            const id = workspacePendingRename?.id
            const trimmed = renameDraft.trim()
            if (!id || !trimmed) return
            void Promise.resolve(onRenameWorkspace?.(id, trimmed)).finally(() =>
              setWorkspacePendingRename(null),
            )
          }}
        >
          <Input
            autoFocus
            value={renameDraft}
            onChange={(e) => setRenameDraft(e.target.value)}
            placeholder="Nome do espaço"
            aria-label="Novo nome do espaço"
          />
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="secondary" onClick={() => setWorkspacePendingRename(null)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={!renameDraft.trim()}>
              Salvar
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        title="Convidar pessoas"
        description="Compartilhe a Âncora com o time. Com Firebase configurado, cada pessoa usa sua própria conta; no modo demo, use o mesmo navegador ou envie o link."
      >
        <div className="flex flex-col gap-4">
          <Input
            type="email"
            placeholder="E-mail (opcional — registro futuro)"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
          />
          <p className="text-xs text-secondary-ink">
            Por enquanto, convide enviando o endereço do app. Em seguida poderemos enviar convites por
            e-mail com permissões por espaço.
          </p>
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="secondary" onClick={() => setInviteOpen(false)}>
              Fechar
            </Button>
            <Button type="button" className="gap-2" onClick={copyAppLink}>
              <Copy className="h-4 w-4" />
              Copiar link do app
            </Button>
          </div>
        </div>
      </Modal>
    </>
  )
}
