import { useMemo, useState } from 'react'
import { Link } from 'react-router'
import {
  ArrowRight,
  BookMarked,
  ClipboardList,
  Languages,
  Repeat2,
  Sparkles,
  Timer,
} from 'lucide-react'
import { Meta } from '@/components/Meta'
import { useLang } from '@/components/lang'
import { QuestionCard } from '@/components/QuestionCard'
import { Bar, Section, SectionHead } from '@/components/Primitives'
import { ScienceFigure, type FigureKind } from '@/components/ScienceFigure'
import { Stars } from '@/components/Stars'
import { Button } from '@/components/ui/button'
import { useQuestionBank } from '@/lib/dbQuestions'
import { publicReviews, ratingSummary, stats } from '@/lib/analytics'
import { questionSignals } from '@/lib/feedback'

const SAMPLE_ID = 1

const PATHS = [
  {
    to: '/neet',
    title: 'NEET PYQ',
    hi: 'नीट पिछले वर्षों के प्रश्न',
    body: 'Physics, Chemistry, Botany and Zoology, sorted by year and chapter.',
    meta: '2015 – 2025',
    icon: ClipboardList,
    figure: 'oscillation' as FigureKind,
  },
  {
    to: '/jee',
    title: 'JEE Mains PYQ',
    hi: 'जेईई मेन्स पिछले वर्षों के प्रश्न',
    body: 'Physics, Chemistry and Mathematics, filtered by year and shift.',
    meta: '2019 – 2025',
    icon: BookMarked,
    figure: 'molecule' as FigureKind,
  },
  {
    to: '/practice',
    title: 'Subject-wise practice',
    hi: 'विषय-वार अभ्यास',
    body: 'Drill one chapter at a time — Easy, Medium or Hard.',
    meta: 'Chapter-wise',
    icon: Sparkles,
    figure: 'cell' as FigureKind,
  },
  {
    to: '/practice?difficulty=Hard',
    title: 'Custom practice',
    hi: 'अपनी पसंद का अभ्यास',
    body: 'Exams mixed, 10, 20 or 30 questions, from the chapter you scored lowest on.',
    meta: 'Your mix',
    icon: Repeat2,
    figure: 'orbital' as FigureKind,
  },
]

