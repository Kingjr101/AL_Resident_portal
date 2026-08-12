import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export function StatCard({
  icon: Icon,
  label,
  value,
  hint,
  badge,
  badgeTone = 'default',
}) {
  return (
    <Card className="h-full rounded-2xl border-nobel/40 shadow-soft transition-shadow hover:shadow-lift">
      <CardContent className="flex h-full min-h-[148px] flex-col p-4 sm:p-5">
        <div className="flex items-start justify-between gap-2">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent sm:h-11 sm:w-11">
            {Icon ? (
              <Icon className="h-5 w-5 text-flamingo" />
            ) : null}
          </div>

          {badge != null ? (
            <span
              className={cn(
                'shrink-0 whitespace-nowrap rounded-full px-2 py-1 text-[10px] font-semibold sm:text-xs',
                badgeTone === 'danger'
                  ? 'bg-destructive text-white'
                  : 'bg-secondary/10 text-secondary'
              )}
            >
              {badge}
            </span>
          ) : (
            <span aria-hidden="true" className="h-6" />
          )}
        </div>

        <div className="mt-auto pt-4">
          <div className="font-display text-3xl font-semibold leading-none text-secondary">
            {value}
          </div>

          <div className="mt-2 text-sm leading-tight text-muted-foreground">
            {label}
          </div>

          <div
            className={cn(
              'mt-1 min-h-4 text-xs leading-4 text-muted-foreground/80',
              !hint && 'invisible'
            )}
            aria-hidden={!hint}
          >
            {hint || 'No additional context'}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}