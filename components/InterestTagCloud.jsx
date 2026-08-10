'use client'
import { cn } from '@/lib/utils'

// tags: [{ label, count }]
export function InterestTagCloud({ tags = [] }) {
  if (!tags.length) return null

  // Sort by count so the biggest chips lead
  const sorted = [...tags].sort((a, b) => b.count - a.count)
  const max = Math.max(...sorted.map(t => t.count))
  const min = Math.min(...sorted.map(t => t.count))
  const total = sorted.reduce((s, t) => s + t.count, 0)

  // ratio 0..1 for scaling
  const ratio = (c) => (max === min ? 1 : (c - min) / (max - min))

  const sizeFor = (c) => {
    const r = ratio(c)
    if (r > 0.75) return 'text-xl px-4 py-2'
    if (r > 0.5) return 'text-lg px-3.5 py-1.5'
    if (r > 0.25) return 'text-base px-3 py-1.5'
    return 'text-sm px-2.5 py-1'
  }

  // background opacity scales with popularity (flamingo orange)
  const styleFor = (c) => {
    const r = ratio(c)
    const opacity = 0.15 + r * 0.85 // 0.15 → 1.0
    return {
      backgroundColor: `rgba(241, 90, 37, ${opacity})`,
      color: r > 0.45 ? '#ffffff' : '#7a2c10',
      borderColor: `rgba(241, 90, 37, ${Math.min(1, opacity + 0.1)})`,
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-wrap gap-2.5 items-center content-start flex-1">
        {sorted.map((t) => (
          <span
            key={t.label}
            style={styleFor(t.count)}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full border font-display font-semibold capitalize leading-none transition-transform hover:scale-105 shadow-soft',
              sizeFor(t.count)
            )}
          >
            {t.label}
            <span className="text-[0.7em] font-bold opacity-80 rounded-full bg-white/25 px-1.5 py-0.5">
              {t.count}
            </span>
          </span>
        ))}
      </div>
      <p className="mt-4 pt-3 border-t border-nobel/30 text-xs text-muted-foreground">
        {sorted.length} interests across {total} resident mentions
      </p>
    </div>
  )
}