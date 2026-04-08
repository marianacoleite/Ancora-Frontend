import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cn } from '../../lib/utils'

const variants = {
  primary:
    'bg-primary text-white shadow-soft hover:bg-blue-600 focus-visible:ring-2 focus-visible:ring-primary/40',
  secondary:
    'surface-card border border-subtle text-primary-ink shadow-soft hover:bg-black/[0.03] dark:hover:bg-white/[0.06]',
  ghost: 'text-secondary-ink hover:bg-black/[0.04] dark:hover:bg-white/[0.06]',
  danger: 'bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500/15',
} as const

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof variants
  size?: 'sm' | 'md' | 'lg'
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = 'primary', size = 'md', type = 'button', ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-2xl font-medium transition-all duration-200',
        'focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50',
        variants[variant],
        size === 'sm' && 'px-3 py-1.5 text-sm',
        size === 'md' && 'px-4 py-2.5 text-sm',
        size === 'lg' && 'px-5 py-3 text-base',
        className,
      )}
      {...props}
    />
  )
})
