'use client'
import { useState } from 'react'
import { Flag, Loader2 } from 'lucide-react'
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

const REASONS = [
  { value: 'HARASSMENT', label: 'Harassment' },
  { value: 'SPAM', label: 'Spam' },
  { value: 'INAPPROPRIATE', label: 'Inappropriate behaviour' },
  { value: 'SAFETY_CONCERN', label: 'Safety concern' },
  { value: 'OTHER', label: 'Other' },
]

export function ReportDialog({ reportedUserId, connectionId = null, messageId = null, trigger, label = 'Report' }) {
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState('')
  const [details, setDetails] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async () => {
    if (!reason) { toast.error('Please choose a reason.'); return }
    setLoading(true)
    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ reportedUserId, connectionId, messageId, reason, details }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed')
      setOpen(false); setReason(''); setDetails('')
      toast.success('Thanks — our community team will review this within 24 hours.')
    } catch (e) {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-destructive">
            <Flag className="h-4 w-4 mr-1.5" /> {label}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="rounded-2xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-secondary">Report to the community team</DialogTitle>
          <DialogDescription>
            Your report is confidential. Our team reviews every report and never shares your identity with the person reported.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Reason</Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger><SelectValue placeholder="Choose a reason" /></SelectTrigger>
              <SelectContent>
                {REASONS.map(r => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Details <span className="text-muted-foreground font-normal">(optional)</span></Label>
            <Textarea value={details} onChange={(e) => setDetails(e.target.value)} placeholder="Add anything that helps us understand what happened." rows={4} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>Cancel</Button>
          <Button onClick={submit} disabled={loading} className="bg-flamingo hover:bg-flamingo/90">
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : <Flag className="h-4 w-4 mr-1.5" />}
            Submit report
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
