import { ChevronDown } from 'lucide-react'
import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import type { TaskStatus } from '../../types/models'
import { cn } from '../../lib/utils'
import { taskStatusSelectStyles } from './Badge'

const OPTIONS: { value: TaskStatus; label: string }[] = [
  { value: 'pending', label: 'Pendente' },
  { value: 'in_progress', label: 'Em andamento' },
  { value: 'done', label: 'Concluído' },
]

const menuItemActive: Record<TaskStatus, string> = {
  pending:
    'bg-red-500/15 text-red-800 ring-1 ring-red-500/20 dark:text-red-200 dark:ring-red-500/25',
  in_progress:
    'bg-amber-400/15 text-amber-950 ring-1 ring-amber-500/20 dark:text-amber-100 dark:ring-amber-500/25',
  done:
    'bg-emerald-500/15 text-emerald-800 ring-1 ring-emerald-500/20 dark:text-emerald-200 dark:ring-emerald-500/25',
}

type TaskStatusSelectProps = {
  value: TaskStatus
  onChange: (value: TaskStatus) => void
  variant?: 'compact' | 'comfortable'
  'aria-label'?: string
  className?: string
}

export function TaskStatusSelect({
  value,
  onChange,
  variant = 'compact',
  'aria-label': ariaLabel = 'Status',
  className,
}: TaskStatusSelectProps) {
  const [open, setOpen] = useState(false)
  const [coords, setCoords] = useState<{ top: number; left: number; width: number } | null>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLUListElement>(null)
  const listId = useId()

  const isComfortable = variant === 'comfortable'

  useLayoutEffect(() => {
    if (!open) {
      setCoords(null)
      return
    }
    const update = () => {
      const el = buttonRef.current
      if (!el) return
      const r = el.getBoundingClientRect()
      setCoords({ top: r.bottom + 6, left: r.left, width: r.width })
    }
    update()
    window.addEventListener('scroll', update, true)
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update, true)
      window.removeEventListener('resize', update)
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => {
      const t = e.target as Node
      if (buttonRef.current?.contains(t) || menuRef.current?.contains(t)) return
      setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const menu =
    open && coords && typeof document !== 'undefined' ? (
      <ul
        ref={menuRef}
        id={listId}
        role="listbox"
        aria-label={ariaLabel}
        style={{
          position: 'fixed',
          top: coords.top,
          left: coords.left,
          width: isComfortable ? coords.width : undefined,
          minWidth: isComfortable ? coords.width : Math.max(coords.width, 176),
          zIndex: 100,
        }}
        className="overflow-hidden rounded-xl border border-subtle bg-[var(--surface-card)] p-1.5 shadow-elevated"
      >
        {OPTIONS.map((opt) => {
          const selected = opt.value === value
          return (
            <li key={opt.value} role="presentation">
              <button
                type="button"
                role="option"
                aria-selected={selected}
                onClick={() => {
                  onChange(opt.value)
                  setOpen(false)
                }}
                className={cn(
                  'flex w-full cursor-pointer items-center rounded-lg px-3 py-2 text-left font-medium transition-colors',
                  isComfortable ? 'text-sm' : 'text-xs',
                  selected
                    ? menuItemActive[opt.value]
                    : 'text-primary-ink hover:bg-black/[0.05] dark:hover:bg-white/[0.06]',
                )}
              >
                {opt.label}
              </button>
            </li>
          )
        })}
      </ul>
    ) : null

  return (
    <div className={cn('relative', isComfortable && 'w-full', className)}>
      <button
        ref={buttonRef}
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        onClick={() => setOpen((o) => !o)}
        className={cn(
          'inline-flex w-full cursor-pointer items-center justify-between gap-2 border font-medium transition-colors',
          isComfortable
            ? 'rounded-2xl px-4 py-3 text-sm'
            : 'max-w-[160px] rounded-xl px-2 py-1.5 text-xs',
          taskStatusSelectStyles[value],
        )}
      >
        <span className="min-w-0 truncate">{OPTIONS.find((o) => o.value === value)?.label}</span>
        <ChevronDown
          className={cn(
            'shrink-0 opacity-70 transition-transform duration-200',
            open && 'rotate-180',
            isComfortable ? 'h-4 w-4' : 'h-3.5 w-3.5',
          )}
          aria-hidden
        />
      </button>
      {menu ? createPortal(menu, document.body) : null}
    </div>
  )
}
