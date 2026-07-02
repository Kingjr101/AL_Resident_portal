'use client'
import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { MapPin, ArrowRight, MessageCircle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { HobbyChip } from '@/components/HobbyChip'
import { SayHelloDialog } from '@/components/SayHelloDialog'

export function ResidentCard({ resident }) {
  const [helloOpen, setHelloOpen] = useState(false)
  const initials = `${resident.firstName?.[0] || ''}${(resident.lastName || '').replace('.', '')[0] || ''}`
  return (
    <motion.div whileHover={{ y: -4 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
      <Card className="rounded-2xl overflow-hidden border-nobel/40 shadow-soft hover:shadow-lift transition-shadow h-full">
        <CardContent className="p-5 flex flex-col h-full">
          <div className="flex items-center gap-3">
            <Avatar className="h-14 w-14 border-2 border-white shadow-soft">
              <AvatarImage src={resident.photoUrl} alt={resident.firstName} />
              <AvatarFallback className="bg-secondary text-white">{initials}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <h3 className="font-semibold text-ink truncate">{resident.firstName} {resident.lastName}</h3>
              <p className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="h-3 w-3" /> Unit {resident.unitNumber}</p>
            </div>
          </div>
          {resident.bio ? <p className="mt-3 text-sm text-muted-foreground line-clamp-2">{resident.bio}</p> : null}
          <div className="mt-3 flex flex-wrap gap-1.5">
            {(resident.hobbies || []).slice(0, 3).map(h => <HobbyChip key={h} label={h} size="sm" />)}
          </div>
          <div className="mt-auto pt-4 grid grid-cols-2 gap-2">
            <Button onClick={() => setHelloOpen(true)} className="rounded-xl bg-flamingo hover:bg-flamingo/90">
              <MessageCircle className="h-4 w-4 mr-1.5" /> Say hello
            </Button>
            <Button asChild variant="outline" className="rounded-xl border-nobel/50 hover:border-flamingo hover:text-flamingo">
              <Link href={`/profile/${resident.id}`}>Profile <ArrowRight className="h-4 w-4 ml-1.5" /></Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <SayHelloDialog open={helloOpen} onOpenChange={setHelloOpen} resident={resident} />
    </motion.div>
  )
}
