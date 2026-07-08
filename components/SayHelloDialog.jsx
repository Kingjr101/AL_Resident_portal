'use client'
import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, UserPlus } from 'lucide-react'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { toast } from 'sonner'

// Fully client-side scripted chat. No AI, no sockets, nothing persisted to the DB.
export function SayHelloDialog({ open, onOpenChange, resident }) {
  const [script, setScript] = useState(null)
  const [loading, setLoading] = useState(false)
  const [messages, setMessages] = useState([]) // { from: 'resident' | 'user', text }
  const [used, setUsed] = useState([])          // indices of quickReplies already clicked
  const [typing, setTyping] = useState(false)
  const [done, setDone] = useState(false)
  const bottomRef = useRef(null)
  const timers = useRef([])

  const clearTimers = () => { timers.current.forEach(clearTimeout); timers.current = [] }
  const addTimer = (fn, ms) => { const t = setTimeout(fn, ms); timers.current.push(t); return t }

  // Load the resident's chat script when the dialog opens, then reveal the greeting.
  useEffect(() => {
    if (!open || !resident?.id) return
    setScript(null); setMessages([]); setUsed([]); setTyping(false); setDone(false); setLoading(true)
    let cancelled = false
    fetch(`/api/chat-script/${resident.id}`, { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('failed'))))
      .then((data) => {
        if (cancelled) return
        const s = data.chatScript
        setScript(s)
        setLoading(false)
        addTimer(() => { if (!cancelled) setMessages([{ from: 'resident', text: s.greeting }]) }, 500)
      })
      .catch(() => { if (!cancelled) { setLoading(false); toast.error('Could not start the chat. Try again in a moment.') } })
    return () => { cancelled = true; clearTimers() }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, resident?.id])

  // Auto-scroll to the newest message.
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, typing, done])

  const remaining = script
    ? script.quickReplies.map((q, i) => ({ ...q, i })).filter((q) => !used.includes(q.i))
    : []
  const firstResidentIdx = messages.findIndex((m) => m.from === 'resident')

  const handleReply = (qr) => {
    if (typing || done) return
    const nextUsedCount = used.length + 1
    setUsed((prev) => [...prev, qr.i])
    setMessages((prev) => [...prev, { from: 'user', text: qr.label }])
    setTyping(true)
    addTimer(() => {
      setTyping(false)
      setMessages((prev) => [...prev, { from: 'resident', text: qr.response }])
      // After exactly 3 exchanges, deliver the closer + reveal the CTA.
      if (nextUsedCount >= 3) {
        addTimer(() => {
          setTyping(true)
          addTimer(() => {
            setTyping(false)
            setMessages((prev) => [...prev, { from: 'resident', text: script.closer }])
            setDone(true)
          }, 800)
        }, 500)
      }
    }, 800)
  }

  const name = `${resident?.firstName || ''} ${resident?.lastName || ''}`.trim()
  const initials = `${resident?.firstName?.[0] || ''}${(resident?.lastName || '').replace('.', '')[0] || ''}`

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl sm:max-w-md p-0 overflow-hidden gap-0">
        <DialogHeader className="px-5 py-4 border-b border-nobel/40 bg-cream">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={resident?.photoUrl} alt={resident?.firstName} />
              <AvatarFallback className="bg-secondary text-white text-xs">{initials}</AvatarFallback>
            </Avatar>
            <div className="text-left">
              <DialogTitle className="font-display text-secondary text-base leading-tight">{name || 'Say hello'}</DialogTitle>
              <p className="text-xs text-muted-foreground">Say hello · demo chat</p>
            </div>
          </div>
        </DialogHeader>

        {/* Messages */}
        <div className="px-5 py-4 h-[340px] overflow-y-auto no-scrollbar bg-background">
          {loading ? (
            <div className="h-full flex items-center justify-center"><Loader2 className="h-5 w-5 animate-spin text-flamingo" /></div>
          ) : (
            <div className="flex flex-col gap-2">
              <AnimatePresence initial={false}>
                {messages.map((m, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                    className={m.from === 'user' ? 'flex justify-end' : 'flex justify-start items-end gap-2'}
                  >
                    {m.from === 'resident' ? (
                      <Avatar className="h-7 w-7 shrink-0">
                        <AvatarImage src={resident?.photoUrl} alt={resident?.firstName} />
                        <AvatarFallback className="bg-secondary text-white text-[10px]">{initials}</AvatarFallback>
                      </Avatar>
                    ) : null}
                    <div className="max-w-[78%]">
                      {m.from === 'resident' && idx === firstResidentIdx ? (
                        <p className="text-xs font-medium text-muted-foreground mb-1 ml-1">{resident?.firstName}</p>
                      ) : null}
                      <div className={m.from === 'user'
                        ? 'rounded-2xl rounded-br-md bg-flamingo text-white px-4 py-2 text-sm shadow-soft'
                        : 'rounded-2xl rounded-bl-md bg-white border border-nobel/40 text-ink px-4 py-2 text-sm shadow-soft'}>
                        {m.text}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {typing ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start items-end gap-2">
                  <Avatar className="h-7 w-7 shrink-0">
                    <AvatarImage src={resident?.photoUrl} alt={resident?.firstName} />
                    <AvatarFallback className="bg-secondary text-white text-[10px]">{initials}</AvatarFallback>
                  </Avatar>
                  <div className="rounded-2xl rounded-bl-md bg-white border border-nobel/40 px-4 py-3 shadow-soft">
                    <div className="flex gap-1">
                      {[0, 1, 2].map((i) => (
                        <motion.span key={i} className="h-2 w-2 rounded-full bg-nobel"
                          animate={{ opacity: [0.3, 1, 0.3], y: [0, -2, 0] }}
                          transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15 }} />
                      ))}
                    </div>
                  </div>
                </motion.div>
              ) : null}
              <div ref={bottomRef} />
            </div>
          )}
        </div>

        {/* Quick replies / CTA */}
        <div className="px-5 py-4 border-t border-nobel/40 bg-cream space-y-2">
          {!loading && !done ? (
            <AnimatePresence initial={false}>
              {remaining.map((qr) => (
                <motion.div key={qr.i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0 }}>
                  <Button
                    variant="outline"
                    disabled={typing || messages.length === 0}
                    onClick={() => handleReply(qr)}
                    className="w-full justify-start rounded-xl border-nobel/50 text-left h-auto py-2.5 whitespace-normal hover:bg-orange-50 hover:border-flamingo hover:text-flamingo"
                  >
                    {qr.label}
                  </Button>
                </motion.div>
              ))}
            </AnimatePresence>
          ) : null}

          {done ? (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <Button
                className="w-full rounded-xl bg-flamingo hover:bg-flamingo/90"
                onClick={() => { toast.success(`Connection request sent to ${resident?.firstName}.`); onOpenChange(false) }}
              >
                <UserPlus className="h-4 w-4 mr-1.5" /> Send connection request
              </Button>
            </motion.div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  )
}