'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Users, CalendarCheck, Star, ArrowRight, AlertTriangle } from 'lucide-react'
import { AppShell } from '@/components/AppShell'
import { PageHeader } from '@/components/PageHeader'
import { StatCard } from '@/components/StatCard'
import { EmptyState } from '@/components/EmptyState'
import { MotionFade } from '@/components/MotionFade'
import { RadialChart } from '@/components/charts/RadialChart'
import { BarChart } from '@/components/charts/BarChart'
import { Card, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { cn } from '@/lib/utils'

const CATS = ['friendliness', 'professionalism', 'knowledge', 'communication', 'overallExperience']
const tone = (v) => v >= 4 ? 'text-secondary' : v >= 3.5 ? 'text-amber-600' : 'text-destructive'

function RpmInner() {
  const router = useRouter()
  const [data, setData] = useState(null)
  useEffect(() => { fetch('/api/rpm/overview', { credentials: 'include' }).then(r => r.json()).then(setData) }, [])
  const stats = data?.stats
  const apms = data?.apms || []
  const barData = apms.map(a => ({ name: a.name.split(' ')[0], value: a.overall }))

  return (
    <>
      <PageHeader eyebrow="Property management" title="Regional overview" subtitle="How your assistant property managers are performing across the region, based on prospective-tenant viewing feedback." />

      <div className="grid gap-5 sm:grid-cols-3 mb-8">
        <MotionFade delay={0}><StatCard icon={Users} label="APMs managed" value={stats?.totalApms ?? '—'} /></MotionFade>
        <MotionFade delay={0.05}><StatCard icon={CalendarCheck} label="Viewings this month" value={stats?.viewingsThisMonth ?? '—'} hint={stats ? `${stats.totalViewings} in last 90 days` : ''} /></MotionFade>
        <MotionFade delay={0.1}><StatCard icon={Star} label="Team average score" value={stats ? `${stats.teamAvgOverall}/5` : '—'} /></MotionFade>
      </div>

      <div className="grid gap-6 lg:grid-cols-2 mb-8">
        <MotionFade delay={0.1}>
          <Card className="rounded-2xl border-nobel/40 shadow-soft h-full">
            <CardContent className="p-6">
              <h3 className="font-display text-lg font-semibold text-secondary mb-1">Team average experience</h3>
              <p className="text-sm text-muted-foreground">Overall score across all managed APMs</p>
              {stats ? <RadialChart value={stats.teamAvgOverall} /> : null}
            </CardContent>
          </Card>
        </MotionFade>
        <MotionFade delay={0.15}>
          <Card className="rounded-2xl border-nobel/40 shadow-soft h-full">
            <CardContent className="p-6">
              <h3 className="font-display text-lg font-semibold text-secondary mb-1">APM comparison</h3>
              <p className="text-sm text-muted-foreground">Overall average by manager</p>
              {apms.length ? <BarChart data={barData} max={5} height={280} /> : null}
            </CardContent>
          </Card>
        </MotionFade>
      </div>

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
