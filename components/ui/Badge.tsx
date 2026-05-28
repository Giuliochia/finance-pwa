import { cn } from '@/lib/utils'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'income' | 'expense' | 'neutral' | 'warning'
  className?: string
}

export function Badge({ children, variant = 'neutral', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
        {
          'bg-emerald-500/15 text-emerald-400': variant === 'income',
          'bg-red-500/15 text-red-400': variant === 'expense',
          'bg-zinc-700/50 text-zinc-400': variant === 'neutral',
          'bg-amber-500/15 text-amber-400': variant === 'warning',
        },
        className,
      )}
    >
      {children}
    </span>
  )
}
