'use client'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Megaphone, Loader2 } from 'lucide-react'
import { AppShell } from '@/components/AppShell'
import { PageHeader } from '@/components/PageHeader'
import { EmptyState } from '@/components/EmptyState'
import { MotionFade } from '@/components/MotionFade'
import { CommunityPostCard } from '@/components/CommunityPostCard'
import { CommunityCategoryFilter } from '@/components/CommunityCategoryFilter'
import { CreateCommunityPostDialog } from '@/components/CreateCommunityPostDialog'
import { CommunityChatDialog } from '@/components/CommunityChatDialog'
import { toast } from 'sonner'

function BoardInner() {
  const [posts, setPosts] = useState(null)
  const [filter, setFilter] = useState('ALL')
  const [chatPost, setChatPost] = useState(null)

  const load = useCallback(() => {
    fetch('/api/community-posts', { credentials: 'include' })
      .then(r => r.json())
      .then(d => setPosts(d.posts || []))
      .catch(() => setPosts([]))
  }, [])

  useEffect(() => { load() }, [load])

  const filtered = useMemo(() => {
    if (!posts) return []
    if (filter === 'ALL') return posts
    return posts.filter(p => p.category === filter)
  }, [posts, filter])

  const openChat = (post) => {
    if (!post.author) return
    setChatPost(post)
  }

  const resolvePost = async (post) => {
    try {
      const res = await fetch(`/api/community-posts/${post.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ action: 'resolve' }),
      })
      if (!res.ok) throw new Error()
      toast.success('Post marked as resolved.')
      load()
    } catch { toast.error('Could not update the post.') }
  }

  const reopenPost = async (post) => {
    try {
      const res = await fetch(`/api/community-posts/${post.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ action: 'reopen' }),
      })
      if (!res.ok) throw new Error()
      toast.success('Post reopened.')
      load()
    } catch { toast.error('Could not update the post.') }
  }

  const deletePost = async (post) => {
    try {
      const res = await fetch(`/api/community-posts/${post.id}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      if (!res.ok) throw new Error()
      toast.success('Post deleted.')
      load()
    } catch { toast.error('Could not delete the post.') }
  }

  return (
    <>
      <PageHeader
        eyebrow="Your building"
        title="Community Board"
        subtitle="Ask for a hand, share an update, or see what's happening in your building."
        action={<CreateCommunityPostDialog onCreated={load} />}
      />

      <div className="mb-6">
        <CommunityCategoryFilter active={filter} onChange={setFilter} />
      </div>

      {posts === null ? (
        <div className="flex justify-center py-24"><Loader2 className="h-6 w-6 animate-spin text-flamingo" /></div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={Megaphone} title="Nothing here yet" message="Be the first to post a notice for your building." />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p, i) => (
            <MotionFade key={p.id} delay={Math.min(i * 0.04, 0.3)} className="h-full">
              <CommunityPostCard
                post={p}
                onChat={openChat}
                onResolve={resolvePost}
                onReopen={reopenPost}
                onDelete={deletePost}
              />
            </MotionFade>
          ))}
        </div>
      )}

      <CommunityChatDialog
        open={!!chatPost}
        onOpenChange={(o) => !o && setChatPost(null)}
        post={chatPost}
      />
    </>
  )
}

export default function CommunityBoardPage() {
  return <AppShell requireRole="RESIDENT"><BoardInner /></AppShell>
}
