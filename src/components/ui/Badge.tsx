import type { TaskStatus } from '../../types/models'
import { cn } from '../../lib/utils'

const statusStyles: Record<TaskStatus, string> = {
  pending: 'bg-red-500/15 text-red-700 dark:text-red-300',
  in_progress: 'bg-amber-400/20 text-amber-900 dark:text-amber-200',
  done: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300',
}

export const taskStatusSelectStyles: Record<TaskStatus, string> = {
  pending:
    'border-red-500/35 bg-red-500/10 text-red-800 dark:border-red-500/40 dark:bg-red-500/15 dark:text-red-200',
  in_progress:
    'border-amber-500/35 bg-amber-400/15 text-amber-950 dark:border-amber-500/40 dark:bg-amber-500/15 dark:text-amber-100',
  done:
    'border-emerald-500/35 bg-emerald-500/10 text-emerald-800 dark:border-emerald-500/40 dark:bg-emerald-500/15 dark:text-emerald-200',
}

const statusLabel: Record<TaskStatus, string> = {
  pending: 'Pendente',
  in_progress: 'Em andamento',
  done: 'Concluído',
}

export function StatusBadge({ status }: { status: TaskStatus }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        statusStyles[status],
      )}
    >
      {statusLabel[status]}
    </span>
  )
}

export function TagChip({ label }: { label: string }) {
  return (
    <span className="inline-flex max-w-[120px] truncate rounded-lg bg-black/[0.04] px-2 py-0.5 text-xs text-secondary-ink dark:bg-white/[0.08]">
      {label}
    </span>
  )
}
