'use client'
import { useEffect, useMemo, useState } from 'react'
import { Users, X } from 'lucide-react'
import { AppShell } from '@/components/AppShell'
import { PageHeader } from '@/components/PageHeader'
import { ConsentBanner } from '@/components/ConsentBanner'
import { EmptyState } from '@/components/EmptyState'
import { ResidentCard } from '@/components/ResidentCard'
import { MotionFade } from '@/components/MotionFade'
import { Button } from '@/components/ui/button'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'

function DiscoverInner() {
  const [me, setMe] = useState(null)
  const [residents, setResidents] = useState([])
  const [facets, setFacets] = useState({ hobbies: [], interests: [] })
  const [loading, setLoading] = useState(true)
  const [hobby, setHobby] = useState('all')
  const [interest, setInterest] = useState('all')
  const [recency, setRecency] = useState('all')

  useEffect(() => { fetch('/api/me', { credentials: 'include' }).then(r => r.json()).then(setMe) }, [])

  useEffect(() => {
    setLoading(true)
    const qs = new URLSearchParams()
    if (hobby !== 'all') qs.set('hobby', hobby)
    if (interest !== 'all') qs.set('interest', interest)
    if (recency !== 'all') qs.set('recency', recency)
    fetch(`/api/discover?${qs.toString()}`, { credentials: 'include' })
      .then(r => r.json())
      .then(d => { setResidents(d.residents || []); if (d.facets) setFacets(d.facets); setLoading(false) })
  }, [hobby, interest, recency])

  const hasFilters = hobby !== 'all' || interest !== 'all' || recency !== 'all'
  const clear = () => { setHobby('all'); setInterest('all'); setRecency('all') }

  return (
    <>
      <PageHeader
        eyebrow={me?.property?.buildingName}
        title="Discover your neighbours"
        subtitle="Everyone here lives in your building and is open to meeting new people. Say hello!"
      />
      <div className="mb-6"><ConsentBanner isOpen={me?.user?.isOpenToMeeting !== false} /></div>

      <div className="flex flex-wrap items-center gap-3 mb-8">
        <Select value={hobby} onValueChange={setHobby}>
          <SelectTrigger className="w-[180px] rounded-xl bg-white capitalize"><SelectValue placeholder="Hobby" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All hobbies</SelectItem>
            {facets.hobbies.map(h => <SelectItem key={h} value={h} className="capitalize">{h}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={interest} onValueChange={setInterest}>
          <SelectTrigger className="w-[190px] rounded-xl bg-white capitalize"><SelectValue placeholder="Interest" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All interests</SelectItem>
            {facets.interests.map(i => <SelectItem key={i} value={i} className="capitalize">{i}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={recency} onValueChange={setRecency}>
          <SelectTrigger className="w-[190px] rounded-xl bg-white"><SelectValue placeholder="Move-in" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any move-in date</SelectItem>
            <SelectItem value="recent">New (last 4 months)</SelectItem>
          </SelectContent>
        </Select>
        {hasFilters ? <Button variant="ghost" onClick={clear} className="text-muted-foreground"><X className="h-4 w-4 mr-1" /> Clear</Button> : null}
        <span className="ml-auto text-sm text-muted-foreground">{residents.length} neighbour{residents.length === 1 ? '' : 's'}</span>
      </div>

      {!loading && residents.length === 0 ? (
        <EmptyState icon={Users} title="No neighbours match those filters" message="Try clearing a filter to see more of your community." action={hasFilters ? <Button onClick={clear} variant="outline" className="rounded-xl">Clear filters</Button> : null} />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {residents.map((r, i) => (
            <MotionFade key={r.id} delay={Math.min(i * 0.04, 0.3)}>
              <ResidentCard resident={r} />
            </MotionFade>
          ))}
        </div>
      )}
    </>
  )
}

export default function DiscoverPage() {
  return <AppShell requireRole="RESIDENT"><DiscoverInner /></AppShell>
}
