'use client'
import Link from 'next/link'
import { Home, Users, ShieldCheck, CalendarHeart, ArrowRight, Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { MotionFade } from '@/components/MotionFade'
import { IMAGES } from '@/lib/images'

const FEATURES = [
  { icon: Users, title: 'Discover neighbours', body: 'Browse residents in your building who are open to meeting — filtered by shared hobbies and interests.', img: IMAGES.discover },
  { icon: ShieldCheck, title: 'Connect safely', body: 'Consent-first connections and private chat. Report anything, anytime — our community team has your back.', img: IMAGES.connect },
  { icon: CalendarHeart, title: 'Join community events', body: 'From rooftop coffee to garden days, find gatherings planned around what your building actually loves.', img: IMAGES.events },
]

function App() {
  return (
    <div className="min-h-screen bg-background">
      {/* Public header */}
      <header className="absolute top-0 inset-x-0 z-30">
        <div className="container flex h-20 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="h-9 w-9 rounded-xl bg-flamingo flex items-center justify-center">
              <Home className="h-5 w-5 text-white" />
            </span>
            <span className="font-display text-lg font-semibold text-white drop-shadow">Resident Hub</span>
          </Link>
          <Button asChild className="bg-white text-secondary hover:bg-white/90 rounded-xl">
            <Link href="/login">Log in</Link>
          </Button>
        </div>
      </header>

      {/* Hero */}
      <section className="relative min-h-[92vh] flex items-center">
        <div className="absolute inset-0">
          <img src={IMAGES.hero} alt="Warm modern apartment community" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-secondary/85 via-secondary/60 to-secondary/20" />
        </div>
        <div className="container relative z-10 py-28">
          <MotionFade>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/15 backdrop-blur px-4 py-1.5 text-sm text-white font-medium">
              <Heart className="h-4 w-4" /> For residents of Avenue Living communities
            </span>
          </MotionFade>
          <MotionFade delay={0.08}>
            <h1 className="mt-6 font-display text-5xl md:text-7xl font-semibold text-white leading-[1.05] max-w-3xl text-balance">
              A community that feels like home
            </h1>
          </MotionFade>
          <MotionFade delay={0.16}>
            <p className="mt-6 text-lg md:text-xl text-white/90 max-w-xl">
              Meet the neighbours in your building, make real connections, and never miss a community moment — all in one warm, private space.
            </p>
          </MotionFade>
          <MotionFade delay={0.24}>
            <div className="mt-9 flex flex-wrap gap-3">
              <Button asChild size="lg" className="bg-flamingo hover:bg-flamingo/90 rounded-xl text-base h-12 px-7">
                <Link href="/login">Enter the Hub <ArrowRight className="h-5 w-5 ml-2" /></Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-xl text-base h-12 px-7 bg-white/10 text-white border-white/40 hover:bg-white/20 hover:text-white">
                <Link href="#features">How it works</Link>
              </Button>
            </div>
          </MotionFade>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 md:py-28">
        <div className="container">
          <MotionFade>
            <div className="text-center max-w-2xl mx-auto">
              <p className="text-xs font-semibold uppercase tracking-widest text-flamingo">Belong here</p>
              <h2 className="mt-3 font-display text-4xl md:text-5xl font-semibold text-secondary">Everything you need to feel at home</h2>
              <p className="mt-4 text-muted-foreground text-lg">Three simple ways Resident Hub turns a building full of strangers into a neighbourhood.</p>
            </div>
          </MotionFade>
          <div className="mt-14 grid gap-7 md:grid-cols-3">
            {FEATURES.map((f, i) => (
              <MotionFade key={f.title} delay={i * 0.1}>
                <Card className="rounded-2xl overflow-hidden border-nobel/40 shadow-soft hover:shadow-lift transition-shadow h-full">
                  <div className="h-44 overflow-hidden">
                    <img src={f.img} alt={f.title} className="h-full w-full object-cover" />
                  </div>
                  <CardContent className="p-6">
                    <div className="h-11 w-11 rounded-xl bg-accent flex items-center justify-center -mt-11 relative z-10 border-4 border-white">
                      <f.icon className="h-5 w-5 text-flamingo" />
                    </div>
                    <h3 className="mt-4 font-display text-xl font-semibold text-secondary">{f.title}</h3>
                    <p className="mt-2 text-muted-foreground">{f.body}</p>
                  </CardContent>
                </Card>
              </MotionFade>
            ))}
          </div>
        </div>
      </section>

      {/* Belonging strip */}
      <section className="pb-24">
        <div className="container">
          <div className="relative overflow-hidden rounded-3xl">
            <img src={IMAGES.neighbours} alt="Neighbours connecting" className="h-[360px] w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-secondary/90 to-secondary/30" />
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
              <h2 className="font-display text-3xl md:text-5xl font-semibold text-white max-w-2xl">Your next friend might be one floor away</h2>
              <Button asChild size="lg" className="mt-7 bg-white text-secondary hover:bg-white/90 rounded-xl h-12 px-7">
                <Link href="/login">Continue with Tenant SSO <ArrowRight className="h-5 w-5 ml-2" /></Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-nobel/40 py-10">
        <div className="container flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="h-7 w-7 rounded-lg bg-flamingo flex items-center justify-center"><Home className="h-4 w-4 text-white" /></span>
            <span className="font-display font-semibold text-secondary">Resident Hub</span>
          </div>
          <p>A community-building demo · inspired by Avenue Living</p>
          <p>© {new Date().getFullYear()} Resident Hub</p>
        </div>
      </footer>
    </div>
  )
}

export default App
