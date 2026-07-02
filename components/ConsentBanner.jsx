import Link from 'next/link'
import { ShieldCheck } from 'lucide-react'

export function ConsentBanner({ isOpen = true }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-secondary/20 bg-secondary/5 px-4 py-3 text-sm">
      <ShieldCheck className="h-5 w-5 text-secondary shrink-0 mt-0.5" />
      <p className="text-secondary/90">
        {isOpen
          ? 'You are visible to neighbours in your building. '
          : 'You are hidden from discovery. '}
        This is always your choice — update it anytime in{' '}
        <Link href="/settings" className="font-semibold underline underline-offset-2 hover:text-flamingo">settings</Link>.
      </p>
    </div>
  )
}
