'use client'
import { useState } from 'react'
import { Loader2, Plus, Megaphone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogFooter,
} from '@/components/ui/dialog'
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from '@/components/ui/select'
import { toast } from 'sonner'

const POST_CATEGORIES = [
  { value: 'ANNOUNCEMENT', label: 'Notice' },
  { value: 'EVENT', label: 'Event' },
  { value: 'PET_HELP', label: 'Pet Help' },
  { value: 'HELP_WANTED', label: 'Help Wanted' },
  { value: 'GIVEAWAY', label: 'Giveaway' },
  { value: 'LOST_AND_FOUND', label: 'Lost & Found' },
  { value: 'ROOM_BOOKING', label: 'Room Booking' },
]

export function CreateCommunityPostDialog({ onCreated }) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [loading, setLoading] = useState(false)

  const reset = () => { setTitle(''); setDescription(''); setCategory('') }

  const submit = async () => {
    if (!title.trim()) { toast.error('Please add a title.'); return }
    if (!category) { toast.error('Please choose a category.'); return }
    if (!description.trim()) { toast.error('Please add a short description.'); return }
    setLoading(true)
    try {
      const res = await fetch('/api/community-posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ title, description, category, expiresInDays: 14 }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed')
      setOpen(false); reset()
      toast.success('Your post is live on the community board.')
      if (typeof onCreated === 'function') onCreated()
    } catch (e) {
      toast.error(e.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) reset() }}>
      <DialogTrigger asChild>
        <Button className="rounded-xl bg-secondary hover:bg-secondary/90">
          <Plus className="h-4 w-4 mr-1.5" /> New post
        </Button>
      </DialogTrigger>
      <DialogContent className="rounded-2xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-secondary flex items-center gap-2">
            <Megaphone className="h-5 w-5 text-flamingo" /> Post to the community board
          </DialogTitle>
          <DialogDescription>
            Share a notice with neighbours in your building. Posts expire automatically after two weeks.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Title</Label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={120}
              placeholder="e.g. Looking for a dog sitter this Saturday"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
          </div>

          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger><SelectValue placeholder="Choose a category" /></SelectTrigger>
              <SelectContent>
                {POST_CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Details</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={1000}
              rows={4}
              placeholder="Add the details neighbours need to know. Avoid sharing personal contact info here."
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>Cancel</Button>
          <Button onClick={submit} disabled={loading} className="bg-secondary hover:bg-secondary/90">
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : <Plus className="h-4 w-4 mr-1.5" />}
            Post to board
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
