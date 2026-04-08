import { ChevronRight, Moon, PanelLeft, Pencil, Search, Sun } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useTheme } from '../../hooks/useTheme'
import { cn } from '../../lib/utils'
import { Input } from '../ui/Input'

type TopNavbarProps = {
  workspaceName: string
  subspaceName: string
  onOpenMobileSidebar?: () => void
  searchQuery: string
  onSearchChange: (q: string) => void
  onRenameWorkspace?: (name: string) => void | Promise<void>
}

export function TopNavbar({
  workspaceName,
  subspaceName,
  onOpenMobileSidebar,
  searchQuery,
  onSearchChange,
  onRenameWorkspace,
}: TopNavbarProps) {
  const { theme, toggle } = useTheme()
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(workspaceName)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!editing) setDraft(workspaceName)
  }, [workspaceName, editing])

  useEffect(() => {
    if (editing) inputRef.current?.focus()
  }, [editing])

  async function commitRename() {
    const t = draft.trim()
    if (!t) {
      setDraft(workspaceName)
      setEditing(false)
      return
    }
    if (t !== workspaceName) await onRenameWorkspace?.(t)
    setEditing(false)
  }

  return (
    <header className="sticky top-0 z-30 w-full min-w-0 border-b border-subtle/80 bg-[var(--surface-page)]/80 backdrop-blur-xl">
      <div className="flex min-h-14 flex-col gap-3 px-4 py-3 sm:h-16 sm:flex-row sm:items-center sm:gap-4 sm:py-0 md:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            className="inline-flex shrink-0 rounded-xl p-2 text-secondary-ink hover:bg-black/[0.04] md:hidden dark:hover:bg-white/[0.06]"
            onClick={onOpenMobileSidebar}
            aria-label="Abrir menu"
          >
            <PanelLeft className="h-5 w-5" />
          </button>
          <nav className="flex min-w-0 items-center gap-1 text-sm" aria-label="Breadcrumb">
            {editing ? (
              <Input
                ref={inputRef}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onBlur={() => void commitRename()}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    void commitRename()
                  }
                  if (e.key === 'Escape') {
                    setDraft(workspaceName)
                    setEditing(false)
                  }
                }}
                className="h-8 min-w-[8rem] max-w-[14rem] py-1 text-sm font-medium"
                aria-label="Nome do espaço"
              />
            ) : (
              <div className="flex min-w-0 max-w-full items-center gap-1">
                <button
                  type="button"
                  className={cn(
                    'truncate text-left font-medium text-primary-ink',
                    onRenameWorkspace &&
                      'rounded-lg pr-1 hover:bg-black/[0.04] dark:hover:bg-white/[0.06]',
                  )}
                  title={onRenameWorkspace ? 'Editar nome do espaço' : undefined}
                  onClick={() => onRenameWorkspace && setEditing(true)}
                  disabled={!onRenameWorkspace}
                >
                  {workspaceName}
                </button>
                {onRenameWorkspace && (
                  <button
                    type="button"
                    className="shrink-0 rounded-lg p-1 text-secondary-ink hover:bg-black/[0.04] hover:text-primary-ink dark:hover:bg-white/[0.06]"
                    title="Editar nome do espaço"
                    aria-label="Editar nome do espaço"
                    onClick={() => setEditing(true)}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            )}
            <ChevronRight className="h-4 w-4 shrink-0 text-secondary-ink" />
            <span className="truncate text-secondary-ink">{subspaceName}</span>
          </nav>
        </div>

        <div className="relative min-w-0 flex-1 sm:max-w-xl">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary-ink" />
          <Input
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar tarefas…"
            className="w-full pl-10"
            aria-label="Buscar tarefas"
          />
        </div>

        <div className="flex shrink-0 items-center justify-end gap-2 sm:ml-auto">
          <button
            type="button"
            onClick={toggle}
            className={cn(
              'inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-subtle surface-card shadow-soft transition-transform hover:scale-[1.02]',
            )}
            title={theme === 'dark' ? 'Modo claro' : 'Modo escuro'}
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </header>
  )
}
