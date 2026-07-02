'use client'
import { useEffect, useState } from 'react'
import { Flag, Loader2, FileText, MessageSquareWarning } from 'lucide-react'
import { AppShell } from '@/components/AppShell'
import { PageHeader } from '@/components/PageHeader'
import { EmptyState } from '@/components/EmptyState'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

const STATUS_STYLES = {
  OPEN: 'bg-destructive/10 text-destructive',
  REVIEWING: 'bg-amber-100 text-amber-700',
  RESOLVED: 'bg-secondary/10 text-secondary',
  DISMISSED: 'bg-muted text-muted-foreground',
}
const REASON_LABELS = { HARASSMENT: 'Harassment', SPAM: 'Spam', INAPPROPRIATE: 'Inappropriate', SAFETY_CONCERN: 'Safety concern', OTHER: 'Other' }
const fmt = (d) => d ? new Date(d).toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'
const shortId = (id) => id ? id.slice(-4).toUpperCase() : ''

function ReportsInner() {
  const [reports, setReports] = useState(null)
  const [active, setActive] = useState(null)
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)

  const load = () => fetch('/api/staff/reports', { credentials: 'include' }).then(r => r.json()).then(d => setReports(d.reports || []))
  useEffect(() => { load() }, [])

  const open = (r) => { setActive(r); setNotes(r.staffNotes || '') }

  const update = async (status) => {
    setSaving(true)
    try {
      const res = await fetch('/api/staff/reports', {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify({ id: active.id, status, staffNotes: notes }),
      })
      if (!res.ok) throw new Error()
      toast.success(`Report #${shortId(active.id)} marked ${status.toLowerCase()}.`)
      setActive(null); await load()
    } catch { toast.error('Could not update report.') } finally { setSaving(false) }
  }

  const openCount = (reports || []).filter(r => r.status === 'OPEN' || r.status === 'REVIEWING').length

  return (
    <>
      <PageHeader
        eyebrow="Moderation"
        title="Reports queue"
        subtitle="Every report is reviewed by the community team. Message content is only visible when a resident attaches it to a report."
        action={openCount > 0 ? <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-destructive bg-destructive/10 px-3 py-1.5 rounded-full"><Flag className="h-4 w-4" /> {openCount} needs review</span> : null}
      />

      {reports === null ? (
        <div className="flex justify-center py-24"><Loader2 className="h-6 w-6 animate-spin text-flamingo" /></div>
      ) : reports.length === 0 ? (
        <EmptyState icon={FileText} title="A calm, quiet queue" message="No reports right now — your community is doing great." />
      ) : (
        <div className="rounded-2xl border border-nobel/40 bg-white overflow-hidden shadow-soft">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Reporter</TableHead>
                <TableHead>Reported user</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports.map(r => (
                <TableRow key={r.id} className="cursor-pointer" onClick={() => open(r)}>
                  <TableCell className="font-medium">{r.reporter}</TableCell>
                  <TableCell>{r.reportedUser}</TableCell>
                  <TableCell>{REASON_LABELS[r.reason] || r.reason}</TableCell>
                  <TableCell><span className={cn('text-xs font-semibold px-2.5 py-1 rounded-full', STATUS_STYLES[r.status])}>{r.status}</span></TableCell>
                  <TableCell className="text-muted-foreground">{fmt(r.createdAt)}</TableCell>
                  <TableCell className="text-right"><Button size="sm" variant="outline" className="rounded-lg" onClick={(e) => { e.stopPropagation(); open(r) }}>Review</Button></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={!!active} onOpenChange={(o) => !o && setActive(null)}>
        <DialogContent className="rounded-2xl sm:max-w-lg">
          {active ? (
            <>
              <DialogHeader>
                <DialogTitle className="font-display text-secondary">Report #{shortId(active.id)} · {REASON_LABELS[active.reason]}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><p className="text-muted-foreground text-xs uppercase tracking-wide">Reporter</p><p className="font-medium">{active.reporter}</p></div>
                  <div><p className="text-muted-foreground text-xs uppercase tracking-wide">Reported</p><p className="font-medium">{active.reportedUser}</p></div>
                </div>
                {active.details ? <div><p className="text-muted-foreground text-xs uppercase tracking-wide mb-1">Details</p><p className="text-sm text-ink/80">{active.details}</p></div> : null}

                {active.messageSnippet ? (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                    <div className="flex items-center gap-2 text-amber-700 text-xs font-semibold mb-2">
                      <MessageSquareWarning className="h-4 w-4" /> Attached to Report #{shortId(active.id)} — message content visible for review
                    </div>
                    <p className="text-sm text-ink/80 italic">“{active.messageSnippet.content}”</p>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">No conversation attached — private messages remain hidden.</p>
                )}

                <div>
                  <p className="text-muted-foreground text-xs uppercase tracking-wide mb-1">Staff notes</p>
                  <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder="Document the action taken…" />
                </div>
              </div>
              <DialogFooter className="flex-col sm:flex-row gap-2">
                <Button variant="outline" disabled={saving} onClick={() => update('REVIEWING')} className="rounded-xl">Mark reviewing</Button>
                <Button variant="outline" disabled={saving} onClick={() => update('DISMISSED')} className="rounded-xl">Dismiss</Button>
                <Button disabled={saving} onClick={() => update('RESOLVED')} className="bg-secondary hover:bg-secondary/90 rounded-xl">{saving ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : null} Resolve</Button>
              </DialogFooter>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  )
}

export default function StaffReportsPage() {
  return <AppShell requireRole="STAFF"><ReportsInner /></AppShell>
}
