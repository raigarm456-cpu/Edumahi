import { useMemo, useState } from 'react'
import { Link } from 'react-router'
import { ArrowRight, Bookmark, Flame } from 'lucide-react'
import { Meta } from '@/components/Meta'
import { Bar, Section, SectionHead } from '@/components/Primitives'
import { Button } from '@/components/ui/button'
import type { Exam } from '@/data/questions'
import { useQuestionBank } from '@/lib/dbQuestions'

import { attempts, bookmarks, streakDays, subjectAccuracy } from '@/lib/progress'
import { cn } from '@/lib/utils'

const DIFFICULTIES = ['Easy', 'Medium', 'Hard'] as const
const COUNTS = [10, 20, 30] as const

export default function Practice() {
  const { questions: QUESTIONS } = useQuestionBank()
  const [exam, setExam] = useState<Exam | 'Any'>('Any')
  const [subject, setSubject] = useState('Any')
  const [chapter, setChapter] = useState('Any')
  const [difficulty, setDifficulty] = useState<(typeof DIFFICULTIES)[number] | 'Any'>('Any')
  const [count, setCount] = useState<(typeof COUNTS)[number]>(10)

  const subjects = useMemo(() => {
    const list = QUESTIONS.filter((q) => exam === 'Any' || q.exam === exam).map((q) => q.subject)
    return ['Any', ...new Set(list)].slice(0, 8)
  }, [exam, QUESTIONS])

  const chapters = useMemo(() => {
    const list = QUESTIONS.filter(
      (q) => (exam === 'Any' || q.exam === exam) && (subject === 'Any' || q.subject === subject),
    ).map((q) => q.chapter)
    return ['Any', ...new Set(list)].sort()
  }, [exam, subject, QUESTIONS])

  const matched = QUESTIONS.filter(
    (q) =>
      q.type === 'Practice' &&
      (exam === 'Any' || q.exam === exam) &&
      (subject === 'Any' || q.subject === subject) &&
      (chapter === 'Any' || q.chapter === chapter) &&
      (difficulty === 'Any' || q.difficulty === difficulty),
  )

  const href = `/quiz?${new URLSearchParams({
    ...(exam !== 'Any' ? { exam } : {}),
    ...(subject !== 'Any' ? { subject } : {}),
    ...(chapter !== 'Any' ? { chapter } : {}),
    ...(difficulty !== 'Any' ? { difficulty } : {}),
    type: 'Practice',
    count: String(Math.min(count, Math.max(matched.length, 1))),
  }).toString()}`

  const history = attempts()
  const accuracy = subjectAccuracy()
  const saved = bookmarks()
  const savedQuestions = QUESTIONS.filter((q) => saved.includes(q.id))

  return (
    <main className="mx-auto w-full max-w-content px-gutter py-10 sm:py-12">
      <Meta
        title="Practice Zone: build a set by subject, chapter and difficulty — EduMahi"
        description="Choose the exam, subject, chapter and difficulty, then solve 10, 20 or 30 extra practice questions for NEET and JEE Mains with a solution after each one."
      />

      <header className="max-w-2xl">
        <h1 className="text-[clamp(2rem,5vw,3rem)] font-extrabold text-balance">
          Build the set you need today.
        </h1>
        <p className="mt-3 text-muted-foreground">
          These are drill questions, not previous year papers. Narrow it down to a chapter you got
          wrong last week, or take everything on hard.
        </p>
      </header>

      <div className="mt-8 grid gap-5 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] lg:items-start">
        <form
          className="rounded-xl border bg-card p-5 shadow-raised sm:p-6"
          onSubmit={(e) => {
            e.preventDefault()
            window.location.href = href
          }}
          aria-labelledby="builder-heading"
        >
          <h2 id="builder-heading" className="font-display text-lg font-bold">
            Your set
          </h2>

          <fieldset className="mt-5">
            <legend className="font-label text-xs font-bold tracking-[0.1em] text-muted-foreground uppercase">
              Exam
            </legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {(['Any', 'NEET', 'JEE Mains'] as const).map((option) => (
                <button
                  key={option}
                  type="button"
                  aria-pressed={exam === option}
                  onClick={() => {
                    setExam(option)
                    setSubject('Any')
                    setChapter('Any')
                  }}
                  className={cn(
                    'inline-flex h-11 items-center rounded-md border px-3.5 font-label text-sm font-semibold',
                    exam === option
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border bg-background text-muted-foreground hover:text-foreground',
                  )}
                >
                  {option === 'Any' ? 'Both exams' : option}
                </button>
              ))}
            </div>
          </fieldset>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <label htmlFor="subject" className="font-label text-xs font-bold tracking-[0.1em] text-muted-foreground uppercase">
                Subject
              </label>
              <select
                id="subject"
                value={subject}
                onChange={(e) => {
                  setSubject(e.target.value)
                  setChapter('Any')
                }}
                className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                {subjects.map((s) => (
                  <option key={s} value={s}>
                    {s === 'Any' ? 'Any subject' : s}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-1.5">
              <label htmlFor="chapter" className="font-label text-xs font-bold tracking-[0.1em] text-muted-foreground uppercase">
                Chapter
              </label>
              <select
                id="chapter"
                value={chapter}
                onChange={(e) => setChapter(e.target.value)}
                className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                {chapters.map((c) => (
                  <option key={c} value={c}>
                    {c === 'Any' ? 'Any chapter' : c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <fieldset className="mt-5">
            <legend className="font-label text-xs font-bold tracking-[0.1em] text-muted-foreground uppercase">
              Difficulty
            </legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {(['Any', ...DIFFICULTIES] as const).map((option) => (
                <button
                  key={option}
                  type="button"
                  aria-pressed={difficulty === option}
                  onClick={() => setDifficulty(option)}
                  className={cn(
                    'inline-flex h-11 items-center rounded-md border px-3.5 font-label text-sm font-semibold',
                    difficulty === option
                      ? 'border-primary bg-accent text-accent-foreground'
                      : 'border-border bg-background text-muted-foreground hover:text-foreground',
                  )}
                >
                  {option === 'Any' ? 'Any level' : option}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset className="mt-5">
            <legend className="font-label text-xs font-bold tracking-[0.1em] text-muted-foreground uppercase">
              How many questions
            </legend>
            <div className="mt-2 flex gap-2">
              {COUNTS.map((n) => (
                <button
                  key={n}
                  type="button"
                  aria-pressed={count === n}
                  onClick={() => setCount(n)}
                  className={cn(
                    'inline-flex h-11 min-w-16 items-center justify-center rounded-md border px-3 font-display text-sm font-bold tabular-nums',
                    count === n
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border bg-background text-muted-foreground hover:text-foreground',
                  )}
                >
                  {n}
                </button>
              ))}
            </div>
          </fieldset>

          <div className="mt-6 flex flex-wrap items-center gap-3 border-t pt-5">
            <Button type="submit" className="h-12 px-5" disabled={matched.length === 0}>
              Start {Math.min(count, matched.length)} questions
              <ArrowRight className="size-4" aria-hidden="true" />
            </Button>
            <p className="text-sm text-muted-foreground">
              {matched.length === 0
                ? 'No drill questions match this combination yet.'
                : `${matched.length} question${matched.length === 1 ? '' : 's'} match your filters.`}
            </p>
          </div>
        </form>

        {/* The dashboard: the learner's own history, so the empty state has to
            say what to do rather than show an empty box. */}
        <section id="progress" className="rounded-xl border bg-background p-5 sm:p-6" aria-labelledby="progress-heading">
          <div className="flex items-start justify-between gap-3">
            <h2 id="progress-heading" className="font-display text-lg font-bold">
              Your progress
            </h2>
            <span className="inline-flex items-center gap-1 rounded-full bg-accent px-2.5 py-1 font-label text-xs font-bold text-accent-foreground">
              <Flame className="size-3.5" strokeWidth={1.75} aria-hidden="true" />
              {streakDays()} day streak
            </span>
          </div>

          {accuracy.length === 0 ? (
            <div className="mt-4 rounded-lg border border-dashed p-5">
              <p className="text-sm text-muted-foreground">
                Finish one quiz and your subject-wise accuracy appears here. It is stored in this
                browser only.
              </p>
            </div>
          ) : (
            <ul className="mt-4 space-y-4">
              {accuracy.map((row) => (
                <li key={row.subject}>
                  <div className="mb-1.5 flex items-baseline justify-between gap-3">
                    <span className="text-sm font-medium">{row.subject}</span>
                    <span className="font-label text-sm font-bold tabular-nums">{row.accuracy}%</span>
                  </div>
                  <Bar
                    value={row.accuracy}
                    label={`${row.subject}: ${row.accuracy} percent accuracy over ${row.answered} answered`}
                    tone={row.accuracy >= 75 ? 'success' : row.accuracy >= 55 ? 'brand' : 'warning'}
                  />
                  <p className="mt-1 text-xs text-muted-foreground">{row.answered} questions answered</p>
                </li>
              ))}
            </ul>
          )}

          <h3 className="mt-6 font-label text-xs font-bold tracking-[0.1em] text-muted-foreground uppercase">
            Recent quizzes
          </h3>
          {history.length === 0 ? (
            <p className="mt-2 text-sm text-muted-foreground">No finished quiz yet.</p>
          ) : (
            <ul className="mt-2 divide-y">
              {history.slice(0, 5).map((a) => (
                <li key={a.id} className="flex items-center justify-between gap-3 py-2 text-sm">
                  <span>
                    {a.exam} {a.subject}
                  </span>
                  <span className="font-label text-xs font-semibold tabular-nums text-muted-foreground">
                    {a.correct}/{a.total} · {a.date}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <Section ground="raised" className="mt-12">
        <SectionHead
          title="Saved for revision"
          intro={
            savedQuestions.length
              ? `${savedQuestions.length} question${savedQuestions.length === 1 ? '' : 's'} bookmarked in this browser.`
              : 'Nothing saved yet. The bookmark button on any question keeps it here.'
          }
        />
        {savedQuestions.length === 0 ? (
          <div className="rounded-xl border border-dashed bg-background p-8 text-center">
            <Bookmark className="mx-auto size-6 text-muted-foreground" strokeWidth={1.75} aria-hidden="true" />
            <p className="mx-auto mt-3 max-w-sm text-sm text-muted-foreground">
              Open any quiz, answer a question and tap Save for later. It lands here with its
              solution.
            </p>
            <Button asChild variant="outline" className="mt-4 h-11">
              <Link to="/quiz?exam=NEET&type=PYQ&count=10">Start a NEET set</Link>
            </Button>
          </div>
        ) : (
          <ul className="grid gap-3 md:grid-cols-2">
            {savedQuestions.map((q) => (
              <li key={q.id} className="rounded-xl border bg-background p-4">
                <p className="font-label text-xs font-semibold text-muted-foreground">
                  {q.exam} {q.subject} · {q.chapter}
                </p>
                <p className="mt-1 text-sm font-medium whitespace-pre-line">{q.question.en}</p>
                <p className="mt-2 border-t pt-2 text-sm whitespace-pre-line text-muted-foreground">{q.solution.en}</p>
              </li>
            ))}
          </ul>
        )}
      </Section>
    </main>
  )
}
