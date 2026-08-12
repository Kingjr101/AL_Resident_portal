'use client'
import { useEffect, useMemo, useState } from 'react'
import { Megaphone } from 'lucide-react'
import { AppShell } from '@/components/AppShell'
import { PageHeader } from '@/components/PageHeader'
import { EmptyState } from '@/components/EmptyState'
import { MotionFade } from '@/components/MotionFade'
import { CommunityPostCard } from '@/components/CommunityPostCard'
import { CommunityCategoryFilter } from '@/components/CommunityCategoryFilter'
import { Loader2 } from 'lucide-react'

function BoardInner() {
  const [posts, setPosts] = useState(null)
  const [filter, setFilter] = useState('ALL')

  useEffect(() => {
    fetch('/api/community-posts', { credentials: 'include' })
      .then(r => r.json())
      .then(d => setPosts(d.posts || []))
      .catch(() => setPosts([]))
  }, [])

  const filtered = useMemo(() => {
    if (!posts) return []
    if (filter === 'ALL') return posts
    return posts.filter(p => p.category === filter)
  }, [posts, filter])

  return (
    <>
      <PageHeader
        eyebrow="Your building"
        title="Community Board"
        subtitle="Ask for a hand, share an update, or see what's happening in your building."
      />

      <div className="mb-6">
        <CommunityCategoryFilter active={filter} onChange={setFilter} />
      </div>

      {posts === null ? (
        <div className="flex justify-center py-24"><Loader2 className="h-6 w-6 animate-spin text-flamingo" /></div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={Megaphone} title="Nothing here yet" message="When neighbours post notices, they'll show up here." />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p, i) => (
            <MotionFade key={p.id} delay={Math.min(i * 0.04, 0.3)} className="h-full">
              <CommunityPostCard post={p} />
            </MotionFade>
          ))}
        </div>
      )}
    </>
  )
}

export default function CommunityBoardPage() {
  return <AppShell requireRole="RESIDENT"><BoardInner /></AppShell>
}