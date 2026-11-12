import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Stars } from '@/components/Stars'
import { addFeedback } from '@/lib/feedback'
import { recordAttempt } from '@/lib/progress'
import type { Question } from '@/data/questions'
import type { Lang } from '@/components/lang'
import { cn } from '@/lib/utils'

type ReviewMode = 'all' | 'wrong' | 'saved'

/* The result screen: score, a breakdown, a review of every question and the
   quiz rating. Split from Quiz.tsx so opening a quiz does not carry this. */
export function QuizResult({
  questions,
  answers,
  seconds,
  lang,
  paramsString,
}: {
  questions: Question[]
  answers: Record<number, number>
  seconds: number
  lang: Lang
  paramsString: string
}) {
  const [review, setReview] = useState<ReviewMode | null>(null)
  const [rating, setRating] = useState(0)
  const [feel, setFeel] = useState('')
  const [comment, setComment] = useState('')
  const [sent, setSent] = useState(false)

  const correct = questions.filter((q) => answers[q.id] === q.correctAnswer).length
  const attempted = questions.filter((q) => answers[q.id] !== undefined).length
  const wrong = attempted - correct
  const unattempted = questions.length - attempted
  const accuracy = attempted ? Math.round((correct / attempted) * 100) : 0
  const subject = questions[0]?.subject ?? ''
  const exam = questions[0]?.exam ?? ''

  const shown =
    review === 'wrong'
      ? questions.filter((q) => answers[q.id] !== undefined && answers[q.id] !== q.correctAnswer)
      : questions

  return (
    <div>
      <div className="rounded-xl border bg-card p-6 shadow-raised sm:p-8">
        <p className="font-label text-xs font-bold tracking-[0.12em] text-muted-foreground uppercase">
          Result
        </p>
        <h1 className="mt-2 text-[clamp(1.8rem,4vw,2.6rem)]">
          {correct} correct out of {questions.length}
        </h1>
        <p className="mt-1 text-muted-foreground">
          {accuracy}% accuracy
          {seconds ? ` in ${Math.floor(seconds / 60)}m ${String(seconds % 60).padStart(2, '0')}s` : ''}.
        </p>

        <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
          {[
            { k: 'Score', v: `${correct}/${questions.length}` },
            { k: 'Correct', v: String(correct) },
            { k: 'Wrong', v: String(wrong) },
            { k: 'Unattempted', v: String(unattempted) },
            { k: 'Accuracy', v: `${accuracy}%` },
          ].map((row) => (
            <div key={row.k} className="rounded-lg border bg-background px-3 py-2.5">
              <dt className="font-label text-[0.65rem] font-bold tracking-[0.1em] text-muted-foreground uppercase">
                {row.k}
              </dt>
              <dd className="font-display text-xl font-bold tabular-nums">{row.v}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-6 flex flex-wrap gap-2">
          <Button className="h-11" onClick={() => setReview('all')}>
            Review answers
          </Button>
          <Button variant="outline" className="h-11" onClick={() => setReview('wrong')}>
            Wrong only
          </Button>
          <Button
            variant="outline"
            className="h-11"
            onClick={() => {
              recordAttempt({ exam, subject, total: questions.length, correct, wrong, unattempted, seconds })
              window.location.href = `/quiz?${paramsString}`
            }}
          >
            Retry
          </Button>
          <Button variant="ghost" className="h-11" asChild>
            <a href="/practice">Build another set</a>
          </Button>
        </div>
      </div>

      {review !== null && (
        <section className="mt-8" aria-labelledby="review-heading">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h2 id="review-heading" className="text-xl">
              {review === 'wrong' ? `Mistakes in this set (${shown.length})` : 'Every question'}
            </h2>
            <div className="flex gap-1">
              {(['all', 'wrong'] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setReview(mode)}
                  aria-pressed={review === mode}
                  className={cn(
                    'inline-flex h-9 items-center rounded-md border px-2.5 font-label text-xs font-semibold',
                    review === mode
                      ? 'border-primary bg-accent text-accent-foreground'
                      : 'border-border bg-background text-muted-foreground',
                  )}
                >
                  {mode === 'all' ? 'All questions' : 'Wrong only'}
                </button>
              ))}
            </div>
          </div>
          {shown.length === 0 ? (
            <p className="rounded-lg border border-dashed bg-card p-6 text-sm text-muted-foreground">
              Nothing wrong in this set. Try a harder difficulty in the Practice Zone.
            </p>
          ) : (
            <ol className="space-y-3">
              {shown.map((q) => {
                const picked = answers[q.id]
                const isWrong = picked !== undefined && picked !== q.correctAnswer
                return (
                  <li
                    key={q.id}
                    className={cn(
                      'rounded-lg border bg-card p-4',
                      isWrong && 'border-destructive/50',
                      picked === q.correctAnswer && 'border-success/50',
                    )}
                  >
                    <p className="font-label text-xs font-semibold text-muted-foreground">
                      {q.exam} {q.subject} · {q.chapter}
                      {q.year ? ` · ${q.year}` : ''}
                    </p>
                    <p
                      className="mt-1 text-sm font-medium whitespace-pre-line"
                      lang={lang === 'hi' ? 'hi' : 'en'}
                    >
                      {q.question[lang]}
                    </p>
                    <p className="mt-1.5 text-sm">
                      <span className="text-muted-foreground">Your answer: </span>
                      {picked === undefined
                        ? 'not attempted'
                        : `${String.fromCharCode(65 + picked)}. ${q.options[lang][picked]}`}
                    </p>
                    {picked !== q.correctAnswer && (
                      <p className="text-sm">
                        <span className="text-muted-foreground">Correct answer: </span>
                        {`${String.fromCharCode(65 + q.correctAnswer)}. ${q.options[lang][q.correctAnswer]}`}
                      </p>
                    )}
                    <p className="mt-1.5 border-t pt-1.5 text-sm text-muted-foreground" lang={lang === 'hi' ? 'hi' : 'en'}>
                      {q.solution[lang]}
                    </p>
                  </li>
                )
              })}
            </ol>
          )}
        </section>
      )}

      <section className="mt-8 rounded-xl border bg-card p-6" aria-labelledby="rate-heading">
        <h2 id="rate-heading" className="text-xl">
          How was this quiz?
        </h2>
        {sent ? (
          <p className="mt-3 text-sm font-medium text-success" role="status">
            Thank you for helping us improve EduMahi!
          </p>
        ) : (
          <form
            className="mt-3 grid gap-4"
            onSubmit={(e) => {
              e.preventDefault()
              addFeedback({
                type: 'quiz',
                questionId: null,
                rating,
                category: feel ? `Felt ${feel}` : 'Quiz rating',
                message: comment.trim(),
                name: '',
                email: '',
                helpful: null,
              })
              setSent(true)
            }}
          >
            <Stars value={rating} onChange={setRating} label="Quiz rating" />
            <fieldset>
              <legend className="font-label text-xs font-semibold text-muted-foreground">
                How did the difficulty feel?
              </legend>
              <div className="mt-1.5 flex flex-wrap gap-2">
                {['Too Easy', 'Just Right', 'Too Hard'].map((option) => (
                  <label
                    key={option}
                    className={cn(
                      'inline-flex h-11 cursor-pointer items-center rounded-md border px-3 text-sm has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ring',
                      feel === option ? 'border-primary bg-accent font-semibold' : 'border-border bg-background',
                    )}
                  >
                    <input
                      type="radio"
                      name="feel"
                      value={option}
                      checked={feel === option}
                      onChange={() => setFeel(option)}
                      className="sr-only"
                    />
                    {option}
                  </label>
                ))}
              </div>
            </fieldset>
            <div className="grid gap-1.5">
              <label htmlFor="quiz-comment" className="font-label text-xs font-semibold text-muted-foreground">
                Anything else? (optional)
              </label>
              <textarea
                id="quiz-comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="min-h-16 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="The Chemistry questions were harder than the paper."
              />
            </div>
            <div>
              <Button type="submit" className="h-11">
                Send rating
              </Button>
            </div>
          </form>
        )}
      </section>
    </div>
  )
}
