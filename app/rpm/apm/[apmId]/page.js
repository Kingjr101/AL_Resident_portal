'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Loader2, Star } from 'lucide-react'
import { AppShell } from '@/components/AppShell'
import { MotionFade } from '@/components/MotionFade'
import { EmptyState } from '@/components/EmptyState'
import { RadarChart } from '@/components/charts/RadarChart'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { cn } from '@/lib/utils'

const fmt = (d) => new Date(d).toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' })
const tone = (v) => v >= 4 ? 'text-secondary' : v >= 3.5 ? 'text-amber-600' : 'text-destructive'
const CAT_LABELS = [['friendliness', 'Friendliness'], ['professionalism', 'Professionalism'], ['knowledge', 'Knowledge'], ['communication', 'Communication'], ['overallExperience', 'Experience']]

function ApmDetailInner() {
  const params = useParams()
  const router = useRouter()
  const [d, setD] = useState(undefined)
  useEffect(() => {
    fetch(`/api/rpm/apm/${params.apmId}`, { credentials: 'include' })
      .then(async r => (r.ok ? r.json() : null)).then(setD)
  }, [params.apmId])

  if (d === undefined) return <div className="flex justify-center py-24"><Loader2 className="h-6 w-6 animate-spin text-flamingo" /></div>
  if (!d) return <div className="py-24 text-center"><Button variant="outline" className="rounded-xl" onClick={() => router.push('/rpm')}>Back to overview</Button></div>

  const indicators = CAT_LABELS.map(([k, label]) => ({ name: label, max: 5 }))
  const radarValues = CAT_LABELS.map(([k]) => d.categories[k])

  return (
    <MotionFade>
      <Button variant="ghost" onClick={() => router.push('/rpm')} className="mb-4 text-muted-foreground -ml-2"><ArrowLeft className="h-4 w-4 mr-1.5" /> Regional overview</Button>
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-3xl font-semibold text-secondary">{d.apm.name}</h1>
          <p className="text-muted-foreground">{d.apm.propertyName} · {d.count} viewings rated</p>
        </div>
        <div className="flex items-center gap-2 rounded-2xl bg-accent px-4 py-2">
          <Star className="h-5 w-5 text-flamingo" />
          <span className={cn('text-2xl font-bold font-display', tone(d.overall))}>{d.overall}</span>
          <span className="text-sm text-muted-foreground">/5 overall</span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        {CAT_LABELS.map(([k, label]) => (
          <Card key={k} className="rounded-2xl border-nobel/40 shadow-soft">
            <CardContent className="p-4 text-center">
              <div className={cn('text-2xl font-bold font-display', tone(d.categories[k]))}>{d.categories[k]}</div>
              <div className="text-xs text-muted-foreground mt-1">{label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <MotionFade delay={0.1}>
        <Card className="rounded-2xl border-nobel/40 shadow-soft mb-8">
          <CardContent className="p-6">
            <h3 className="font-display text-lg font-semibold text-secondary mb-1">Category breakdown</h3>
            <p className="text-sm text-muted-foreground">Visual profile across the five rated areas</p>
            <RadarChart indicators={indicators} values={radarValues} />
          </CardContent>
        </Card>
      </MotionFade>

      <Card className="rounded-2xl border-nobel/40 shadow-soft overflow-hidden">
        <CardContent className="p-0">
          <div className="px-6 py-4 border-b border-nobel/40"><h3 className="font-display text-lg font-semibold text-secondary">Individual viewing feedback</h3></div>
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Prospect</TableHead>
                <TableHead className="text-center">Fr</TableHead>
                <TableHead className="text-center">Pr</TableHead>
                <TableHead className="text-center">Kn</TableHead>
                <TableHead className="text-center">Co</TableHead>
                <TableHead className="text-center">Ex</TableHead>
                <TableHead>Comment</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {d.feedback.map(f => (
                <TableRow key={f.id}>
                  <TableCell className="font-medium whitespace-nowrap">{f.prospectName}</TableCell>
                  <TableCell className="text-center">{f.scores.friendliness}</TableCell>
                  <TableCell className="text-center">{f.scores.professionalism}</TableCell>
                  <TableCell className="text-center">{f.scores.knowledge}</TableCell>
                  <TableCell className="text-center">{f.scores.communication}</TableCell>
                  <TableCell className="text-center">{f.scores.overallExperience}</TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-xs">{f.comment}</TableCell>
                  <TableCell className="text-sm text-muted-foreground whitespace-nowrap">{fmt(f.createdAt)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </MotionFade>
  )
}

export default function ApmDetailPage() {
  return <AppShell requireRole="RPM"><ApmDetailInner /></AppShell>
}