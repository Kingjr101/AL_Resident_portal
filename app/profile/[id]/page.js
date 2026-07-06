'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { MapPin, CalendarDays, Star, UserPlus, ArrowLeft, Loader2, Lock, ShieldCheck, MessageCircle } from 'lucide-react'
import { AppShell } from '@/components/AppShell'
import { HobbyChip } from '@/components/HobbyChip'
import { ReportDialog } from '@/components/ReportDialog'
import { SayHelloDialog } from '@/components/SayHelloDialog'
import { MotionFade } from '@/components/MotionFade'
import { EmptyState } from '@/components/EmptyState'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { toast } from 'sonner'

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-CA', { month: 'long', year: 'numeric' }) : '—'

function ProfileInner() {
  const params = useParams()
  const router = useRouter()
  const id = params?.id
  const [state, setState] = useState({ loading: true, data: null, error: null })
  const [helloOpen, setHelloOpen] = useState(false)

  useEffect(() => {
    if (!id) return
    fetch(`/api/residents/${id}`, { credentials: 'include' })
      .then(async r => ({ ok: r.ok, body: await r.json() }))
      .then(({ ok, body }) => setState({ loading: false, data: ok ? body : null, error: ok ? null : (body.error || 'Not found') }))
      .catch(() => setState({ loading: false, data: null, error: 'Something went wrong' }))
  }, [id])

  if (state.loading) return <div className="flex justify-center py-24"><Loader2 className="h-6 w-6 animate-spin text-flamingo" /></div>

  if (state.error) {
    return <EmptyState icon={Lock} title="Profile unavailable" message="This resident isn’t in your building, or the profile doesn’t exist." action={<Button variant="outline" onClick={() => router.back()} className="rounded-xl">Go back</Button>} />
  }

  const { resident, profile, property, viewerRole, isSelf } = state.data
  const isStaff = viewerRole === 'STAFF'

  return (
    <MotionFade>
      <Button variant="ghost" onClick={() => router.back()} className="mb-4 text-muted-foreground -ml-2"><ArrowLeft className="h-4 w-4 mr-1.5" /> Back</Button>

      {isStaff ? (
        <div className="mb-5 flex items-center gap-2 rounded-2xl bg-secondary/10 border border-secondary/20 px-4 py-2.5 text-sm text-secondary">
          <ShieldCheck className="h-4 w-4" /> Staff read-only view — aggregate profile details only. Private chats are never shown here.
        </div>
      ) : null}

      <Card className="rounded-3xl overflow-hidden border-nobel/40 shadow-soft">
        <div className="h-28 bg-gradient-to-r from-secondary to-secondary/70" />
        <CardContent className="p-6 md:p-8">
          <div className="flex flex-col sm:flex-row sm:items-end gap-5 -mt-20">
            <Avatar className="h-28 w-28 border-4 border-white shadow-lift">
              <AvatarImage src={profile?.photoUrl} alt={resident.firstName} />
              <AvatarFallback className="bg-secondary text-white text-2xl">{resident.firstName?.[0]}{resident.lastName?.[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="font-display text-3xl font-semibold text-secondary">{resident.firstName} {resident.lastName}</h1>
                <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> Unit {resident.unitNumber} · {property?.buildingName}</span>
                  <span className="flex items-center gap-1"><CalendarDays className="h-4 w-4" /> Since {fmtDate(profile?.moveInDate)}</span>
                </div>
              </div>
              {!isSelf ? (
                <div className="flex items-center gap-2">
                  {!isStaff ? (
                    <>
                      <Button className="bg-flamingo hover:bg-flamingo/90 rounded-xl" onClick={() => toast.success(`Connection request sent to ${resident.firstName}.`)}>
                        <UserPlus className="h-4 w-4 mr-1.5" /> Send connection request
                      </Button>
                      <Button variant="outline" className="rounded-xl border-nobel/50 hover:border-flamingo hover:text-flamingo" onClick={() => setHelloOpen(true)}>
                        <MessageCircle className="h-4 w-4 mr-1.5" /> Say hello
                      </Button>
                    </>
                  ) : null}
                  <ReportDialog reportedUserId={resident.id} label="Report user" />
                </div>
              ) : null}
            </div>
          </div>

          {profile?.bio ? <p className="mt-6 text-ink/80 leading-relaxed max-w-2xl">{profile.bio}</p> : null}

          <div className="mt-8 grid gap-8 md:grid-cols-2">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-widest text-flamingo mb-3">Hobbies</h3>
              <div className="flex flex-wrap gap-2">
                {(profile?.hobbies || []).length ? profile.hobbies.map(h => <HobbyChip key={h} label={h} />) : <span className="text-sm text-muted-foreground">Not shared yet</span>}
              </div>
            </div>
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-widest text-flamingo mb-3">Interests</h3>
              <div className="flex flex-wrap gap-2">
                {(profile?.interests || []).length ? profile.interests.map(i => <HobbyChip key={i} label={i} />) : <span className="text-sm text-muted-foreground">Not shared yet</span>}
              </div>
            </div>
          </div>

          {profile?.favoriteSpotInBuilding ? (
            <div className="mt-8 flex items-center gap-3 rounded-2xl bg-accent px-4 py-3">
              <Star className="h-5 w-5 text-flamingo" />
              <p className="text-sm text-ink"><span className="font-semibold">Favourite spot:</span> {profile.favoriteSpotInBuilding}</p>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <SayHelloDialog open={helloOpen} onOpenChange={setHelloOpen} resident={{ ...resident, photoUrl: profile?.photoUrl }} />
    </MotionFade>
  )
}

export default function ProfilePage() {
  return <AppShell><ProfileInner /></AppShell>
}

