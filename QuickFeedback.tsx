import { useState, type ReactNode } from 'react'
import { CheckCircle2, Send } from 'lucide-react'
import { addFeedback, CATEGORIES } from '@/lib/feedback'
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
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

/* The quick feedback popup. It is honest about where the note goes: this
   browser, not a server, until a backend exists. */
export function QuickFeedback({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const [category, setCategory] = useState<string>('Suggestion')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (message.trim().length < 10) {
      setError('Write at least a sentence, so we know what to fix.')
      return
    }
    setError('')
    addFeedback({
      type: 'website',
      questionId: null,
      rating: 0,
      category,
      message: message.trim(),
      name: '',
      email: '',
      helpful: null,
    })
    setSent(true)
    setMessage('')
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v)
        if (!v) setSent(false)
      }}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        {sent ? (
          <div className="py-4 text-center">
            <CheckCircle2 className="mx-auto size-10 text-success" aria-hidden="true" />
            <DialogTitle className="mt-3 font-display text-xl">Thank you for helping us improve EduMahi!</DialogTitle>
            <p className="mt-2 text-sm text-muted-foreground">
              Your note is saved in this browser. The full feedback page has the star rating and the
              public reviews.
            </p>
            <DialogFooter className="mt-5">
              <Button onClick={() => setOpen(false)}>Close</Button>
            </DialogFooter>
          </div>
        ) : (
          <form onSubmit={submit} noValidate>
            <DialogHeader>
              <DialogTitle className="font-display text-xl">Something to report?</DialogTitle>
              <DialogDescription>
                A wrong answer key, a typo, or an idea — it all reaches the person who edits the bank.
              </DialogDescription>
            </DialogHeader>
            <div className="mt-4 grid gap-4">
              <div className="grid gap-1.5">
                <Label htmlFor="quick-category">Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger id="quick-category" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="quick-message">Message</Label>
                <Textarea
                  id="quick-message"
                  value={message}
                  onChange={(e) => {
                    setMessage(e.target.value)
                    if (error) setError('')
                  }}
                  aria-invalid={Boolean(error)}
                  aria-describedby={error ? 'quick-message-error' : 'quick-message-hint'}
                  placeholder="Question 12 in NEET Physics shows 13 m/s, but my answer came to 10 m/s."
                  className="min-h-24"
                />
                {error ? (
                  <p id="quick-message-error" className="text-sm font-medium text-destructive">
                    {error}
                  </p>
                ) : (
                  <p id="quick-message-hint" className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    Saved in this browser. There is no server yet, so nothing leaves your device.
                  </p>
                )}
              </div>
            </div>
            <DialogFooter className="mt-5">
              <Button type="submit">
                <Send className="size-4" aria-hidden="true" />
                Send feedback
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
