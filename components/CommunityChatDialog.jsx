'use client'
import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { UserPlus } from 'lucide-react'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { toast } from 'sonner'

// Post-aware scripted chat. Quick replies are generated from the post's category,
// so the conversation is relevant to the notice. No AI, no sockets, nothing persisted.

const scriptFor = (post) => {
  const first = post?.author?.firstName || 'there'
  const title = post?.title || 'your post'

  const SCRIPTS = {
    GIVEAWAY: {
      greeting: `Hey! Thanks for your interest in "${title}" 👋`,
      quickReplies: [
        { label: 'Are these still available?', response: 'Yep, still up for grabs! First come, first served 🙌' },
        { label: 'When could I pick them up?', response: 'Anytime this week works — just send me a time that suits you.' },
        { label: 'Where should I meet you?', response: "I'm in the building, so I can bring them down to the lobby." },
      ],
      closer: 'Sounds good — just let me know when and they’re yours!',
    },
    PET_HELP: {
      greeting: `Hi! 👋 Thanks for reaching out about "${title}".`,
      quickReplies: [
        { label: "I'd be happy to help!", response: "Oh that's amazing, thank you so much! 🐾" },
        { label: 'What time do you need?', response: 'Just a couple hours in the afternoon — super low key.' },
        { label: 'Any special instructions?', response: "Nothing tricky — food, water, and a bit of company. That's it!" },
      ],
      closer: "You're a lifesaver — I really appreciate it!",
    },
    LOST_AND_FOUND: {
      greeting: `Hi! 👋 You messaged about "${title}".`,
      quickReplies: [
        { label: 'I think those might be mine!', response: 'Oh great! Can you describe them so I know for sure?' },
        { label: 'Where did you find them?', response: 'Right near the main-floor elevator earlier today.' },
        { label: 'How can I get them back?', response: "I'll be around this evening — happy to meet in the lobby." },
      ],
      closer: 'Perfect — glad we could sort that out!',
    },
    HELP_WANTED: {
      greeting: `Hey! 👋 Thanks for offering to help with "${title}".`,
      quickReplies: [
        { label: 'Happy to lend a hand!', response: 'Amazing, thank you! That really helps me out 🙏' },
        { label: 'When do you need it done?', response: 'Sometime this week if you can — no rush at all.' },
        { label: 'Anything I should bring?', response: 'Nope, just yourself. I’ve got everything else covered.' },
      ],
      closer: 'Thanks so much — let’s find a time that works!',
    },
    EVENT: {
      greeting: `Hi! 👋 Thanks for asking about "${title}".`,
      quickReplies: [
        { label: 'Can I come along?', response: 'Absolutely, the more the merrier! 🎉' },
        { label: 'What time does it start?', response: 'We’re kicking off in the evening — I’ll send the details.' },
        { label: 'Should I bring anything?', response: 'Just good vibes. Snacks welcome but never required 😄' },
      ],
      closer: 'Awesome — see you there!',
    },
    ROOM_BOOKING: {
      greeting: `Hi! 👋 You messaged about "${title}".`,
      quickReplies: [
        { label: 'Is the room still free?', response: 'Let me double-check the time — should be good though!' },
        { label: 'What time did you book?', response: 'I’ve got it for a couple hours — happy to share the slot.' },
        { label: 'Mind if I join?', response: 'Not at all, come by! Always nicer with company.' },
      ],
      closer: 'Great — I’ll see you then!',
    },
    ANNOUNCEMENT: {
      greeting: `Hi! 👋 Thanks for reaching out about "${title}".`,
      quickReplies: [
        { label: 'Thanks for the heads up!', response: 'Of course! Just wanted to keep everyone in the loop 🙂' },
        { label: 'Any more details?', response: 'Happy to share whatever helps — ask away!' },
        { label: 'Good to know 👍', response: 'Glad it’s useful. See you around the building!' },
      ],
      closer: 'Thanks for being part of the community!',
    },
  }

  return SCRIPTS[post?.category] || {
    greeting: `Hi! 👋 Thanks for reaching out about "${title}".`,
    quickReplies: [
      { label: 'Tell me more!', response: 'Happy to — what would you like to know?' },
      { label: 'Is this still relevant?', response: 'Yep! Still good. Let me know how I can help.' },
      { label: 'How do we connect?', response: "I'm around the building — easy to sort out." },
    ],
    closer: 'Thanks for reaching out — talk soon!',
  }
}

