import { useState } from 'react'
import { Bookmark, Check, CheckCircle2, Flag, ThumbsDown, ThumbsUp, X, XCircle } from 'lucide-react'
import type { Question } from '@/data/questions'
import type { Lang } from '@/components/lang'
import { Stars } from '@/components/Stars'
import { Bar } from '@/components/Primitives'
import { addFeedback, REPORT_REASONS, signalFor, type QuestionSignals } from '@/lib/feedback'
import { bookmarks, toggleBookmark } from '@/lib/progress'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const LETTERS = ['A', 'B', 'C', 'D']

/**
 * One question, one card. Both the home screen's sample and every question in
 * the quiz use this, so the reveal behaves identically in both: a wrong pick
 * turns red, the right one always turns green, options then lock.
 */
export function QuestionCard({
  question,
  index,
  total,
  lang,
  selected,
  submitted,
  signals,
  secondLang,
  onSelect,
  onSubmit,
}: {
  question: Question
  index: number
  total: number
  lang: Lang
  selected: number | null
  submitted: boolean
  signals?: QuestionSignals
  secondLang?: boolean
  onSelect: (i: number) => void
  onSubmit: () => void
}) {
  const [rated, setRated] = useState(false)
  const [helpful, setHelpful] = useState<boolean | null>(null)
  const [rating, setRating] = useState(0)
  const [reportOpen, setReportOpen] = useState(false)
  const [reason, setReason] = useState<string>(REPORT_REASONS[0])
  const [note, setNote] = useState('')
  const [reportSent, setReportSent] = useState(false)
  const [saved, setSaved] = useState(() => bookmarks().includes(question.id))

  const signal = signalFor(signals ?? {}, question.id)
  const avgQ = signal.ratingCount ? (signal.ratingSum / signal.ratingCount).toFixed(1) : null
  const options = question.options[lang]
  const right = question.correctAnswer

  function recordHelpful(value: boolean) {
    setHelpful(value)
    addFeedback({
      type: 'question',
      questionId: question.id,
      rating: 0,
      category: 'Solution helpfulness',
      message: '',
      name: '',
      email: '',
      helpful: value,
    })
  }

  function recordRating(value: number) {
    setRating(value)
    setRated(true)
    addFeedback({
      type: 'question',
      questionId: question.id,
      rating: value,
      category: 'Question quality',
      message: '',
      name: '',
      email: '',
      helpful: null,
    })
  }

  function sendReport() {
    addFeedback({
      type: 'question',
      questionId: question.id,
      rating: 0,
      category: reason,
      message: `${note.trim()} [lang: ${lang}]`,
      name: '',
      email: '',
      helpful: null,
    })
    setReportSent(true)
    setReportOpen(false)
  }

  return (
    <article className="overflow-hidden rounded-xl border bg-card shadow-raised">
      {/* Meta strip */}
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5 border-b bg-muted/50 px-4 py-3 sm:px-6">
        <span className="rounded-full bg-primary px-2.5 py-0.5 font-label text-xs font-bold tracking-wide text-primary-foreground">
          Q{index + 1}
          <span className="font-medium opacity-70"> / {total}</span>
        </span>
        <span className="font-label text-[0.8125rem] font-semibold text-muted-foreground">
          {question.exam} · {question.subject}
        </span>
        <span className="hidden h-3 w-px bg-border sm:block" aria-hidden="true" />
        <span className="hidden text-[0.8125rem] text-muted-foreground sm:inline">{question.chapter}</span>
        {question.year && (
          <span className="rounded-full bg-secondary px-2 py-0.5 font-label text-[0.8125rem] font-semibold text-secondary-foreground">
            {question.type} {question.year}
          </span>
        )}
        <button
          type="button"
          onClick={() => setSaved(toggleBookmark(question.id).includes(question.id))}
          aria-pressed={saved}
          className={cn(
            'ml-auto inline-flex h-8 items-center gap-1.5 rounded-md px-2 font-label text-xs font-semibold transition-colors',
            saved ? 'text-accent-foreground' : 'text-muted-foreground hover:bg-background hover:text-foreground',
          )}
        >
          <Bookmark className={cn('size-4', saved && 'fill-current')} aria-hidden="true" />
          {saved ? 'Saved' : 'Save'}
        </button>
      </div>

      <div className="px-4 py-5 sm:px-6 sm:py-6">
        <p
          className="text-[1.05rem] leading-relaxed font-medium whitespace-pre-line text-foreground"
          lang={lang === 'hi' ? 'hi' : 'en'}
        >
          {question.question[lang]}
        </p>

        {question.image && (
          <img
            src={question.image}
            alt="Figure for this question"
            width={640}
            height={360}
            loading="lazy"
            className="mt-4 max-h-72 w-auto rounded-lg border bg-background object-contain"
          />
        )}

        {secondLang && (
          <p
            className="mt-2 border-l-2 border-primary/30 pl-3 text-sm whitespace-pre-line text-muted-foreground"
            lang={lang === 'hi' ? 'en' : 'hi'}
          >
            {question.question[lang === 'hi' ? 'en' : 'hi']}
          </p>
        )}

        <ul className="mt-5 grid gap-2.5 sm:grid-cols-2" lang={lang === 'hi' ? 'hi' : 'en'}>
          {options.map((text, i) => {
            const isRight = i === right
            const isPicked = selected === i
            const wrongPick = submitted && isPicked && !isRight
            return (
              <li key={i}>
                <button
                  type="button"
                  disabled={submitted}
                  onClick={() => onSelect(i)}
                  aria-pressed={isPicked}
                  className={cn(
                    'group flex min-h-14 w-full items-start gap-3 rounded-lg border px-3 py-3 text-left transition-all',
                    !submitted && 'hover:border-primary/60 hover:bg-accent/60 active:scale-[0.995]',
                    !submitted && isPicked && 'border-primary bg-accent ring-1 ring-primary',
                    !submitted && !isPicked && 'border-border bg-background',
                    submitted && isRight && 'border-success bg-success-soft',
                    submitted && wrongPick && 'border-destructive bg-destructive-soft',
                    submitted && !isRight && !isPicked && 'border-border bg-background opacity-60',
                    submitted && 'cursor-default',
                  )}
                >
                  <span
                    className={cn(
                      'grid size-7 shrink-0 place-items-center rounded-md font-label text-xs font-bold',
                      !submitted && isPicked && 'bg-primary text-primary-foreground',
                      !submitted && !isPicked && 'bg-muted text-muted-foreground group-hover:bg-background',
                      submitted && isRight && 'bg-success text-white',
                      submitted && wrongPick && 'bg-destructive text-white',
                      submitted && !isRight && !isPicked && 'bg-muted text-muted-foreground',
                    )}
                    aria-hidden="true"
                  >
                    {LETTERS[i]}
                  </span>
                  <span className="pt-0.5 text-sm font-medium text-foreground">{text}</span>
                  {submitted && isRight && (
                    <CheckCircle2 className="ml-auto size-5 shrink-0 self-center text-success" aria-hidden="true" />
                  )}
                  {submitted && wrongPick && (
                    <XCircle className="ml-auto size-5 shrink-0 self-center text-destructive" aria-hidden="true" />
                  )}
                </button>
              </li>
            )
          })}
        </ul>

        {/* Live region: the reveal is announced, not only coloured. */}
        <p aria-live="polite" className="sr-only">
          {submitted
            ? selected === null
              ? `Not attempted. The correct answer is ${LETTERS[right]}.`
              : selected === right
                ? 'Correct.'
                : `Incorrect. The correct answer is ${LETTERS[right]}.`
            : ''}
        </p>

        {!submitted ? (
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <Button size="lg" className="h-11 px-6" onClick={onSubmit} disabled={selected === null}>
              <Check className="size-4" aria-hidden="true" />
              Submit answer
            </Button>
            <p className="text-xs text-muted-foreground">
              {selected === null ? 'Pick an option to submit.' : 'Submit to see the solution.'}
            </p>
          </div>
        ) : (
          <div className="mt-5 space-y-4">
            <div
              className={cn(
                'rounded-lg border p-4',
                selected === right
                  ? 'border-success/40 bg-success-soft'
                  : 'border-destructive/40 bg-destructive-soft',
              )}
            >
              <p className="flex items-center gap-2 font-label text-sm font-bold">
                {selected === right ? (
                  <>
                    <CheckCircle2 className="size-4 text-success" aria-hidden="true" />
                    Correct — option {LETTERS[right]}
                  </>
                ) : selected === null ? (
                  <>
                    <X className="size-4 text-destructive" aria-hidden="true" />
                    Not attempted — the answer is {LETTERS[right]}
                  </>
                ) : (
                  <>
                    <XCircle className="size-4 text-destructive" aria-hidden="true" />
                    Incorrect — the answer is {LETTERS[right]}
                  </>
                )}
              </p>
              <p className="mt-2 font-label text-xs font-bold tracking-[0.1em] text-muted-foreground uppercase">
                Solution
              </p>
              <p
                className="mt-1 text-sm leading-relaxed whitespace-pre-line text-foreground"
                lang={lang === 'hi' ? 'hi' : 'en'}
              >
                {question.solution[lang]}
              </p>
              {secondLang && (
                <p
                  className="mt-2 border-t border-current/10 pt-2 text-xs leading-relaxed whitespace-pre-line text-muted-foreground"
                  lang={lang === 'hi' ? 'en' : 'hi'}
                >
                  {question.solution[lang === 'hi' ? 'en' : 'hi']}
                </p>
              )}
            </div>

            {/* Per-question feedback */}
            <div className="rounded-lg border bg-muted/40 p-3 sm:p-4">
              <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
                <div className="flex items-center gap-2">
                  <span className="font-label text-xs font-semibold text-muted-foreground">
                    Was this solution helpful?
                  </span>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => recordHelpful(true)}
                      aria-pressed={helpful === true}
                      className={cn(
                        'grid size-9 place-items-center rounded-md border transition-colors',
                        helpful === true
                          ? 'border-success bg-success-soft text-success'
                          : 'border-border bg-background text-muted-foreground hover:text-foreground',
                      )}
                    >
                      <ThumbsUp className="size-4" aria-hidden="true" />
                      <span className="sr-only">Yes, helpful</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => recordHelpful(false)}
                      aria-pressed={helpful === false}
                      className={cn(
                        'grid size-9 place-items-center rounded-md border transition-colors',
                        helpful === false
                          ? 'border-destructive bg-destructive-soft text-destructive'
                          : 'border-border bg-background text-muted-foreground hover:text-foreground',
                      )}
                    >
                      <ThumbsDown className="size-4" aria-hidden="true" />
                      <span className="sr-only">No, not helpful</span>
                    </button>
                  </div>
                  {helpful !== null && (
                    <span className="text-xs text-muted-foreground" aria-live="polite">
                      Recorded, thank you.
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {rated ? (
                    <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Stars value={rating} size="sm" /> Question rated.
                    </span>
                  ) : (
                    <>
                      <span className="font-label text-xs font-semibold text-muted-foreground">Rate it</span>
                      <Stars value={rating} onChange={recordRating} size="sm" label="Question quality" />
                    </>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setReportOpen((v) => !v)}
                  aria-expanded={reportOpen}
                  className="ml-auto inline-flex h-9 items-center gap-1.5 rounded-md border border-border bg-background px-2.5 font-label text-xs font-semibold text-foreground hover:bg-muted"
                >
                  <Flag className="size-3.5 text-destructive" aria-hidden="true" />
                  {reportSent ? 'Issue reported' : 'Report an issue'}
                </button>
              </div>

              {(signal.helpfulYes > 0 || avgQ) && (
                <p className="mt-3 border-t pt-2 text-xs text-muted-foreground">
                  {signal.helpfulYes > 0 && `${signal.helpfulYes} learner${signal.helpfulYes > 1 ? 's' : ''} found this solution helpful`}
                  {signal.helpfulYes > 0 && avgQ && ' · '}
                  {avgQ && `rated ${avgQ} / 5`}
                </p>
              )}

              {reportOpen && (
                <div className="mt-3 grid gap-2 border-t pt-3">
                  <label htmlFor={`reason-${question.id}`} className="font-label text-xs font-semibold">
                    What is wrong?
                  </label>
                  <select
                    id={`reason-${question.id}`}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="h-10 w-full rounded-md border border-input bg-background px-2.5 text-sm"
                  >
                    {REPORT_REASONS.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                  <label htmlFor={`note-${question.id}`} className="font-label text-xs font-semibold">
                    Short note (optional)
                  </label>
                  <textarea
                    id={`note-${question.id}`}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="min-h-16 w-full rounded-md border border-input bg-background px-2.5 py-2 text-sm"
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={sendReport} className="h-9">
                      Send report
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setReportOpen(false)} className="h-9">
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </article>
  )
}

/* Shared by the hero and the quiz: the reading position through a set. */
export function QuizProgress({ done, total }: { done: number; total: number }) {
  const pct = total ? Math.round((done / total) * 100) : 0
  return (
    <div className="flex items-center gap-3">
      <Bar value={pct} label={`${done} of ${total} questions answered`} className="flex-1" />
      <span className="shrink-0 font-label text-xs font-semibold text-muted-foreground tabular-nums">
        {done}/{total}
      </span>
    </div>
  )
}
