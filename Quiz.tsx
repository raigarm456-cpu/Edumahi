import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router'
import { Timer, X } from 'lucide-react'
import { Meta } from '@/components/Meta'
import { useLang } from '@/components/lang'
import { QuestionCard, QuizProgress } from '@/components/QuestionCard'
import { QuizResult } from '@/components/QuizResult'
import { buildQuiz, type QuizConfig } from '@/lib/questions'
import { useQuestionBank } from '@/lib/dbQuestions'
import type { Question } from '@/data/questions'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

/* One question per screen. The configuration arrives in the URL, so Retry and a
   shared link both rebuild the same set. */
export default function Quiz() {
  const [params] = useSearchParams()
  const exam = params.get('exam')
  const config: QuizConfig = {
    exam: exam === 'NEET' || exam === 'JEE Mains' ? exam : undefined,
    subject: params.get('subject') ?? undefined,
    chapter: params.get('chapter') ?? undefined,
    type: params.get('type') === 'PYQ' ? 'PYQ' : params.get('type') === 'Practice' ? 'Practice' : undefined,
    year: params.get('year') ? Number(params.get('year')) : undefined,
    shift: params.get('shift') ?? undefined,
    difficulty: params.get('difficulty') ?? undefined,
    count: params.get('count') ? Number(params.get('count')) : undefined,
  }

  const { status } = useQuestionBank()
  // The set is built once per configuration, not on every render.
  const [set] = useState<Question[]>(() => buildQuiz(config))
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [submitted, setSubmitted] = useState<Record<number, boolean>>({})
  const [index, setIndex] = useState(0)
  const [finished, setFinished] = useState(false)
  const [withTimer, setWithTimer] = useState(false)
  const [seconds, setSeconds] = useState(0)
  const { lang, setLang } = useLang()

  useEffect(() => {
    if (!withTimer || finished) return
    const id = window.setInterval(() => setSeconds((s) => s + 1), 1000)
    return () => window.clearInterval(id)
  }, [withTimer, finished])

  if (set.length === 0 && status === 'loading') {
    return (
      <main className="mx-auto w-full max-w-content px-gutter py-section">
        <Meta title="Loading your set — EduMahi" description="Building your question set from the EduMahi bank." />
        <p className="text-sm text-muted-foreground">Loading your set…</p>
      </main>
    )
  }

  if (set.length === 0) {
    return (
      <main className="mx-auto w-full max-w-content px-gutter py-section">
        <Meta
          title="No questions match that filter — EduMahi"
          description="Nothing in the EduMahi bank matches this combination yet. Widen the filter or build a custom practice set instead."
        />
        <div className="mx-auto max-w-md rounded-xl border border-dashed bg-card p-8 text-center">
          <h2 className="text-2xl">No questions match that filter</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            The bank has nothing for this subject, chapter and type together. Try a wider filter, or
            build a set in the Practice Zone.
          </p>
          <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Button asChild>
              <a href="/practice">Build a practice set</a>
            </Button>
            <Button asChild variant="outline">
              <a href="/">Back home</a>
            </Button>
          </div>
        </div>
      </main>
    )
  }

  const total = set.length

  if (finished) {
    return (
      <main className="mx-auto w-full max-w-content px-gutter py-8 sm:py-12">
        <Meta
          title="Your result — EduMahi"
          description="Your score, accuracy, time taken and a full review of every answer in the set you just solved."
        />
        <QuizResult
          questions={set}
          answers={answers}
          seconds={seconds}
          lang={lang}
          paramsString={params.toString()}
        />
      </main>
    )
  }

  const answered = Object.keys(answers).length
  const submittedCount = Object.keys(submitted).length
  const current = set[index]

  function nextUnanswered() {
    for (let step = 1; step <= total; step++) {
      const i = (index + step) % total
      if (!submitted[i]) return i
    }
    return index
  }

  return (
    <main className="mx-auto w-full max-w-content px-gutter py-6 sm:py-8">
      <Meta
        title={`${config.exam ?? 'Practice'}${config.subject ? ` ${config.subject}` : ''} quiz — EduMahi`}
        description="One question at a time, four options, a worked solution the moment you submit. Switch any question between Hindi and English."
      />

      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-lg font-bold sm:text-xl">
            {config.exam ?? 'Practice'}
            {config.subject ? ` · ${config.subject}` : ''}
            {config.type ? ` · ${config.type}` : ''}
          </h1>
          <p className="text-xs text-muted-foreground">
            {total} question{total > 1 ? 's' : ''}
            {config.difficulty ? ` · ${config.difficulty}` : ''}
            {config.chapter ? ` · ${config.chapter}` : ''}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setWithTimer((v) => !v)}
            aria-pressed={withTimer}
            className={cn(
              'inline-flex h-11 items-center gap-1.5 rounded-md border px-2.5 font-label text-xs font-semibold transition-colors',
              withTimer
                ? 'border-primary bg-accent text-accent-foreground'
                : 'border-border bg-background text-muted-foreground hover:text-foreground',
            )}
          >
            <Timer className="size-3.5" aria-hidden="true" />
            {withTimer ? `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}` : 'Timer off'}
          </button>
          <div className="inline-flex rounded-full border bg-background p-0.5" role="group" aria-label="Question language">
            <button
              type="button"
              onClick={() => setLang('en')}
              aria-pressed={lang === 'en'}
              className={cn(
                'inline-flex h-10 min-w-11 items-center justify-center rounded-full px-2.5 font-label text-xs font-semibold',
                lang === 'en' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground',
              )}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => setLang('hi')}
              aria-pressed={lang === 'hi'}
              className={cn(
                'inline-flex h-10 min-w-11 items-center justify-center rounded-full px-2.5 font-label text-xs font-semibold',
                lang === 'hi' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground',
              )}
            >
              हिं
            </button>
          </div>
        </div>
      </div>

      <div className="mb-5">
        <QuizProgress done={submittedCount} total={total} />
      </div>

      {/* The palette: submitted, answered-but-not-submitted and current all
          read distinctly, and each carries a label so colour is not the only cue. */}
      <div className="mb-5">
        <p className="mb-2 font-label text-xs font-bold tracking-[0.1em] text-muted-foreground uppercase">
          Question palette
        </p>
        <ul className="flex flex-wrap gap-1.5">
          {set.map((q, i) => {
            const isDone = Boolean(submitted[q.id])
            const isAnswered = answers[q.id] !== undefined
            return (
              <li key={q.id}>
                <button
                  type="button"
                  onClick={() => setIndex(i)}
                  aria-current={i === index ? 'true' : undefined}
                  aria-label={`Question ${i + 1}${isDone ? ', submitted' : isAnswered ? ', answered' : ', not visited'}`}
                  className={cn(
                    'grid size-11 place-items-center rounded-md border font-label text-sm font-bold tabular-nums transition-colors',
                    i === index && 'ring-2 ring-ring ring-offset-2 ring-offset-background',
                    isDone && 'border-primary/40 bg-primary text-primary-foreground',
                    !isDone && isAnswered && 'border-primary bg-accent text-accent-foreground',
                    !isDone && !isAnswered && 'border-border bg-background text-muted-foreground hover:border-primary/50',
                  )}
                >
                  {i + 1}
                </button>
              </li>
            )
          })}
        </ul>
      </div>

      <QuestionCard
        key={current.id}
        question={current}
        index={index}
        total={total}
        lang={lang}
        selected={answers[current.id] ?? null}
        submitted={Boolean(submitted[current.id])}
        onSelect={(i) => setAnswers((a) => ({ ...a, [current.id]: i }))}
        onSubmit={() => setSubmitted((s) => ({ ...s, [current.id]: true }))}
      />

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Button
          variant="outline"
          className="h-11"
          onClick={() => setIndex((i) => Math.max(0, i - 1))}
          disabled={index === 0}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          className="h-11"
          onClick={() => setIndex(nextUnanswered())}
          disabled={submittedCount === total}
        >
          Next
        </Button>
        <div className="ml-auto flex items-center gap-2">
          <p className="hidden text-xs text-muted-foreground sm:block">
            {submittedCount} of {total} submitted{answered < submittedCount ? '' : ''}
          </p>
          <Button className="h-11 px-5" onClick={() => setFinished(true)}>
            Finish quiz
            <X className="size-4" aria-hidden="true" />
          </Button>
        </div>
      </div>

      <p className="sr-only" aria-live="polite">
        Question {index + 1} of {total}.
      </p>
    </main>
  )
}
