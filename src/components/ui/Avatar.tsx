import { cn } from '../../lib/utils'

function initials(name: string): string {
  const p = name.trim().split(/\s+/)
  if (p.length >= 2) return (p[0][0] + p[1][0]).toUpperCase()
  return name.slice(0, 2).toUpperCase() || '?'
}

const colors = [
  'bg-violet-500/20 text-violet-700 dark:text-violet-300',
  'bg-sky-500/20 text-sky-700 dark:text-sky-300',
  'bg-amber-500/20 text-amber-800 dark:text-amber-200',
  'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300',
]

export function Avatar({ name, className }: { name: string; className?: string }) {
  const hash = name.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  const color = colors[hash % colors.length]
  return (
    <span
      className={cn(
        'inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold',
        color,
        className,
      )}
      title={name}
    >
      {initials(name)}
    </span>
  )
}
