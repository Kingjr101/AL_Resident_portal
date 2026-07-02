'use client'
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { Home, Loader2, LogOut, RefreshCw, ShieldCheck } from 'lucide-react'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

const NAV = {
  RESIDENT: [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/discover', label: 'Discover' },
  ],
  STAFF: [
    { href: '/staff', label: 'Overview' },
    { href: '/staff/reports', label: 'Reports' },
  ],
}

export function AppShell({ requireRole, children }) {
  const router = useRouter()
  const pathname = usePathname()
  const [state, setState] = useState({ loading: true, user: null, property: null })

  useEffect(() => {
    let active = true
    ;(async () => {
      try {
        const res = await fetch('/api/auth/session', { credentials: 'include' })
        const data = await res.json()
        if (!active) return
        if (!data.user) { router.replace('/login'); return }
        if (requireRole && data.user.role !== requireRole) {
          router.replace(data.user.role === 'STAFF' ? '/staff' : '/dashboard')
          return
        }
        setState({ loading: false, user: data.user, property: data.property })
      } catch {
        router.replace('/login')
      }
    })()
    return () => { active = false }
  }, [requireRole, router])

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
    router.replace('/login')
  }

  if (state.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-flamingo" />
      </div>
    )
  }

  const { user, property } = state
  const nav = NAV[user.role] || []
  const homeHref = user.role === 'STAFF' ? '/staff' : '/dashboard'
  const initials = `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-nobel/40 bg-cream/85 backdrop-blur supports-[backdrop-filter]:bg-cream/70">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href={homeHref} className="flex items-center gap-2">
              <span className="h-9 w-9 rounded-xl bg-flamingo flex items-center justify-center">
                <Home className="h-5 w-5 text-white" />
              </span>
              <span className="font-display text-lg font-semibold text-secondary">Resident Hub</span>
            </Link>
            <nav className="hidden md:flex items-center gap-1">
              {nav.map(item => {
                const active = pathname === item.href || (item.href !== homeHref && pathname.startsWith(item.href))
                return (
                  <Link key={item.href} href={item.href}
                    className={cn(
                      'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                      active ? 'bg-accent text-flamingo' : 'text-ink/70 hover:text-flamingo hover:bg-accent/60'
                    )}>
                    {item.label}
                  </Link>
                )
              })}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            {user.role === 'STAFF' ? (
              <span className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold text-secondary bg-secondary/10 px-2.5 py-1 rounded-full">
                <ShieldCheck className="h-3.5 w-3.5" /> Staff
              </span>
            ) : null}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-full pl-1 pr-2 py-1 hover:bg-accent/60 transition-colors">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-secondary text-white text-xs">{initials}</AvatarFallback>
                  </Avatar>
                  <span className="hidden sm:block text-sm font-medium text-ink">{user.firstName}</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="font-medium">{user.firstName} {user.lastName}</div>
                  <div className="text-xs text-muted-foreground font-normal">{property?.buildingName}</div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}><RefreshCw className="h-4 w-4 mr-2" /> Switch demo role</DropdownMenuItem>
                <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive"><LogOut className="h-4 w-4 mr-2" /> Log out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
      <main className="container py-8 md:py-10">{children}</main>
    </div>
  )
}
