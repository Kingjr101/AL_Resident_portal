import { Sparkles } from 'lucide-react'

export function EmptyState({ icon: Icon = Sparkles, title = 'Nothing here yet', message, action }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6 rounded-2xl border border-dashed border-nobel/60 bg-white/60">
      <div className="h-16 w-16 rounded-2xl bg-accent flex items-center justify-center mb-4">
        <Icon className="h-8 w-8 text-flamingo" />
      </div>
      <h3 className="font-display text-xl text-secondary font-semibold">{title}</h3>
      {message ? <p className="mt-2 text-sm text-muted-foreground max-w-sm">{message}</p> : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  )
}
