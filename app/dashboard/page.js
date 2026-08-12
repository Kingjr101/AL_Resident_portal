'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Users, CalendarHeart, UserPlus, MapPin, ArrowRight, Sparkles, Megaphone } from 'lucide-react'
import { AppShell } from '@/components/AppShell'
import { PageHeader } from '@/components/PageHeader'
import { ConsentBanner } from '@/components/ConsentBanner'
import { EmptyState } from '@/components/EmptyState'
import { HobbyChip } from '@/components/HobbyChip'
import { MotionFade } from '@/components/MotionFade'
import { SayHelloDialog } from '@/components/SayHelloDialog'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from '@/components/ui/carousel'

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-CA', { weekday: 'short', month: 'short', day: 'numeric' }) : 'TBD'

function DashboardInner() {
  const [me, setMe] = useState(null)
  const [data, setData] = useState(null)
  const [hello, setHello] = useState(null)

  useEffect(() => {
    fetch('/api/me', { credentials: 'include' }).then(r => r.json()).then(setMe)
    fetch('/api/dashboard', { credentials: 'include' }).then(r => r.json()).then(setData)
  }, [])

  const firstName = me?.user?.firstName || ''
  const building = me?.property?.buildingName || 'your building'

  return (
    <>
      <PageHeader
        eyebrow={building}
        title={`Welcome back${firstName ? ', ' + firstName : ''}`}
        subtitle="Here's what's happening in your community this week."
        action={
          <div className="flex flex-col sm:flex-row gap-2">
            <Button asChild className="bg-flamingo hover:bg-flamingo/90 rounded-xl">
              <Link href="/discover">Discover neighbours <ArrowRight className="h-4 w-4 ml-1.5" /></Link>
            </Button>
            <Button asChild className="bg-secondary hover:bg-secondary/90 rounded-xl">
              <Link href="/community-board"><Megaphone className="h-4 w-4 mr-1.5" /> Open Community Board</Link>
            </Button>
          </div>
        }
      />

      <div className="mb-8"><ConsentBanner isOpen={me?.user?.isOpenToMeeting !== false} /></div>

      {/* Pending requests */}
      <MotionFade>
        <div className="flex items-center gap-2 mb-4">
          <UserPlus className="h-5 w-5 text-flamingo" />
          <h2 className="font-display text-2xl font-semibold text-secondary">Connection requests</h2>
          {data?.pendingRequests?.length ? <span className="text-xs font-semibold bg-flamingo text-white rounded-full px-2 py-0.5">{data.pendingRequests.length}</span> : null}
        </div>
      </MotionFade>
      {data && data.pendingRequests.length === 0 ? (
        <EmptyState icon={UserPlus} title="No pending requests" message="When a neighbour wants to connect, you'll see them here." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(data?.pendingRequests || []).map(r => (
            <Card key={r.connectionId} className="rounded-2xl border-nobel/40 shadow-soft">
              <CardContent className="p-5 flex items-center gap-4">
                <Avatar className="h-14 w-14"><AvatarImage src={r.photoUrl} /><AvatarFallback className="bg-secondary text-white">{r.firstName?.[0]}</AvatarFallback></Avatar>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-ink">{r.firstName} {r.lastName}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="h-3 w-3" /> Unit {r.unitNumber}</p>
                  <div className="mt-2 flex flex-wrap gap-1">{(r.hobbies || []).slice(0, 2).map(h => <HobbyChip key={h} label={h} size="sm" />)}</div>
                </div>
                <Button asChild size="sm" variant="outline" className="rounded-xl"><Link href={`/profile/${r.id}`}>View</Link></Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* New neighbours carousel */}
      <div className="flex items-center gap-2 mt-12 mb-4">
        <Sparkles className="h-5 w-5 text-flamingo" />
        <h2 className="font-display text-2xl font-semibold text-secondary">New neighbours this week</h2>
      </div>
      {data && data.newNeighbours.length === 0 ? (
        <EmptyState title="No new neighbours yet" message="New residents open to meeting will appear here." />
      ) : (
        <Carousel opts={{ align: 'start' }} className="w-full">
          <CarouselContent className="-ml-4">
            {(data?.newNeighbours || []).map(n => (
              <CarouselItem key={n.id} className="pl-4 basis-4/5 sm:basis-1/2 lg:basis-1/3">
                <Card className="rounded-2xl border-nobel/40 shadow-soft h-full">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-14 w-14 border-2 border-white shadow-soft"><AvatarImage src={n.photoUrl} /><AvatarFallback className="bg-secondary text-white">{n.firstName?.[0]}</AvatarFallback></Avatar>
                      <div>
                        <p className="font-semibold text-ink">{n.firstName} {n.lastName}</p>
                        <p className="text-xs text-muted-foreground">Moved in {fmtDate(n.moveInDate)}</p>
                      </div>
                    </div>
                    <p className="mt-3 text-sm text-muted-foreground line-clamp-2">{n.bio}</p>
                    <div className="mt-3 flex flex-wrap gap-1">{(n.hobbies || []).slice(0, 3).map(h => <HobbyChip key={h} label={h} size="sm" />)}</div>
                    <Button onClick={() => setHello(n)} variant="outline" className="mt-4 w-full rounded-xl hover:border-flamingo hover:text-flamingo">Say hello</Button>
                  </CardContent>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden md:flex" />
          <CarouselNext className="hidden md:flex" />
        </Carousel>
      )}

      {/* Upcoming events */}
      <div className="flex items-center gap-2 mt-12 mb-4">
        <CalendarHeart className="h-5 w-5 text-flamingo" />
        <h2 className="font-display text-2xl font-semibold text-secondary">Upcoming community events</h2>
      </div>
      {data && data.upcomingEvents.length === 0 ? (
        <EmptyState icon={CalendarHeart} title="No events scheduled yet" message="Your community team is planning something — check back soon!" />
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          {(data?.upcomingEvents || []).map(e => (
            <Card key={e.id} className="rounded-2xl border-nobel/40 shadow-soft hover:shadow-lift transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-flamingo bg-accent rounded-full px-2.5 py-1">{fmtDate(e.scheduledFor)}</span>
                  <HobbyChip label={e.tag} size="sm" />
                </div>
                <h3 className="mt-3 font-display text-lg font-semibold text-secondary">{e.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{e.description}</p>
                <p className="mt-3 text-xs text-muted-foreground">Hosted by {e.host}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <SayHelloDialog open={!!hello} onOpenChange={(o) => !o && setHello(null)} resident={hello} />
    </>
  )
}

export default function DashboardPage() {
  return <AppShell requireRole="RESIDENT"><DashboardInner /></AppShell>
}
