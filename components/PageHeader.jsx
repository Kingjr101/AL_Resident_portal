export function PageHeader({ title, subtitle, eyebrow, action }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-8">
      <div>
        {eyebrow ? (
          <p className="text-xs font-semibold uppercase tracking-widest text-flamingo mb-2">{eyebrow}</p>
        ) : null}
        <h1 className="font-display text-3xl md:text-4xl font-semibold text-secondary leading-tight">{title}</h1>
        {subtitle ? <p className="mt-2 text-muted-foreground max-w-2xl">{subtitle}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  )
}
