import { cn } from '../../lib/utils'

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-gradient-to-r from-slate-200/80 via-slate-100 to-slate-200/80 dark:from-slate-700/80 dark:via-slate-600/50 dark:to-slate-700/80',
        className,
      )}
    />
  )
}
