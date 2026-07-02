'use client'
import { cn } from '@/lib/utils'

// tags: [{ label, count }]
export function InterestTagCloud({ tags = [] }) {
  if (!tags.length) return null
  const max = Math.max(...tags.map(t => t.count))
  const min = Math.min(...tags.map(t => t.count))
  const sizeFor = (c) => {
    if (max === min) return 'text-base'
    const r = (c - min) / (max - min)
    if (r > 0.75) return 'text-2xl'
    if (r > 0.5) return 'text-xl'
    if (r > 0.25) return 'text-lg'
    return 'text-sm'
  }
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-2 items-center">
      {tags.map((t, i) => (
        <span key={t.label}
          className={cn('capitalize font-display font-semibold leading-none', sizeFor(t.count),
            i % 2 === 0 ? 'text-flamingo' : 'text-secondary')}>
          {t.label}
          <span className="align-super text-[0.6em] text-muted-foreground ml-0.5">{t.count}</span>
        </span>
      ))}
    </div>
  )
}
