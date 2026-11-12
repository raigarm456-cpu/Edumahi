/* There is no account yet, so this is the honest version of one: a local
   profile. It names what is already kept on this device — sets finished,
   bookmarks, the day streak — and offers the two things a login would have
   given: a way to start over, and a way to carry the history somewhere else
   as a file. Nothing here pretends to be a hosted account. */
import { useEffect, useState } from 'react'
import { Download, HardDrive, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { attempts, bookmarks, streakDays } from '@/lib/progress'
import { readStore, removeStore } from '@/lib/storage'
import { websiteReviews } from '@/lib/feedback'

/* The learner's own keys only. The owner's feedback inbox and the admin
   session are not the visitor's to delete. */
const KEYS = ['attempts', 'bookmarks', 'review-today']

type Snapshot = { attempts: number; bookmarks: number; streak: number; reviews: number }

function snapshot(): Snapshot {
  return {
    attempts: attempts().length,
    bookmarks: bookmarks().length,
    streak: streakDays(),
    reviews: websiteReviews().length,
  }
}

export function DeviceProfile() {
  const [open, setOpen] = useState(false)
  const [data, setData] = useState<Snapshot>(() => snapshot())
  const [wiped, setWiped] = useState(false)

  // The figures are read when the dialog opens, not on every render of a page.
  useEffect(() => {
    if (open) {
      setData(snapshot())
      setWiped(false)
    }
  }, [open])

  const rows = [
    { label: 'Sets finished', value: data.attempts },
    { label: 'Questions bookmarked', value: data.bookmarks },
    { label: 'Day streak', value: data.streak },
    { label: 'Reviews written', value: data.reviews },
  ]

  function exportHistory() {
    const payload: Record<string, unknown> = { exportedAt: new Date().toISOString(), site: 'EduMahi' }
    for (const key of ['attempts', 'bookmarks']) payload[key] = readStore(key, [])
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `edumahi-history-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  function clearHistory() {
    for (const key of KEYS) removeStore(key)
    setData(snapshot())
    setWiped(true)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="inline-flex h-9 items-center gap-1.5 rounded-md px-2 font-label text-sm font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label="Your profile on this device"
        >
          <HardDrive className="size-4" aria-hidden="true" />
          <span className="hidden sm:inline">This device</span>
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Your history lives on this device</DialogTitle>
          <DialogDescription>
            EduMahi has no accounts, so there is no sign-in to forget. Every set you finish and every
            question you save is stored in this browser only — it does not follow you to another phone
            or a laptop, and clearing site data clears it.
          </DialogDescription>
        </DialogHeader>

        <dl className="mt-1 grid grid-cols-2 gap-3">
          {rows.map((row) => (
            <div key={row.label} className="rounded-lg border bg-muted/50 px-3 py-2.5">
              <dt className="font-label text-[0.7rem] font-bold tracking-[0.08em] text-muted-foreground uppercase">
                {row.label}
              </dt>
              <dd className="mt-0.5 font-display text-xl font-bold tabular-nums">{row.value}</dd>
            </div>
          ))}
        </dl>

        {wiped && (
          <p role="status" className="rounded-lg border bg-success-soft px-3 py-2 text-sm text-foreground">
            Cleared. Nothing is stored in this browser now — your next finished set starts the history
            again.
          </p>
        )}

        <DialogFooter className="mt-1 flex-col gap-2 sm:flex-row sm:justify-start">
          <Button type="button" variant="outline" className="h-11" onClick={exportHistory}>
            <Download className="size-4" aria-hidden="true" />
            Download my history
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="h-11 text-destructive hover:text-destructive"
            onClick={clearHistory}
          >
            <Trash2 className="size-4" aria-hidden="true" />
            Clear this device
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
