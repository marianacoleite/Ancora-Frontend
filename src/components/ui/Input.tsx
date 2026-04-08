import { forwardRef, type InputHTMLAttributes } from 'react'
import { cn } from '../../lib/utils'

export type InputProps = InputHTMLAttributes<HTMLInputElement>

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, ...props },
  ref,
) {
  return (
    <input
      ref={ref}
      className={cn(
        'w-full rounded-2xl border border-subtle bg-[var(--surface-card)] px-4 py-3 text-sm text-primary-ink shadow-inner',
        'placeholder:text-secondary-ink/70',
        'focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25',
        'transition-all duration-200',
        className,
      )}
      {...props}
    />
  )
})
