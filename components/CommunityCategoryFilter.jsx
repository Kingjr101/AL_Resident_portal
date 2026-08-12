'use client'
import { cn } from '@/lib/utils'

export const CATEGORIES = [
  { value: 'ALL', label: 'All' },
  { value: 'NEWSLETTER', label: 'Newsletter' },
  { value: 'ANNOUNCEMENT', label: 'Notices' },
  { value: 'EVENT', label: 'Events' },
  { value: 'PET_HELP', label: 'Pet Help' },
  { value: 'HELP_WANTED', label: 'Help Wanted' },
  { value: 'GIVEAWAY', label: 'Giveaways' },
  { value: 'LOST_AND_FOUND', label: 'Lost & Found' },
]

export function CommunityCategoryFilter({ active, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {CATEGORIES.map(c => {
        const isActive = active === c.value
        return (
          <button
            key={c.value}
            onClick={() => onChange(c.value)}
            className={cn(
              'rounded-full border px-3 py-1.5 text-sm font-medium transition-colors',
              isActive
                ? 'bg-secondary text-white border-secondary'
                : 'bg-white text-ink/70 border-nobel/50 hover:border-secondary hover:text-secondary'
            )}
          >
            {c.label}
          </button>
        )
      })}
    </div>
  )
}