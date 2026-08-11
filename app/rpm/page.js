'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Users, CalendarCheck, Star, ArrowRight, AlertTriangle, HeartHandshake, MessageCircle, PartyPopper, UserCheck } from 'lucide-react'
import { AppShell } from '@/components/AppShell'
import { PageHeader } from '@/components/PageHeader'
import { StatCard } from '@/components/StatCard'
import { EmptyState } from '@/components/EmptyState'
import { MotionFade } from '@/components/MotionFade'
import { RadialChart } from '@/components/charts/RadialChart'
import { BarChart } from '@/components/charts/BarChart'
import { ConnectionGauge } from '@/components/charts/ConnectionGauge'
import { EngagementFunnel } from '@/components/charts/EngagementFunnel'
import { ConnectionsTrend } from '@/components/charts/ConnectionsTrend'
import { Card, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { cn } from '@/lib/utils'

const tone = (v) => v >= 4 ? 'text-secondary' : v >= 3.5 ? 'text-amber-600' : 'text-destructive'

function RpmInner() {
  const router = useRouter()
  const [data, setData] = useState(null)
  useEffect(() => { fetch('/api/rpm/overview', { credentials: 'include' }).then(r => r.json()).then(setData) }, [])
  const stats = data?.stats
  const apms = data?.apms || []
  const conn = data?.connection
  const barData = apms.map(a => ({ name: a.name.split(' ')[0], value: a.overall }))

  return (
    <>
      <PageHeader eyebrow="Property management" title="Regional overview" subtitle="How connected residents are to their communities — and how your teams are performing across the region." />

      {/* Story banner */}
      {conn ? (
        <MotionFade>
          <div className="mb-6 rounded-2xl border border-secondary/15 px-5 py-4 text-sm"
            style={{ background: 'linear-gradient(135deg, rgba(0,67,14,.05), rgba(241,90,37,.05))' }}>
            📣 <span className="font-semibold">This region:</span> {conn.totalConnections} resident connections made,
            {' '}{conn.activeChats} active conversations, and {conn.eventsSparked} community events sparked by resident interests —
            with <span className="font-semibold text-flamingo">{conn.openPct}% of residents open to meeting.</span>
          </div>
        </MotionFade>
      ) : null}

      {/* Hero: 3 gauges */}
      <div className="grid gap-5 lg:grid-cols-3 mb-6">
        <MotionFade delay={0}>
          <Card className="rounded-2xl border-nobel/40 shadow-soft h-full" style={{ background: 'linear-gradient(135deg, #fff 55%, #FFF3EC)' }}>
            <CardContent className="p-6">
              <h3 className="font-display text-lg font-semibold text-secondary mb-1">Community Connection Index</h3>
              <p className="text-sm text-muted-foreground">Blended: openness · connections · chats · events</p>
              {conn ? <ConnectionGauge value={conn.index} max={100} label="out of 100" /> : null}
            </CardContent>
          </Card>
        </MotionFade>
        <MotionFade delay={0.05}>
          <Card className="rounded-2xl border-nobel/40 shadow-soft h-full">
            <CardContent className="p-6">
              <h3 className="font-display text-lg font-semibold text-secondary mb-1">Residents Open to Meeting</h3>
              <p className="text-sm text-muted-foreground">Share of residents welcoming connections</p>
              {conn ? <ConnectionGauge value={conn.openPct} max={100} label="percent" /> : null}
            </CardContent>
          </Card>
        </MotionFade>
        <MotionFade delay={0.1}>
          <Card className="rounded-2xl border-nobel/40 shadow-soft h-full">
            <CardContent className="p-6">
              <h3 className="font-display text-lg font-semibold text-secondary mb-1">Team Average Rating</h3>
              <p className="text-sm text-muted-foreground">APM viewing performance across the region</p>
              {stats ? <ConnectionGauge value={stats.teamAvgOverall} max={5} label="out of 5" /> : null}
            </CardContent>
          </Card>
        </MotionFade>
      </div>

      {/* KPI strip */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <MotionFade delay={0}><StatCard icon={HeartHandshake} label="Connections made" value={conn?.totalConnections ?? '—'} badge="▲ 12%" /></MotionFade>
        <MotionFade delay={0.05}><StatCard icon={MessageCircle} label="Active conversations" value={conn?.activeChats ?? '—'} badge="▲ 8%" /></MotionFade>
        <MotionFade delay={0.1}><StatCard icon={PartyPopper} label="Events sparked" value={conn?.eventsSparked ?? '—'} badge="▲ 3" /></MotionFade>
        <MotionFade delay={0.15}><StatCard icon={CalendarCheck} label="Viewings this month" value={stats?.viewingsThisMonth ?? '—'} hint={stats ? `${stats.totalViewings} in 90 days` : ''} /></MotionFade>
      </div>

      {/* Funnel + Trend */}
      <div className="grid gap-6 lg:grid-cols-2 mb-8">
        <MotionFade delay={0.1}>
          <Card className="rounded-2xl border-nobel/40 shadow-soft h-full">
            <CardContent className="p-6">
              <h3 className="font-display text-lg font-semibold text-secondary mb-1">Resident Engagement Funnel</h3>
              <p className="text-sm text-muted-foreground mb-2">From signup to active community member</p>
              {data?.funnel ? <EngagementFunnel data={data.funnel} /> : null}
            </CardContent>
          </Card>
        </MotionFade>
        <MotionFade delay={0.15}>
          <Card className="rounded-2xl border-nobel/40 shadow-soft h-full">
            <CardContent className="p-6">
              <h3 className="font-display text-lg font-semibold text-secondary mb-1">Connections Over Time</h3>
              <p className="text-sm text-muted-foreground mb-2">Cumulative resident connections</p>
              {data?.trend ? <ConnectionsTrend points={data.trend} /> : null}
            </CardContent>
          </Card>
        </MotionFade>
      </div>

      {/* Building leaderboard + Top interests */}
      <div className="grid gap-6 lg:grid-cols-2 mb-8">
        <MotionFade delay={0.1}>
          <Card className="rounded-2xl border-nobel/40 shadow-soft h-full">
            <CardContent className="p-6">
              <h3 className="font-display text-lg font-semibold text-secondary mb-1">Building Connection Leaderboard</h3>
              <p className="text-sm text-muted-foreground mb-4">Which communities are most engaged</p>
              <div className="space-y-3">
                {(data?.buildingLeaderboard || []).map((b, i) => (
                  <div key={b.name} className="flex items-center gap-3">
                    <span className="font-bold text-flamingo w-5">{i + 1}</span>
                    <span className="text-sm font-medium text-ink w-40 truncate">{b.name}</span>
                    <div className="flex-1 h-2.5 rounded-full bg-[#f2efe9] overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${b.score}%`, background: 'linear-gradient(90deg,#F15A25,#F79A6E)' }} />
                    </div>
                    <span className="text-sm font-bold text-secondary w-8 text-right">{b.score}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </MotionFade>
        <MotionFade delay={0.15}>
          <Card className="rounded-2xl border-nobel/40 shadow-soft h-full">
            <CardContent className="p-6">
              <h3 className="font-display text-lg font-semibold text-secondary mb-1">Top Resident Interests</h3>
              <p className="text-sm text-muted-foreground mb-2">What communities are into — event fuel</p>
              {data?.topInterests?.length ? <BarChart data={data.topInterests.map(i => ({ name: i.name, value: i.count }))} horizontal max={0} height={230} /> : null}
            </CardContent>
          </Card>
        </MotionFade>
      </div>

      {/* Existing: team avg radial + APM comparison bar */}
      {/* APM comparison (full width) */}
      <MotionFade delay={0.1}>
        <Card className="rounded-2xl border-nobel/40 shadow-soft mb-8">
          <CardContent className="p-6">
            <h3 className="font-display text-lg font-semibold text-secondary mb-1">APM comparison</h3>
            <p className="text-sm text-muted-foreground">Overall average by manager</p>
            {apms.length ? <BarChart data={barData} max={5} height={280} /> : null}
          </CardContent>
        </Card>
      </MotionFade>

      {/* Existing: APM leaderboard table */}
      <MotionFade delay={0.2}>
        <Card className="rounded-2xl border-nobel/40 shadow-soft overflow-hidden">
          <CardContent className="p-0">
            <div className="px-6 py-4 border-b border-nobel/40"><h3 className="font-display text-lg font-semibold text-secondary">APM leaderboard</h3></div>
            {apms.length === 0 ? (
              <div className="p-6"><EmptyState icon={Users} title="No APMs assigned yet" message="APMs you manage will appear here with their ratings." /></div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>APM</TableHead>
                    <TableHead>Property</TableHead>
                    <TableHead className="text-center">Friendly</TableHead>
                    <TableHead className="text-center">Prof.</TableHead>
                    <TableHead className="text-center">Knowl.</TableHead>
                    <TableHead className="text-center">Comm.</TableHead>
                    <TableHead className="text-center">Exp.</TableHead>
                    <TableHead className="text-center">Overall</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {apms.map(a => (
                    <TableRow key={a.id} className="cursor-pointer" onClick={() => router.push(`/rpm/apm/${a.id}`)}>
                      <TableCell className="font-medium">{a.name}</TableCell>
                      <TableCell className="text-muted-foreground">{a.propertyName}</TableCell>
                      <TableCell className="text-center">{a.categories.friendliness}</TableCell>
                      <TableCell className="text-center">{a.categories.professionalism}</TableCell>
                      <TableCell className="text-center">{a.categories.knowledge}</TableCell>
                      <TableCell className="text-center">{a.categories.communication}</TableCell>
                      <TableCell className="text-center">{a.categories.overallExperience}</TableCell>
                      <TableCell className={cn('text-center font-bold', tone(a.overall))}>{a.overall}</TableCell>
                      <TableCell>
                        {a.needsAttention
                          ? <span className="inline-flex items-center gap-1 text-xs font-semibold text-destructive bg-destructive/10 px-2 py-1 rounded-full whitespace-nowrap"><AlertTriangle className="h-3 w-3" /> Needs attention</span>
                          : <ArrowRight className="h-4 w-4 text-muted-foreground" />}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </MotionFade>
    </>
  )
}

export default function RpmPage() {
  return <AppShell requireRole="RPM"><RpmInner /></AppShell>
}