export function CommunityChatDialog({ open, onOpenChange, post }) {
  const [script, setScript] = useState(null)
  const [messages, setMessages] = useState([])
  const [used, setUsed] = useState([])
  const [typing, setTyping] = useState(false)
  const [done, setDone] = useState(false)
  const bottomRef = useRef(null)
  const timers = useRef([])

  const clearTimers = () => { timers.current.forEach(clearTimeout); timers.current = [] }
  const addTimer = (fn, ms) => { const t = setTimeout(fn, ms); timers.current.push(t); return t }

  useEffect(() => {
    if (!open || !post) return
    const s = scriptFor(post)
    setScript(s); setMessages([]); setUsed([]); setTyping(false); setDone(false)
    let cancelled = false
    addTimer(() => { if (!cancelled) setMessages([{ from: 'author', text: s.greeting }]) }, 400)
    return () => { cancelled = true; clearTimers() }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, post?.id])

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, typing, done])

  const remaining = script
    ? script.quickReplies.map((q, i) => ({ ...q, i })).filter((q) => !used.includes(q.i))
    : []
  const firstAuthorIdx = messages.findIndex((m) => m.from === 'author')

  const handleReply = (qr) => {
    if (typing || done) return
    const nextUsedCount = used.length + 1
    setUsed((prev) => [...prev, qr.i])
    setMessages((prev) => [...prev, { from: 'user', text: qr.label }])
    setTyping(true)
    addTimer(() => {
      setTyping(false)
      setMessages((prev) => [...prev, { from: 'author', text: qr.response }])
      if (nextUsedCount >= 3) {
        addTimer(() => {
          setTyping(true)
          addTimer(() => {
            setTyping(false)
            setMessages((prev) => [...prev, { from: 'author', text: script.closer }])
            setDone(true)
          }, 800)
        }, 500)
      }
    }, 800)
  }

  const first = post?.author?.firstName || ''
  const last = post?.author?.lastName || ''
  const name = `${first} ${last}`.trim()
  const initials = `${first?.[0] || ''}${(last || '').replace('.', '')[0] || ''}`
  const photoUrl = post?.author?.photoUrl || null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl sm:max-w-md p-0 overflow-hidden gap-0">
        <DialogHeader className="px-5 py-4 border-b border-nobel/40 bg-cream">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              {photoUrl ? <AvatarImage src={photoUrl} alt={first} /> : null}
              <AvatarFallback className="bg-secondary text-white text-xs">{initials}</AvatarFallback>
            </Avatar>
            <div className="text-left min-w-0">
              <DialogTitle className="font-display text-secondary text-base leading-tight">{name || 'Community chat'}</DialogTitle>
              <p className="text-xs text-muted-foreground truncate">About: {post?.title || 'a post'}</p>
            </div>
          </div>
        </DialogHeader>

        <div className="px-5 py-4 h-[340px] overflow-y-auto no-scrollbar bg-background">
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
                  {m.from === 'author' ? (
                    <Avatar className="h-7 w-7 shrink-0">
                      {photoUrl ? <AvatarImage src={photoUrl} alt={first} /> : null}
                      <AvatarFallback className="bg-secondary text-white text-[10px]">{initials}</AvatarFallback>
                    </Avatar>
                  ) : null}
                  <div className="max-w-[78%]">
                    {m.from === 'author' && idx === firstAuthorIdx ? (
                      <p className="text-xs font-medium text-muted-foreground mb-1 ml-1">{first}</p>
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
                  {photoUrl ? <AvatarImage src={photoUrl} alt={first} /> : null}
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
        </div>

        <div className="px-5 py-4 border-t border-nobel/40 bg-cream space-y-2">
          {!done ? (
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
                onClick={() => { toast.success(`Connection request sent to ${first}.`); onOpenChange(false) }}
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
