'use client'
import { PawPrint, Megaphone, CalendarHeart, HandHelping, Gift, Search, Newspaper, Pin, CheckCircle2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

const CATEGORY_META = {
  NEWSLETTER: { label: 'Newsletter', icon: Newspaper, color: 'text-secondary', bg: 'bg-secondary/10' },
  ANNOUNCEMENT: { label: 'Notice', icon: Megaphone, color: 'text-secondary', bg: 'bg-secondary/10' },
  EVENT: { label: 'Event', icon: CalendarHeart, color: 'text-flamingo', bg: 'bg-accent' },
  PET_HELP: { label: 'Pet Help', icon: PawPrint, color: 'text-flamingo', bg: 'bg-accent' },
  HELP_WANTED: { label: 'Help Wanted', icon: HandHelping, color: 'text-flamingo', bg: 'bg-accent' },
  GIVEAWAY: { label: 'Giveaway', icon: Gift, color: 'text-flamingo', bg: 'bg-accent' },
  LOST_AND_FOUND: { label: 'Lost & Found', icon: Search, color: 'text-flamingo', bg: 'bg-accent' },
}

const relTime = (iso) => {
  const diff = Date.now() - new Date(iso).getTime()
  const h = Math.floor(diff / 3600000)
  if (h < 1) return 'Just now'
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  if (d === 1) return 'Yesterday'
  if (d < 7) return `${d}d ago`
  return new Date(iso).toLocaleDateString('en-CA', { month: 'short', day: 'numeric' })
}

export function CommunityPostCard({ post }) {
  const meta = CATEGORY_META[post.category] || CATEGORY_META.ANNOUNCEMENT
  const Icon = meta.icon
  const authorName = post.author ? `${post.author.firstName} ${post.author.lastInitial}.` : 'A neighbour'
  const initials = post.author ? `${post.author.firstName?.[0] || ''}${post.author.lastInitial || ''}` : '?'

  return (
    <Card className={cn(
      'rounded-2xl border-nobel/40 shadow-soft hover:shadow-lift transition-shadow h-full',
      post.isPinned && 'border-secondary/40 bg-secondary/[0.03]'
    )}>
      <CardContent className="p-5 flex flex-col h-full">
        <div className="flex items-center justify-between gap-2">
          <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold', meta.bg, meta.color)}>
            <Icon className="h-3.5 w-3.5" /> {meta.label}
          </span>
          {post.isPinned ? (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-secondary">
              <Pin className="h-3.5 w-3.5" /> Pinned
            </span>
          ) : null}
          {post.status === 'RESOLVED' ? (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground">
              <CheckCircle2 className="h-3.5 w-3.5" /> Resolved
            </span>
          ) : null}
        </div>

        <h3 className="mt-3 font-display text-lg font-semibold text-secondary leading-snug">{post.title}</h3>
        <p className="mt-1.5 text-sm text-muted-foreground line-clamp-3 flex-1">{post.description}</p>

        <div className="mt-4 flex items-center gap-2 pt-3 border-t border-nobel/30">
          <Avatar className="h-7 w-7">
            <AvatarFallback className={cn('text-[10px] text-white', post.isStaffPost ? 'bg-secondary' : 'bg-flamingo')}>{initials}</AvatarFallback>
          </Avatar>
          <span className="text-xs font-medium text-ink">
            {post.isStaffPost ? 'Community Team' : authorName}
          </span>
          <span className="text-xs text-muted-foreground ml-auto">{relTime(post.createdAt)}</span>
        </div>
      </CardContent>
    </Card>
  )
}