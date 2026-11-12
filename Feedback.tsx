import { useMemo, useState } from 'react'
import { Link } from 'react-router'
import { MessageSquare, Star } from 'lucide-react'
import { Meta } from '@/components/Meta'
import { Bar, Section } from '@/components/Primitives'
import { Stars } from '@/components/Stars'
import { Button } from '@/components/ui/button'
import {
  CATEGORIES,
  addFeedback,
  averageRating,
  canReviewToday,
  lastReviewToday,
  ratingBreakdown,
  rememberReview,
  websiteReviews,
} from '@/lib/feedback'
import { cn } from '@/lib/utils'

type Sort = 'helpful' | 'latest'
const PER_PAGE = 5

export default function FeedbackPage() {
  const [reviews, setReviews] = useState(() => websiteReviews())
  const [sort, setSort] = useState<Sort>('helpful')
  const [page, setPage] = useState(1)
  const [rating, setRating] = useState(0)
  const [name, setName] = useState('')
  const [exam, setExam] = useState('NEET')
  const [category, setCategory] = useState<string>(CATEGORIES[0])
  const [message, setMessage] = useState('')
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)
  const [alreadyToday] = useState(() => lastReviewToday())

  const summary = useMemo(
    () => ({ average: averageRating(reviews), breakdown: ratingBreakdown(reviews), count: reviews.length }),
    [reviews],
  )

  const sorted = useMemo(() => {
    const list = [...reviews]
    return sort === 'latest'
      ? list.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      : list.sort((a, b) => b.rating - a.rating || b.createdAt.localeCompare(a.createdAt))
  }, [reviews, sort])
  const pages = Math.max(1, Math.ceil(sorted.length / PER_PAGE))
  const shown = sorted.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (rating === 0) return setError('Pick a star rating first.')
    if (message.trim().length < 10) return setError('Write at least a sentence, so it helps the next student.')
    if (!canReviewToday()) return setError('You have already reviewed EduMahi today. Come back tomorrow.')
    const record = addFeedback({
      type: 'website',
      questionId: null,
      rating,
      category: `${category} · ${exam}`,
      message: message.trim(),
      name: name.trim(),
      email: email.trim(),
      helpful: null,
    })
    rememberReview(record)
    setReviews(websiteReviews())
    setSent(true)
    setError('')
  }

  return (
    <main className="mx-auto w-full max-w-content px-gutter py-10 sm:py-12">
      <Meta
        title="Rate EduMahi and report a wrong answer key — EduMahi"
        description="Tell us what worked, report a wrong answer key or a bad translation, and read what other NEET and JEE Mains students said. Every report reaches the admin dashboard."
      />

      <header className="max-w-2xl">
        <h1 className="text-[clamp(2rem,5vw,3rem)] font-extrabold text-balance">
          What is wrong, what is good, what is missing.
        </h1>
        <p className="mt-3 text-muted-foreground">
          A wrong answer key or a badly translated option is the thing we care about most. Say which
          question and it goes to the top of the admin list.
        </p>
      </header>

      <div className="mt-8 grid gap-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:items-start">
        <section className="rounded-xl border bg-card p-5 shadow-raised sm:p-6" aria-labelledby="form-heading">
          <h2 id="form-heading" className="text-2xl">
            Leave a review
          </h2>

          {sent || alreadyToday ? (
            <div className="mt-4 rounded-lg border border-success/40 bg-background p-5" role="status">
              <p className="font-display font-bold text-success">
                Thank you for helping us improve EduMahi!
              </p>
              <p className="mt-1.5 text-sm text-muted-foreground">
                {sent
                  ? 'Your review is on this page now and in the admin dashboard.'
                  : `You already reviewed today${alreadyToday?.name ? `, ${alreadyToday.name}` : ''}. One review per browser per day keeps the list honest.`}
              </p>
              <Button asChild variant="outline" className="mt-4 h-11">
                <Link to="/practice">Back to practice</Link>
              </Button>
            </div>
          ) : (
            <form className="mt-4 grid gap-4" onSubmit={submit} noValidate>
              <Stars value={rating} onChange={setRating} label="Your rating" size="lg" />

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-1.5">
                  <label htmlFor="fb-name" className="font-label text-xs font-semibold">
                    Name <span className="font-normal text-muted-foreground">(optional)</span>
                  </label>
                  <input
                    id="fb-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                    placeholder="Ananya"
                  />
                </div>
                <div className="grid gap-1.5">
                  <label htmlFor="fb-exam" className="font-label text-xs font-semibold">
                    Which exam?
                  </label>
                  <select
                    id="fb-exam"
                    value={exam}
                    onChange={(e) => setExam(e.target.value)}
                    className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                  >
                    <option>NEET</option>
                    <option>JEE Mains</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>

              <fieldset>
                <legend className="font-label text-xs font-semibold">Category</legend>
                <div className="mt-1.5 flex flex-wrap gap-2">
                  {CATEGORIES.map((c) => (
                    <label
                      key={c}
                      className={cn(
                        'inline-flex h-11 cursor-pointer items-center rounded-md border px-3 text-sm has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ring',
                        category === c ? 'border-primary bg-accent font-semibold' : 'border-border bg-background',
                      )}
                    >
                      <input
                        type="radio"
                        name="category"
                        value={c}
                        checked={category === c}
                        onChange={() => setCategory(c)}
                        className="sr-only"
                      />
                      {c}
                    </label>
                  ))}
                </div>
              </fieldset>

              <div className="grid gap-1.5">
                <label htmlFor="fb-message" className="font-label text-xs font-semibold">
                  Message
                </label>
                <textarea
                  id="fb-message"
                  value={message}
                  onChange={(e) => {
                    setMessage(e.target.value)
                    if (error) setError('')
                  }}
                  aria-describedby={error ? 'fb-error' : 'fb-hint'}
                  aria-invalid={Boolean(error)}
                  className="min-h-28 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                  placeholder="NEET Physics 2023, question on the spring force — the answer key says 4 N but the solution works out 8 N."
                />
                <p id="fb-hint" className="text-xs text-muted-foreground">
                  Ten characters minimum. No email needed to leave it.
                </p>
              </div>

              <div className="grid gap-1.5">
                <label htmlFor="fb-email" className="font-label text-xs font-semibold">
                  Email <span className="font-normal text-muted-foreground">(optional)</span>
                </label>
                <input
                  id="fb-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                  placeholder="you@example.com"
                />
              </div>

              {error && (
                <p id="fb-error" role="alert" className="text-sm font-medium text-destructive">
                  {error}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-3">
                <Button type="submit" className="h-12 px-5">
                  Send review
                </Button>
                <p className="text-xs text-muted-foreground">
                  Stored in this browser for now — there is no server yet.
                </p>
              </div>
            </form>
          )}
        </section>

        <section className="rounded-xl border bg-background p-5 sm:p-6" aria-labelledby="summary-heading">
          <h2 id="summary-heading" className="font-display text-lg font-bold">
            Where the ratings stand
          </h2>
          {summary.count === 0 ? (
            <div className="mt-4 rounded-lg border border-dashed p-5">
              <Star className="size-5 text-muted-foreground" strokeWidth={1.75} aria-hidden="true" />
              <p className="mt-2 text-sm text-muted-foreground">
                No reviews yet. The average and the breakdown fill in with the first one.
              </p>
            </div>
          ) : (
            <>
              <div className="mt-4 flex items-end gap-4">
                <p className="font-display text-5xl font-extrabold tabular-nums">{summary.average.toFixed(1)}</p>
                <div className="pb-1">
                  <Stars value={Math.round(summary.average)} size="sm" />
                  <p className="mt-1 text-xs text-muted-foreground">
                    {summary.count} review{summary.count === 1 ? '' : 's'}
                  </p>
                </div>
              </div>
              <ul className="mt-5 space-y-2">
                {summary.breakdown.map((row) => (
                  <li key={row.stars} className="flex items-center gap-3">
                    <span className="w-8 font-label text-xs font-bold tabular-nums text-muted-foreground">
                      {row.stars}★
                    </span>
                    <div className="flex-1">
                      <Bar
                        value={row.pct}
                        label={`${row.stars} star: ${row.count} reviews, ${row.pct} percent`}
                        tone={row.stars >= 4 ? 'success' : row.stars === 3 ? 'brand' : 'warning'}
                      />
                    </div>
                    <span className="w-8 text-right font-label text-xs tabular-nums text-muted-foreground">
                      {row.count}
                    </span>
                  </li>
                ))}
              </ul>
            </>
          )}
          <p className="mt-5 border-t pt-3 text-xs text-muted-foreground">
            Reviews live in this browser. When a backend is connected they will be shared, and this
            text will change.
          </p>
        </section>
      </div>

      <Section className="mt-12" ground="raised">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 className="text-2xl">Reviews</h2>
          <div className="flex gap-1" role="group" aria-label="Sort reviews">
            {(['helpful', 'latest'] as const).map((option) => (
              <button
                key={option}
                type="button"
                aria-pressed={sort === option}
                onClick={() => {
                  setSort(option)
                  setPage(1)
                }}
                className={cn(
                  'inline-flex h-11 items-center rounded-md border px-3 font-label text-xs font-semibold',
                  sort === option ? 'border-primary bg-accent text-accent-foreground' : 'border-border bg-background text-muted-foreground',
                )}
              >
                {option === 'helpful' ? 'Most helpful' : 'Latest'}
              </button>
            ))}
          </div>
        </div>

        {shown.length === 0 ? (
          <div className="mt-4 rounded-xl border border-dashed bg-background p-8 text-center">
            <MessageSquare className="mx-auto size-6 text-muted-foreground" strokeWidth={1.75} aria-hidden="true" />
            <p className="mx-auto mt-3 max-w-sm text-sm text-muted-foreground">
              The list is empty. Your review would be the first — the form above takes a minute.
            </p>
          </div>
        ) : (
          <ul className="mt-4 grid gap-3 md:grid-cols-2">
            {shown.map((r) => (
              <li key={r.id} className="rounded-xl border bg-background p-5">
                <div className="flex items-center justify-between gap-3">
                <Stars value={r.rating} size="sm" />
                  <span className="font-label text-xs text-muted-foreground">
                    {new Date(r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>
                <blockquote className="mt-3 text-sm">{r.message}</blockquote>
                <p className="mt-3 font-label text-xs text-muted-foreground">
                  {r.name || 'Anonymous aspirant'} · {r.category}
                </p>
              </li>
            ))}
          </ul>
        )}

        {pages > 1 && (
          <nav className="mt-5 flex items-center justify-center gap-2" aria-label="Review pages">
            <Button
              variant="outline"
              className="h-11"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Previous
            </Button>
            <span className="font-label text-xs font-semibold text-muted-foreground">
              Page {page} of {pages}
            </span>
            <Button
              variant="outline"
              className="h-11"
              onClick={() => setPage((p) => Math.min(pages, p + 1))}
              disabled={page === pages}
            >
              Next
            </Button>
          </nav>
        )}
      </Section>
    </main>
  )
}
