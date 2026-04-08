import { motion } from 'framer-motion'
import { ChevronLeft, Copy, LayoutGrid, LogOut, Plus, Sparkles, UserPlus } from 'lucide-react'
import { useState } from 'react'
import { NavLink } from 'react-router-dom'
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
  mobileOpen?: boolean
  onNavigate?: () => void
}

export function Sidebar({
  workspaces,
  collapsed,
  onToggleCollapse,
  onNewWorkspace,
  mobileOpen = true,
  onNavigate,
}: SidebarProps) {
  const { user, logout, mode } = useAuth()
  const [inviteOpen, setInviteOpen] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')

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
              <Sparkles className="h-4 w-4" />
            </span>
            {!collapsed && (
              <span className="truncate font-semibold tracking-tight text-primary-ink">Lampião</span>
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
            Workspaces
          </p>
          {workspaces.map((w) => (
            <NavLink
              key={w.id}
              to={`/w/${w.id}`}
              title={w.name}
              onClick={() => onNavigate?.()}
              className={({ isActive }) =>
                cn(
                  'group flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary/12 text-primary'
                    : 'text-secondary-ink hover:bg-black/[0.04] hover:text-primary-ink dark:hover:bg-white/[0.06]',
                )
              }
            >
              <LayoutGrid className="h-4 w-4 shrink-0 opacity-80" />
              {!collapsed && <span className="truncate">{w.name}</span>}
            </NavLink>
          ))}
        </div>

        <div className="shrink-0 space-y-2 border-t border-subtle p-2">
          <Button
            type="button"
            variant="secondary"
            className="w-full justify-start gap-2"
            onClick={onNewWorkspace}
            title="Novo workspace"
          >
            <Plus className="h-4 w-4 shrink-0" />
            {!collapsed && <span>Novo workspace</span>}
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
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        title="Convidar pessoas"
        description="Compartilhe o Lampião com o time. Com Firebase configurado, cada pessoa usa sua própria conta; no modo demo, use o mesmo navegador ou envie o link."
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
            e-mail com permissões por workspace.
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
