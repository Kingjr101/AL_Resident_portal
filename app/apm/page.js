'use client'
import { useEffect, useState } from 'react'
import { CalendarCheck, Star, TrendingUp, Target, Sparkles, Users } from 'lucide-react'
import { AppShell } from '@/components/AppShell'
import { PageHeader } from '@/components/PageHeader'
import { StatCard } from '@/components/StatCard'
import { EmptyState } from '@/components/EmptyState'
import { MotionFade } from '@/components/MotionFade'
import { HobbyChip } from '@/components/HobbyChip'
import { InterestTagCloud } from '@/components/InterestTagCloud'
import { RadarChart } from '@/components/charts/RadarChart'
import { RadialChart } from '@/components/charts/RadialChart'
import { BarChart } from '@/components/charts/BarChart'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

const fmt = (d) => new Date(d).toLocaleDateString('en-CA', { month: 'short', day: 'numeric' })
const CATS = ['friendliness', 'professionalism', 'knowledge', 'communication', 'overallExperience']

function ApmInner() {
  const [data, setData] = useState(null)
  useEffect(() => { fetch('/api/apm/overview', { credentials: 'include' }).then(r => r.json()).then(setData) }, [])
  const perf = data?.performance
  const res = data?.residents

  const indicators = perf ? CATS.map(c => ({ name: perf.labels[c], max: 5 })) : []
  const radarValues = perf ? CATS.map(c => perf.categories[c]) : []
  const interestBar = (res?.topInterests || []).map(i => ({ name: i.name, value: i.count }))

  return (
    <>
      <PageHeader eyebrow={data?.apm?.propertyName} title={`Hi${data?.apm ? ', ' + data.apm.name.split(' ')[0] : ''}`} subtitle="Your viewing performance and what residents in your building are into." />

      {/* Section 1 */}
      <div className="flex items-center gap-2 mb-4"><Star className="h-5 w-5 text-flamingo" /><h2 className="font-display text-2xl font-semibold text-secondary">My viewing performance</h2></div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <MotionFade delay={0}><StatCard icon={CalendarCheck} label="Total viewings" value={perf?.count ?? '—'} /></MotionFade>
        <MotionFade delay={0.05}><StatCard icon={Star} label="Overall average" value={perf ? `${perf.overall}/5` : '—'} /></MotionFade>
        <MotionFade delay={0.1}><StatCard icon={TrendingUp} label="Best category" value={perf?.best?.value ?? '—'} hint={perf?.best?.label} /></MotionFade>
        <MotionFade delay={0.15}><StatCard icon={Target} label="To improve" value={perf?.worst?.value ?? '—'} hint={perf?.worst?.label} /></MotionFade>
      </div>

      <div className="grid gap-6 lg:grid-cols-3 mb-10">
        <MotionFade delay={0.1} className="lg:col-span-2">
          <Card className="rounded-2xl border-nobel/40 shadow-soft h-full">
            <CardContent className="p-6">
              <h3 className="font-display text-lg font-semibold text-secondary mb-1">Category breakdown</h3>
              <p className="text-sm text-muted-foreground">Your average across the five rated areas</p>
              {perf ? <RadarChart indicators={indicators} values={radarValues} /> : null}
            </CardContent>
          </Card>
        </MotionFade>
        <MotionFade delay={0.15}>
          <Card className="rounded-2xl border-nobel/40 shadow-soft h-full">
            <CardContent className="p-6">
              <h3 className="font-display text-lg font-semibold text-secondary mb-1">Overall</h3>
              <p className="text-sm text-muted-foreground">Average experience score</p>
              {perf ? <RadialChart value={perf.overall} /> : null}
            </CardContent>
          </Card>
        </MotionFade>
      </div>

      <div className="flex items-center gap-2 mb-4"><h3 className="font-display text-xl font-semibold text-secondary">Recent viewing feedback</h3></div>
      {data && data.recent.length === 0 ? (
        <EmptyState title="No feedback yet" message="Ratings from your suite viewings will show up here." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 mb-12">
          {(data?.recent || []).map(f => {
            const avg = (CATS.reduce((s, c) => s + f.scores[c], 0) / 5).toFixed(1)
            return (
              <Card key={f.id} className="rounded-2xl border-nobel/40 shadow-soft">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9"><AvatarFallback className="bg-secondary text-white text-xs">{f.prospectName.split(' ').map(n => n[0]).join('')}</AvatarFallback></Avatar>
                      <div><p className="font-semibold text-ink text-sm">{f.prospectName}</p><p className="text-xs text-muted-foreground">{fmt(f.createdAt)}</p></div>
                    </div>
                    <span className="text-sm font-bold text-flamingo bg-accent rounded-full px-2.5 py-1">{avg} ★</span>
                  </div>
                  {f.comment ? <p className="mt-3 text-sm text-muted-foreground italic">“{f.comment}”</p> : null}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Section 2 */}
      <div className="flex items-center gap-2 mb-4"><Users className="h-5 w-5 text-flamingo" /><h2 className="font-display text-2xl font-semibold text-secondary">Resident interests in my building</h2></div>
      <div className="grid gap-6 lg:grid-cols-2 mb-8">
        <MotionFade delay={0.1}>
          <Card className="rounded-2xl border-nobel/40 shadow-soft h-full">
            <CardContent className="p-6">
              <h3 className="font-display text-lg font-semibold text-secondary mb-1">Top resident interests</h3>
              <p className="text-sm text-muted-foreground mb-2">By number of residents ({res?.total ?? 0} total)</p>
              {interestBar.length ? <BarChart data={interestBar} horizontal max={0} height={320} /> : <EmptyState title="No interests yet" message="Resident interests will appear here." />}
            </CardContent>
          </Card>
        </MotionFade>
        <MotionFade delay={0.15}>
          <Card className="rounded-2xl border-nobel/40 shadow-soft h-full">
            <CardContent className="p-6">
              <h3 className="font-display text-lg font-semibold text-secondary mb-3">Popular hobbies</h3>
              <InterestTagCloud tags={(res?.topHobbies || []).map(h => ({ label: h.name, count: h.count }))} />
            </CardContent>
          </Card>
        </MotionFade>
      </div>

      <MotionFade delay={0.2}>
        <Card className="rounded-2xl border-secondary/20 bg-secondary/5 shadow-soft">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4"><Sparkles className="h-5 w-5 text-flamingo" /><h3 className="font-display text-lg font-semibold text-secondary">Suggested event themes</h3></div>
            <div className="grid gap-3 md:grid-cols-3">
              {(res?.suggestedThemes || []).map(t => (
                <div key={t.tag} className="rounded-xl bg-white border border-nobel/40 p-4">
                  <div className="flex items-center justify-between mb-2"><HobbyChip label={t.tag} size="sm" /><span className="text-sm font-bold text-flamingo">{t.pct}%</span></div>
                  <p className="text-sm text-ink">{t.pct}% love {t.tag} — propose {t.suggestion}.</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </MotionFade>
    </>
  )
}

export default function ApmPage() {
  return <AppShell requireRole="APM"><ApmInner /></AppShell>
}
