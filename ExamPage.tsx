import { useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { ArrowRight, Bookmark, Filter } from 'lucide-react'
import { Meta } from '@/components/Meta'
import { Section } from '@/components/Primitives'
import { Button } from '@/components/ui/button'
import type { Question, Exam } from '@/data/questions'
import { useQuestionBank } from '@/lib/dbQuestions'
import { useLang, type Lang } from '@/components/lang'
import { cn } from '@/lib/utils'

const SUBJECT_NOTES: Record<string, string> = {
  Physics:
    'Numericals from Mechanics, Electrodynamics, Optics and Modern Physics. Every question carries the formula route, not just the answer.',
  Chemistry:
    'Physical, Organic and Inorganic together, because the exam mixes them. Reaction reasons are spelled out step by step.',
  Biology:
    'Botany and Zoology, NCERT chapter names kept, so a chapter filter matches where you are in the book.',
  Mathematics:
    'Algebra, Calculus, Coordinate Geometry and Vectors. Shortcut where a shortcut is safe, the full method where it is not.',
}

const SUBJECT_SLUG: Record<string, string> = {
  Physics: 'physics',
  Chemistry: 'chemistry',
  Biology: 'biology',
  Mathematics: 'mathematics',
}

/* The NEET and JEE pages are the same page with a different exam: one subject
   rail, year and chapter filters, and the two modes a student chooses between. */
export function ExamPage({
  exam,
  subjects,
  title,
  description,
  heading,
  intro,
  shifts = false,
}: {
  exam: Exam
  subjects: string[]
  title: string
  description: string
  heading: string
  intro: string
  shifts?: boolean
}) {
  const [params, setParams] = useSearchParams()
  const { questions: QUESTIONS } = useQuestionBank()
  const subject = params.get('subject') ?? subjects[0]
  const mode = params.get('type') === 'Practice' ? 'Practice' : 'PYQ'
  const year = params.get('year') ?? ''
  const chapter = params.get('chapter') ?? ''

  const inSubject = QUESTIONS.filter((q) => q.exam === exam && q.subject === subject)
  const chapters = [...new Set(inSubject.map((q) => q.chapter))].sort()
  const years = [...new Set(inSubject.filter((q) => q.year).map((q) => q.year as number))].sort((a, b) => b - a)
  const shiftOptions = [...new Set(inSubject.filter((q) => q.shift).map((q) => q.shift as string))].sort()

  const matched = inSubject.filter(
    (q) =>
      q.type === mode &&
      (!year || String(q.year) === year) &&
      (!chapter || q.chapter === chapter),
  )

  function update(next: Record<string, string | null>) {
    const copy = new URLSearchParams(params)
    for (const [k, v] of Object.entries(next)) {
      if (v === null || v === '') copy.delete(k)
      else copy.set(k, v)
    }
    if (next.subject) copy.delete('chapter')
    if (next.subject || next.type) copy.delete('year')
    setParams(copy, { replace: true })
  }

  const quizHref = `/quiz?${new URLSearchParams({
    exam,
    subject,
    type: mode,
    ...(year ? { year } : {}),
    ...(chapter ? { chapter } : {}),
  }).toString()}`

  return (
    <main className="mx-auto w-full max-w-content px-gutter py-10 sm:py-12">
      <Meta title={title} description={description} />

      <header className="max-w-2xl">
        <h1 className="text-[clamp(2rem,5vw,3rem)] font-extrabold text-balance">{heading}</h1>
        <p className="mt-3 text-muted-foreground">{intro}</p>
      </header>

      {/* Subject rail: the one choice a student makes first. */}
      <div className="mt-8 -mx-gutter overflow-x-auto px-gutter pb-1">
        <div className="flex min-w-max gap-2" role="tablist" aria-label={`${exam} subjects`}>
          {subjects.map((s) => {
            const count = QUESTIONS.filter((q) => q.exam === exam && q.subject === s).length
            const active = s === subject
            return (
              <button
                key={s}
                role="tab"
                type="button"
                aria-selected={active}
                onClick={() => update({ subject: s, type: null, year: null, chapter: null })}
                className={cn(
                  'inline-flex h-12 items-center gap-2 rounded-full border px-4 font-display text-sm font-semibold transition-colors',
                  active
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground',
                )}
              >
                {s}
                <span
                  className={cn(
                    'rounded-full px-1.5 py-0.5 font-label text-[0.65rem] font-bold tabular-nums',
                    active ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-muted text-muted-foreground',
                  )}
                >
                  {count}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
        <section aria-labelledby="subject-heading" className="rounded-xl border bg-card p-5 sm:p-6">
          <h2 id="subject-heading" className="text-2xl">
            {subject}
          </h2>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">{SUBJECT_NOTES[subject] ?? ''}</p>

          <div className="mt-5 inline-flex rounded-lg border bg-background p-1" role="group" aria-label="Question type">
            {(['PYQ', 'Practice'] as const).map((m) => (
              <button
                key={m}
                type="button"
                aria-pressed={mode === m}
                onClick={() => update({ type: m === 'PYQ' ? null : m, year: null })}
                className={cn(
                  'inline-flex h-10 items-center rounded-md px-3 font-label text-xs font-bold transition-colors',
                  mode === m ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {m === 'PYQ' ? 'Previous year questions' : 'Extra practice'}
              </button>
            ))}
          </div>

          <dl className="mt-5 grid grid-cols-2 gap-3 border-t pt-4 sm:grid-cols-3">
            <div>
              <dt className="font-label text-[0.65rem] font-bold tracking-[0.1em] text-muted-foreground uppercase">
                In this set
              </dt>
              <dd className="font-display text-xl font-bold tabular-nums">{matched.length}</dd>
            </div>
            <div>
              <dt className="font-label text-[0.65rem] font-bold tracking-[0.1em] text-muted-foreground uppercase">
                Chapters
              </dt>
              <dd className="font-display text-xl font-bold tabular-nums">{chapters.length}</dd>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <dt className="font-label text-[0.65rem] font-bold tracking-[0.1em] text-muted-foreground uppercase">
                Mode
              </dt>
              <dd className="text-sm font-medium">{mode === 'PYQ' ? 'From a real paper' : 'Written for drill'}</dd>
            </div>
          </dl>

          {matched.length === 0 ? (
            <div className="mt-5 rounded-lg border border-dashed p-5">
              <p className="text-sm text-muted-foreground">
                Nothing matches this year and chapter together. Clear one filter, or run the same
                chapter as extra practice.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button size="sm" variant="outline" className="h-11" onClick={() => update({ year: null, chapter: null })}>
                  Clear filters
                </Button>
                <Button size="sm" variant="ghost" className="h-11" onClick={() => update({ type: 'Practice', year: null })}>
                  Switch to extra practice
                </Button>
              </div>
            </div>
          ) : (
            <div className="mt-5 flex flex-wrap items-center gap-2">
              <Button asChild className="h-12 px-5">
                <Link to={quizHref}>
                  Start {matched.length > 10 ? '10' : matched.length} questions
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-12">
                <Link
                  to={`/quiz?${new URLSearchParams({
                    exam,
                    subject,
                    type: mode,
                    ...(year ? { year } : {}),
                    ...(chapter ? { chapter } : {}),
                    count: String(Math.min(30, matched.length)),
                  }).toString()}`}
                >
                  Whole set ({Math.min(30, matched.length)})
                </Link>
              </Button>
            </div>
          )}
        </section>

        <aside className="rounded-xl border bg-background p-5" aria-labelledby="filters-heading">
          <h2 id="filters-heading" className="flex items-center gap-1.5 font-label text-xs font-bold tracking-[0.1em] text-muted-foreground uppercase">
            <Filter className="size-3.5" strokeWidth={1.75} aria-hidden="true" /> Filter
          </h2>

          {mode === 'PYQ' && (
            <fieldset className="mt-4">
              <legend className="font-label text-xs font-semibold text-foreground">Year</legend>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => update({ year: null })}
                  aria-pressed={!year}
                  className={cn(
                    'inline-flex h-11 items-center rounded-md border px-3 font-label text-xs font-semibold tabular-nums',
                    !year ? 'border-primary bg-accent text-accent-foreground' : 'border-border text-muted-foreground',
                  )}
                >
                  All
                </button>
                {years.map((y) => (
                  <button
                    key={y}
                    type="button"
                    onClick={() => update({ year: String(y) })}
                    aria-pressed={year === String(y)}
                    className={cn(
                      'inline-flex h-11 items-center rounded-md border px-3 font-label text-xs font-semibold tabular-nums',
                      year === String(y)
                        ? 'border-primary bg-accent text-accent-foreground'
                        : 'border-border text-muted-foreground hover:text-foreground',
                    )}
                  >
                    {y}
                  </button>
                ))}
              </div>
            </fieldset>
          )}

          {shifts && mode === 'PYQ' && shiftOptions.length > 0 && (
            <div className="mt-5">
              <p className="font-label text-xs font-semibold text-foreground">Shift</p>
              <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                {shiftOptions.map((s) => (
                  <li key={s} className="flex items-center justify-between gap-2 rounded-md bg-muted px-2.5 py-1.5">
                    <span>{s}</span>
                    <span className="font-label text-xs font-bold tabular-nums">
                      {inSubject.filter((q) => q.shift === s).length}
                    </span>
                  </li>
                ))}
              </ul>
              <p className="mt-1.5 text-xs text-muted-foreground">Shown on each question card.</p>
            </div>
          )}

          <div className="mt-5">
            <p className="font-label text-xs font-semibold text-foreground">Chapter</p>
            <div className="mt-2 max-h-72 space-y-1 overflow-y-auto pr-1">
              <button
                type="button"
                onClick={() => update({ chapter: null })}
                aria-pressed={!chapter}
                className={cn(
                  'flex min-h-11 w-full items-center rounded-md px-2.5 text-left text-sm',
                  !chapter ? 'bg-accent font-semibold text-accent-foreground' : 'text-muted-foreground hover:bg-muted',
                )}
              >
                All chapters
              </button>
              {chapters.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => update({ chapter: c })}
                  aria-pressed={chapter === c}
                  className={cn(
                    'flex min-h-11 w-full items-center rounded-md px-2.5 text-left text-sm leading-snug',
                    chapter === c ? 'bg-accent font-semibold text-accent-foreground' : 'text-muted-foreground hover:bg-muted',
                  )}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </aside>
      </div>

      <Section ground="raised" className="mt-12">
        <h2 className="text-2xl">Every chapter in {exam} {subject}</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Counted from the bank, so an empty chapter is a chapter you can tell us to add.
        </p>
        <ul className="mt-5 grid gap-x-8 gap-y-3 sm:grid-cols-2">
          {chapters.map((c) => {
            const total = inSubject.filter((q) => q.chapter === c).length
            return (
              <li key={c}>
                  <Link
                    to={`/quiz?${new URLSearchParams({
                      exam,
                      subject,
                      type: mode,
                      chapter: c,
                    }).toString()}`}
                    className="group flex items-center justify-between gap-3 border-b py-2"
                  >
                  <span className="text-sm font-medium group-hover:text-primary">{c}</span>
                  <span className="font-label text-xs font-bold tabular-nums text-muted-foreground">{total}</span>
                </Link>
              </li>
            )
          })}
        </ul>
        <p className="mt-5 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Bookmark className="size-3.5" strokeWidth={1.75} aria-hidden="true" />
          Save any question with the bookmark button to revise it later.
        </p>
      </Section>
    </main>
  )
}

/* Used by both exam pages for the "saved for revision" list, which is the same
   data for either exam. */
export function SavedList({ questions }: { questions: Question[] }) {
  const { lang } = useLang()
  const [open, setOpen] = useState<string | null>(null)
  const key: Lang = lang
  if (questions.length === 0) return null
  return (
    <ul className="mt-4 space-y-2">
      {questions.map((q) => (
        <li key={q.id} className="rounded-lg border bg-background">
          <button
            type="button"
            onClick={() => setOpen(open === String(q.id) ? null : String(q.id))}
            aria-expanded={open === String(q.id)}
            className="flex min-h-11 w-full items-center justify-between gap-3 px-4 py-3 text-left"
          >
            <span className="text-sm font-medium whitespace-pre-line" lang={lang}>
              {q.question[key]}
            </span>
            <span className="font-label text-xs text-muted-foreground">
              {open === String(q.id) ? 'Hide' : 'Solution'}
            </span>
          </button>
          {open === String(q.id) && (
            <p className="border-t px-4 py-3 text-sm whitespace-pre-line text-muted-foreground">
              {q.solution[key]}
            </p>
          )}
        </li>
      ))}
    </ul>
  )
}

export { SUBJECT_SLUG }
