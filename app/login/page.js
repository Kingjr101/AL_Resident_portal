'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Home, User, ShieldCheck, Loader2, Info, ChevronDown, Building2, UserCog } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { MotionFade } from '@/components/MotionFade'

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(null)
  const [showStaff, setShowStaff] = useState(false)

  const signIn = async (role) => {
    setLoading(role)
    try {
      const res = await fetch('/api/auth/sso', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ role }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      router.push(role === 'RPM' ? '/rpm' : role === 'APM' ? '/apm' : '/dashboard')
    } catch (e) {
      setLoading(null)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary px-4 py-10">
      <div className="absolute top-6 left-0 right-0 flex justify-center">
        <Link href="/" className="flex items-center gap-2">
          <span className="h-8 w-8 rounded-lg bg-flamingo flex items-center justify-center"><Home className="h-4 w-4 text-white" /></span>
          <span className="font-display text-white font-semibold">Resident Hub</span>
        </Link>
      </div>
      <MotionFade className="w-full max-w-md">
        <Card className="rounded-3xl border-none shadow-lift">
          <CardContent className="p-8">
            <div className="text-center">
              <span className="inline-flex items-center gap-2 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-flamingo">Tenant SSO</span>
              <h1 className="mt-4 font-display text-3xl font-semibold text-secondary">Welcome back</h1>
              <p className="mt-2 text-sm text-muted-foreground">Sign in securely with your Avenue Living tenant account to enter your building’s community hub.</p>
            </div>

            <div className="mt-8 space-y-3">
              <Button onClick={() => signIn('RESIDENT')} disabled={loading} className="w-full h-14 rounded-2xl bg-flamingo hover:bg-flamingo/90 text-base justify-start px-5">
                {loading === 'RESIDENT' ? <Loader2 className="h-5 w-5 animate-spin mr-3" /> : <User className="h-5 w-5 mr-3" />}
                Continue as Resident
              </Button>

              <div>
                <Button onClick={() => setShowStaff(v => !v)} disabled={loading} variant="outline" className="w-full h-14 rounded-2xl border-2 border-secondary text-secondary hover:bg-secondary hover:text-white text-base justify-start px-5">
                  <ShieldCheck className="h-5 w-5 mr-3" />
                  Continue as Staff
                  <ChevronDown className={`h-4 w-4 ml-auto transition-transform ${showStaff ? 'rotate-180' : ''}`} />
                </Button>

                {showStaff ? (
                  <div className="mt-2 space-y-2 pl-1">
                    <Button onClick={() => signIn('APM')} disabled={loading} variant="ghost" className="w-full h-12 rounded-xl justify-start px-5 bg-muted hover:bg-accent hover:text-flamingo">
                      {loading === 'APM' ? <Loader2 className="h-4 w-4 animate-spin mr-3" /> : <UserCog className="h-4 w-4 mr-3" />}
                      Continue as APM <span className="ml-auto text-xs text-muted-foreground">Assistant PM</span>
                    </Button>
                    <Button onClick={() => signIn('RPM')} disabled={loading} variant="ghost" className="w-full h-12 rounded-xl justify-start px-5 bg-muted hover:bg-accent hover:text-flamingo">
                      {loading === 'RPM' ? <Loader2 className="h-4 w-4 animate-spin mr-3" /> : <Building2 className="h-4 w-4 mr-3" />}
                      Continue as RPM <span className="ml-auto text-xs text-muted-foreground">Regional PM</span>
                    </Button>
                  </div>
                ) : null}
              </div>
            </div>

            <div className="mt-7 flex items-start gap-2 rounded-2xl bg-muted px-4 py-3 text-xs text-muted-foreground">
              <Info className="h-4 w-4 shrink-0 mt-0.5" />
              <p><span className="font-semibold text-ink">Demo SSO</span> — production will integrate with the Avenue Living tenant portal. Choose a role above to explore the experience.</p>
            </div>
          </CardContent>
        </Card>
      </MotionFade>
    </div>
  )
}
