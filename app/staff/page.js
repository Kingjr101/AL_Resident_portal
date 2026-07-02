'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Users, HeartHandshake, MessageSquare, Flag, UserCheck, Clock, ArrowRight } from 'lucide-react'
import { AppShell } from '@/components/AppShell'
import { PageHeader } from '@/components/PageHeader'
import { StatCard } from '@/components/StatCard'
import { MotionFade } from '@/components/MotionFade'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'

function StaffInner() {
  const [data, setData] = useState(null)
  useEffect(() => { fetch('/api/staff/overview', { credentials: 'include' }).then(r => r.json()).then(setData) }, [])
  const m = data?.metrics

  return (
    <>
      <PageHeader
        eyebrow={data?.property?.buildingName}
        title="Property overview"
        subtitle="A pulse-check on community engagement across your building."
        action={<Button asChild variant="outline" className="rounded-xl"><Link href="/staff/reports">Moderation queue <ArrowRight className="h-4 w-4 ml-1.5" /></Link></Button>}
      />

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <MotionFade delay={0}><StatCard icon={Users} label="Total residents" value={m?.totalResidents ?? '—'} hint={data?.property ? `${data.property.unitCount} units` : ''} /></MotionFade>
        <MotionFade delay={0.05}><StatCard icon={UserCheck} label="Open to meeting" value={m ? `${m.pctOpenToMeeting}%` : '—'} hint={m ? `${m.openToMeetingCount} residents` : ''} /></MotionFade>
        <MotionFade delay={0.1}><StatCard icon={HeartHandshake} label="Active connections" value={m?.activeConnections ?? '—'} hint={m ? `${m.pendingConnections} pending` : ''} /></MotionFade>
        <MotionFade delay={0.15}><StatCard icon={MessageSquare} label="Messages this week" value={m?.messagesThisWeek ?? '—'} /></MotionFade>
        <MotionFade delay={0.2}><StatCard icon={Clock} label="Pending requests" value={m?.pendingConnections ?? '—'} /></MotionFade>
        <MotionFade delay={0.25}>
          <StatCard icon={Flag} label="Open reports" value={m?.openReports ?? '—'} badge={m?.openReports > 0 ? 'Action needed' : null} badgeTone="danger" />
        </MotionFade>
      </div>

      <div className="mt-8 grid gap-5 lg:grid-cols-2">
        <MotionFade delay={0.1}>
          <Card className="rounded-2xl border-nobel/40 shadow-soft h-full">
            <CardContent className="p-6">
              <h3 className="font-display text-lg font-semibold text-secondary">Community engagement</h3>
              <p className="text-sm text-muted-foreground mt-1">Share of residents open to meeting neighbours.</p>
              <div className="mt-5">
                <div className="flex justify-between text-sm mb-2"><span className="text-muted-foreground">Open to meeting</span><span className="font-semibold text-secondary">{m?.pctOpenToMeeting ?? 0}%</span></div>
                <Progress value={m?.pctOpenToMeeting ?? 0} className="h-3" />
              </div>
            </CardContent>
          </Card>
        </MotionFade>
        <MotionFade delay={0.15}>
          <Card className="rounded-2xl border-secondary/20 bg-secondary/5 shadow-soft h-full">
            <CardContent className="p-6">
              <h3 className="font-display text-lg font-semibold text-secondary">Insights &amp; events</h3>
              <p className="text-sm text-muted-foreground mt-1">Interest tag clouds, engagement funnels, and event scheduling arrive in the next phase.</p>
              <div className="mt-4 flex gap-2">
                <Button asChild className="bg-flamingo hover:bg-flamingo/90 rounded-xl"><Link href="/staff/reports">Review reports</Link></Button>
              </div>
            </CardContent>
          </Card>
        </MotionFade>
      </div>
    </>
  )
}

export default function StaffPage() {
  return <AppShell requireRole="STAFF"><StaffInner /></AppShell>
}