export default function Home() {
  const { lang, setLang } = useLang()
  const { questions } = useQuestionBank()
  const sample = useMemo(() => {
    // A real question from the bank, picked for having the freshest year.
    const newest = questions.filter((q) => q.type === 'PYQ').sort((a, b) => (b.year ?? 0) - (a.year ?? 0))
    return newest.find((q) => q.id === SAMPLE_ID) ?? newest[0] ?? questions[0]
  }, [questions])
  const signals = useMemo(() => questionSignals(), [])
  const [picked, setPicked] = useState<number | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const s = stats()
  const summary = ratingSummary()
  const reviews = publicReviews({ sort: 'helpful', page: 1 }).items.slice(0, 3)

  return (
    <>
      <Meta
        title="EduMahi — free NEET and JEE Mains practice in Hindi and English"
        description="Solve previous year and extra practice questions for NEET and JEE Mains with a step-by-step solution on every question. Switch any question between Hindi and English and track your accuracy chapter by chapter."
      />

      <main>
        {/* First screen: the quiz is the hero. The live card is a real bank
            question, not a picture of one. */}
        <div className="relative isolate overflow-hidden">
          <div className="hero-glow pointer-events-none absolute inset-x-0 top-0 -z-10 h-[40rem]" aria-hidden="true" />
          <div className="mx-auto w-full max-w-content px-gutter pt-6 pb-10 sm:pt-12 lg:pt-16 lg:pb-20">
            <div className="grid items-start gap-7 sm:gap-10 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:gap-14">
              <div className="lg:pt-5">
                {/* The subject, drawn: the wave every Physics paper opens with. */}
                <div className="mb-4 h-12 w-28 text-foreground sm:mb-5 sm:h-14 sm:w-32" aria-hidden="true">
                  <ScienceFigure kind="oscillation" />
                </div>
                <h1 className="text-[clamp(2.15rem,6vw,3.75rem)] font-extrabold text-balance">
                  One question at a time,{' '}
                   <span className="text-primary">solved properly.</span>
                </h1>
                <p className="mt-3 max-w-md text-[1.05rem] text-muted-foreground sm:mt-4">
                  NEET and JEE Mains previous year questions with an explanation under every answer —
                  in English or Hindi, whichever you think in.
                </p>

                <div className="mt-5 flex flex-col gap-2.5 sm:mt-6 sm:flex-row">
                  <Button asChild size="lg" className="h-12 px-6 text-[0.95rem]">
                    <Link to="/quiz?exam=NEET&type=PYQ&count=10">
                      Start NEET PYQ
                      <ArrowRight className="size-4" aria-hidden="true" />
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="outline" className="h-12 px-6 text-[0.95rem]">
                    <Link to="/quiz?exam=JEE+Mains&type=PYQ&count=10">Start JEE Mains PYQ</Link>
                  </Button>
                </div>

                {/* The proof: the bank, counted from itself. */}
                <dl className="mt-5 grid max-w-md grid-cols-4 gap-x-4 gap-y-3 border-t pt-4 sm:mt-9 sm:gap-x-6 sm:gap-y-5 sm:pt-6">
                  {[
                    { label: 'Questions', value: s.total },
                    { label: 'Subjects', value: s.subjects },
                    { label: 'Exams', value: s.exams },
                    { label: 'Avg rating', value: summary.average ? summary.average.toFixed(1) : 'New' },
                  ].map((item) => (
                    <div key={item.label}>
                      <dt className="font-label text-[0.7rem] font-bold tracking-[0.08em] text-muted-foreground uppercase sm:text-[0.72rem] sm:tracking-[0.12em]">
                        {item.label}
                      </dt>
                      <dd className="mt-0.5 font-display text-xl font-bold tabular-nums sm:text-2xl">{item.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>

              {/* The product, live. */}
              <div className="relative">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <p className="flex items-center gap-1.5 font-label text-[0.8125rem] font-bold tracking-[0.08em] text-muted-foreground uppercase">
                    <span className="relative flex size-2" aria-hidden="true">
                      <span className="absolute inline-flex size-full animate-ping rounded-full bg-success opacity-60 motion-reduce:animate-none" />
                      <span className="relative inline-flex size-2 rounded-full bg-success" />
                    </span>
                    Try it — no sign-up
                  </p>
                  <div className="inline-flex rounded-full border bg-background p-0.5" role="group" aria-label="Question language">
                    <button
                      type="button"
                      onClick={() => setLang('en')}
                      aria-pressed={lang === 'en'}
                      className={`inline-flex h-9 min-w-11 items-center justify-center rounded-full px-2.5 font-label text-xs font-semibold transition-colors ${
                        lang === 'en' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      English
                    </button>
                    <button
                      type="button"
                      onClick={() => setLang('hi')}
                      aria-pressed={lang === 'hi'}
                      className={`inline-flex h-9 min-w-11 items-center justify-center rounded-full px-2.5 font-label text-xs font-semibold transition-colors ${
                        lang === 'hi' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      हिंदी
                    </button>
                  </div>
                </div>

                <QuestionCard
                  question={sample}
                  index={0}
                  total={1}
                  lang={lang}
                  selected={picked}
                  submitted={submitted}
                  signals={signals}
                  onSelect={setPicked}
                  onSubmit={() => setSubmitted(true)}
                />

                {submitted && (
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-background px-4 py-3">
                    <p className="text-sm text-muted-foreground">Ready for a full set?</p>
                    <div className="flex gap-2">
                      <Button asChild size="sm" className="h-11">
                        <Link
                          to={`/quiz?${new URLSearchParams({
                            exam: sample.exam,
                            subject: sample.subject,
                            type: sample.type,
                            count: '10',
                          }).toString()}`}
                        >
                          Solve a set like this
                        </Link>
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-11"
                        onClick={() => {
                          setPicked(null)
                          setSubmitted(false)
                        }}
                      >
                        Reset
                      </Button>
                    </div>
                  </div>
                )}

                <p className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[0.8125rem] text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <Timer className="size-3.5" aria-hidden="true" /> Optional timer
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Languages className="size-3.5" aria-hidden="true" /> Language carries over
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Repeat2 className="size-3.5" aria-hidden="true" /> Solution in both languages
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* The four ways in. */}
        <Section id="paths" ground="raised">
          <SectionHead
            title="Pick where you are starting"
            intro="Every path ends in the same quiz: one question, four options, submit for the solution."
          />
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {PATHS.map((path) => (
              <li key={path.title}>
                <Link
                  to={path.to}
                  className="group flex h-full flex-col gap-3 rounded-xl border bg-background p-5 transition-[transform,border-color,box-shadow] duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-raised motion-reduce:hover:translate-y-0"
                >
                  <span className="grid size-10 place-items-center rounded-lg bg-accent text-accent-foreground">
                    <path.icon className="size-5" strokeWidth={1.75} aria-hidden="true" />
                  </span>
                  <span>
                    <span className="block font-display text-[1.02rem] font-bold text-foreground">
                      {path.title}
                    </span>
                    <span className="mt-0.5 block text-xs text-muted-foreground" lang="hi">
                      {path.hi}
                    </span>
                  </span>
                  <span className="text-sm text-muted-foreground">{path.body}</span>
                  <span className="-my-1 h-14 w-full text-foreground" aria-hidden="true">
                    <ScienceFigure kind={path.figure} />
                  </span>
                  <span className="mt-auto flex items-center justify-between pt-2 font-label text-xs font-semibold">
                    <span className="rounded-full bg-muted px-2 py-0.5 text-secondary-foreground">{path.meta}</span>
                    <ArrowRight
                      className="size-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-foreground motion-reduce:group-hover:translate-x-0"
                      aria-hidden="true"
                    />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Section>

        {/* Coverage, drawn from the bank itself. */}
        <Section>
          <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
            <div>
              <h2 className="text-[clamp(1.6rem,3.2vw,2.35rem)]">
                Your accuracy, chapter by chapter.
              </h2>
              <p className="mt-3 max-w-md text-muted-foreground">
                Each quiz you finish is logged against its subject and chapter, so the weak chapter is
                visible before the next test, not after it.
              </p>
              <Button asChild variant="outline" className="mt-6 h-11">
                <Link to="/practice#progress">Open your progress</Link>
              </Button>
            </div>
            <div className="rounded-xl border bg-card p-5 shadow-raised sm:p-6">
              <p className="font-label text-xs font-bold tracking-[0.12em] text-muted-foreground uppercase">
                What the dashboard looks like
              </p>
              <ul className="mt-4 space-y-4">
                {[
                  { name: 'Laws of Motion', pct: 82 },
                  { name: 'Chemical Bonding', pct: 64 },
                  { name: 'Cell — Structure & Function', pct: 91 },
                  { name: 'Human Physiology', pct: 47 },
                ].map((row) => (
                  <li key={row.name}>
                    <div className="mb-1.5 flex items-baseline justify-between gap-3">
                      <span className="text-sm font-medium">{row.name}</span>
                      <span className="font-label text-sm font-bold tabular-nums">{row.pct}%</span>
                    </div>
                    <Bar
                      value={row.pct}
                      label={`${row.name}: ${row.pct} percent accuracy in this sample`}
                      tone={row.pct >= 75 ? 'success' : row.pct >= 55 ? 'brand' : 'warning'}
                    />
                  </li>
                ))}
              </ul>
              <p className="mt-5 border-t pt-3 text-xs text-muted-foreground">
                Illustrative figures. Yours start filling from your first finished quiz and stay in
                this browser.
              </p>
            </div>
          </div>
        </Section>

        {/* What students say. Reviews are the visitor's own, so with none on
            this browser this is one line pointing at the page that takes them. */}
        {reviews.length === 0 ? (
          <div className="border-y border-border bg-muted/60">
            <div className="mx-auto flex w-full max-w-content flex-wrap items-center justify-between gap-x-6 gap-y-2 px-gutter py-4">
              <p className="text-sm text-foreground">
                No reviews on this browser yet — the first one you write appears here.
              </p>
              <Link
                to="/feedback"
                className="inline-flex items-center gap-1 font-label text-sm font-semibold text-primary underline-offset-4 hover:underline"
              >
                Rate EduMahi
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        ) : (
          <Section ground="raised">
            <SectionHead
              title="What students say"
              intro={`${summary.count} review${summary.count > 1 ? 's' : ''} left on this browser, averaging ${summary.average?.toFixed(1)} out of 5.`}
              action={
                <Button asChild variant="outline" className="h-11">
                  <Link to="/feedback">Write a review</Link>
                </Button>
              }
            />
            <ul className="grid gap-3 md:grid-cols-3">
              {reviews.map((r) => (
                <li key={r.id} className="rounded-xl border bg-background p-5">
                  <Stars value={r.rating} size="sm" />
                  <blockquote className="mt-3 text-sm text-foreground">{r.message}</blockquote>
                  <p className="mt-3 font-label text-xs text-muted-foreground">
                    {r.name || 'Anonymous aspirant'} ·{' '}
                    {new Date(r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </p>
                </li>
              ))}
            </ul>
          </Section>
        )}

        {/* The closing band, on the brand colour. */}
        <section className="brand-surface relative isolate overflow-hidden py-10 text-primary-foreground sm:py-14">
          <div className="mx-auto w-full max-w-content px-gutter">
            <div className="flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between md:gap-10">
              <div>
                <h2 className="max-w-lg text-[clamp(1.8rem,4vw,2.7rem)] font-extrabold text-balance">
                  Twenty questions before class. Every day.
                </h2>
                <p className="mt-4 max-w-md text-primary-foreground/85">
                  No login, no timer running unless you want one, and the solution waiting under your
                  answer.
                </p>
              </div>
              <div className="flex w-full flex-col gap-2.5 sm:w-auto sm:flex-row">
                <Button asChild size="lg" variant="secondary" className="h-12 px-6">
                  <Link to="/practice">Build a practice set</Link>
                </Button>
                <Button asChild size="lg" variant="ghost" className="h-12 px-6 text-primary-foreground hover:bg-white/15 hover:text-primary-foreground">
                  <Link to="/practice#progress">See your progress</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}
