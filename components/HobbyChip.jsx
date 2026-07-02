'use client'
import { cn } from '@/lib/utils'

export function HobbyChip({ label, active = false, onClick, size = 'md', className }) {
  const clickable = typeof onClick === 'function'
  const Comp = clickable ? 'button' : 'span'
  return (
    <Comp
      type={clickable ? 'button' : undefined}
      onClick={onClick}
      className={cn(
        'inline-flex items-center rounded-full border font-medium transition-colors capitalize',
        size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm',
        active
          ? 'bg-flamingo text-white border-flamingo shadow-soft'
          : 'bg-white text-ink/80 border-nobel/50',
        clickable && !active && 'hover:border-flamingo hover:text-flamingo',
        className
      )}
    >
      {label}
    </Comp>
  )
}
