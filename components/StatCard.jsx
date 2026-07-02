import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export function StatCard({ icon: Icon, label, value, hint, badge, badgeTone = 'default' }) {
  return (
    <Card className="rounded-2xl border-nobel/40 shadow-soft hover:shadow-lift transition-shadow">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="h-11 w-11 rounded-xl bg-accent flex items-center justify-center">
            {Icon ? <Icon className="h-5 w-5 text-flamingo" /> : null}
          </div>
          {badge != null ? (
            <span className={cn(
              'text-xs font-semibold px-2 py-1 rounded-full',
              badgeTone === 'danger' ? 'bg-destructive text-white' : 'bg-secondary/10 text-secondary'
            )}>{badge}</span>
          ) : null}
        </div>
        <div className="mt-4">
          <div className="text-3xl font-semibold text-secondary font-display">{value}</div>
          <div className="text-sm text-muted-foreground mt-1">{label}</div>
          {hint ? <div className="text-xs text-muted-foreground/80 mt-1">{hint}</div> : null}
        </div>
      </CardContent>
    </Card>
  )
}
