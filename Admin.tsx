/* The owner's page: add, edit and delete questions in the shared database, bulk
 * import from CSV, and read every report. The passphrase keeps a visitor out of
 * the page; the database policy from the setup SQL is what actually guards the
 * writes — say so rather than implying more. */
import { useEffect, useMemo, useRef, useState } from 'react'
import { Download, ImagePlus, Lock, Trash2, Upload } from 'lucide-react'
import { Meta } from '@/components/Meta'
import { Button } from '@/components/ui/button'
import type { Difficulty, Exam, Question } from '@/data/questions'
import {
  addQuestions,
  editQuestion,
  hasStored,
  loadQuestions,
  nextId,
  removeQuestion,
  useQuestionBank,
} from '@/lib/dbQuestions'
import {
  allFeedback,
  deleteFeedback,
  updateFeedback,
  type Feedback,
} from '@/lib/feedback'
import { adminSummary, exportFeedbackCsv } from '@/lib/analytics'
import { SUPABASE_KEY, SUPABASE_URL } from '@/lib/config'
import {
  SETUP_SQL,
  checkWriteKey,
  hasWriteKey,
  questionsReady,
  setWriteKey,
  type DbError,
} from '@/lib/supabase'
import { parseCsv, toCsvTemplate } from '@/lib/csv'
import { cn } from '@/lib/utils'

/* The password is never written down — not to localStorage, sessionStorage, a
   cookie or the code. It is typed here, checked against the database once, and
   held in memory until the tab closes or Lock is pressed. The database policy
   refuses every write that does not carry it. */

const fields =
  'h-11 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring'
const area =
  'min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring'
const labelCls = 'font-label text-xs font-semibold'

/* Which key is loaded, enough to spot a placeholder at a glance, never the whole
   key. It is public by design, but a screen is a screen. */
const SUPABASE_KEY_LABEL = SUPABASE_KEY
  ? `${SUPABASE_KEY.slice(0, 12)}… (${SUPABASE_KEY.length} chars)`
  : 'none'

function Locked({ onUnlocked }: { onUnlocked: () => void }) {
  const [phrase, setPhrase] = useState('')
  const [error, setError] = useState('')
  const [detail, setDetail] = useState<{ status?: number; url?: string; body?: string } | null>(null)
  const [busy, setBusy] = useState(false)
  const asked = questionsReady

  return (
    <main className="mx-auto w-full max-w-md px-gutter pb-16 pt-28">
      <Meta title="Admin — EduMahi" description="EduMahi admin: add questions and review feedback." />
      <div className="rounded-xl border bg-card p-6 shadow-raised">
        <Lock className="size-5 text-primary" strokeWidth={1.75} aria-hidden="true" />
        <h1 className="mt-3 text-2xl">{asked ? 'Enter the password' : 'Not set up yet'}</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          {asked
            ? 'Add questions, import a CSV and read the reports. The password is checked by a database function on every write and is never stored in this browser.'
            : 'The setup SQL has not been run, so there is nothing to write to yet. Run it in the Supabase SQL Editor and reload.'}
        </p>
        <form
          className="mt-5 grid gap-3"
          onSubmit={async (e) => {
            e.preventDefault()
            if (!phrase.trim() || busy) return
            setError('')
            setDetail(null)
            setBusy(true)
            try {
              await checkWriteKey(phrase)
              onUnlocked()
            } catch (err) {
              const e = err as DbError
              setError(e.message)
              setDetail({ status: e.status, url: e.url, body: e.body })
            } finally {
              setBusy(false)
            }
          }}
        >
          <div className="grid gap-1.5">
            <label htmlFor="passphrase" className={labelCls}>
              Admin password
            </label>
            <input
              id="passphrase"
              type="password"
              value={phrase}
              onChange={(e) => setPhrase(e.target.value)}
              aria-describedby={error ? 'admin-error' : 'admin-hint'}
              className={fields}
              autoComplete="off"
              disabled={!asked || busy}
            />
            <p id="admin-hint" className="text-xs text-muted-foreground">
              Held in memory for this tab only. Closing it signs you out.
            </p>
            <p className="font-mono text-[11px] break-all text-muted-foreground">
              Database: {SUPABASE_URL ? `${SUPABASE_URL.replace(/\/+$/, '')}/rest/v1/questions` : 'no URL set'}{' '}
              · key {SUPABASE_KEY_LABEL}
            </p>
          </div>
          {error && (
            <div id="admin-error" role="alert" className="grid gap-2 rounded-md bg-destructive-soft p-3">
              <p className="text-sm font-medium text-destructive">{error}</p>
              <dl className="grid gap-1 font-mono text-[11px] break-all text-muted-foreground">
                {detail?.status !== undefined && (
                  <div className="flex gap-1.5">
                    <dt className="font-label font-semibold">status</dt>
                    <dd>{detail.status}</dd>
                  </div>
                )}
                {detail?.url && (
                  <div className="flex gap-1.5">
                    <dt className="font-label font-semibold">url</dt>
                    <dd>{detail.url}</dd>
                  </div>
                )}
                {detail?.body && (
                  <div className="flex gap-1.5">
                    <dt className="font-label font-semibold">body</dt>
                    <dd>{detail.body.slice(0, 300)}</dd>
                  </div>
                )}
              </dl>
            </div>
          )}
          <Button type="submit" className="h-12" disabled={!asked || busy || !phrase.trim()}>
            {busy ? 'Checking…' : 'Unlock admin'}
          </Button>
        </form>
      </div>
    </main>
  )
}

export default function Admin() {
  /* hasWriteKey() is a module variable, so a reload lands back on the form. */
  const [unlocked, setUnlocked] = useState(() => hasWriteKey())

  if (!unlocked || !hasWriteKey()) return <Locked onUnlocked={() => setUnlocked(true)} />

  return (
    <AdminBody
      onLock={() => {
        setWriteKey(null)
        setUnlocked(false)
      }}
    />
  )
}

function AdminBody({ onLock }: { onLock: () => void }) {
  const [rows, setRows] = useState<Feedback[]>(() => allFeedback())
  // Opening the page is what fetches the shared bank.
  useEffect(() => {
    void loadQuestions()
  }, [])
  const [filter, setFilter] = useState<'all' | 'pending' | 'resolved'>('all')
  const [saved, setSaved] = useState('')
  const [tab, setTab] = useState<'questions' | 'feedback'>('questions')
  const summary = useMemo(() => adminSummary(), [rows])
  const { questions } = useQuestionBank()
  const shown = rows.filter((r) => filter === 'all' || r.status === filter)

  return (
    <main className="mx-auto w-full max-w-content px-gutter py-10">
      <Meta title="Admin — EduMahi" description="EduMahi admin: add questions and review feedback." />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-[clamp(1.8rem,4vw,2.6rem)] font-extrabold">Admin</h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="h-11"
            onClick={() => {
              exportFeedbackCsv(rows)
              setSaved('Feedback exported as CSV.')
            }}
          >
            <Download className="size-4" aria-hidden="true" /> Export feedback
          </Button>
          <Button variant="ghost" className="h-11" onClick={onLock}>
            Lock
          </Button>
        </div>
      </div>
      {saved && (
        <p role="status" className="mt-2 text-sm font-medium text-success">
          {saved}
        </p>
      )}

      <div className="mt-6 inline-flex rounded-lg border bg-background p-1" role="group" aria-label="Admin sections">
        {(['questions', 'feedback'] as const).map((t) => (
          <button
            key={t}
            type="button"
            aria-pressed={tab === t}
            onClick={() => setTab(t)}
            className={cn(
              'inline-flex h-10 items-center rounded-md px-3 font-label text-xs font-bold capitalize',
              tab === t ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'questions' ? (
        <QuestionAdmin
          onSaved={(msg) => {
            setSaved(msg)
            setRows(allFeedback())
          }}
        />
      ) : (
        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)] lg:items-start">
          <section aria-labelledby="feedback-heading">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 id="feedback-heading" className="text-xl">
                Feedback and reports
              </h2>
              <div className="flex gap-1" role="group" aria-label="Filter by status">
                {(['all', 'pending', 'resolved'] as const).map((f) => (
                  <button
                    key={f}
                    type="button"
                    aria-pressed={filter === f}
                    onClick={() => setFilter(f)}
                    className={cn(
                      'inline-flex h-10 items-center rounded-md border px-3 font-label text-xs font-semibold capitalize',
                      filter === f ? 'border-primary bg-accent' : 'border-border bg-background text-muted-foreground',
                    )}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {shown.length === 0 ? (
              <p className="mt-4 rounded-lg border border-dashed p-5 text-sm text-muted-foreground">
                Nothing here yet. Feedback left on the site appears in this list.
              </p>
            ) : (
              <ul className="mt-4 space-y-3">
                {shown.map((row) => (
                  <li key={row.id} className="rounded-xl border bg-background p-4">
                    <div className="flex flex-wrap items-center gap-2 font-label text-xs">
                      <span className="rounded-full bg-accent px-2 py-0.5 font-semibold">{row.type}</span>
                      {row.questionId !== null && <span className="text-muted-foreground">Q{row.questionId}</span>}
                      <span className="text-muted-foreground">{row.category}</span>
                      <span className="text-muted-foreground">{row.rating}★</span>
                      <span
                        className={cn(
                          'ml-auto rounded-full px-2 py-0.5 font-semibold',
                          row.status === 'resolved' ? 'bg-success/15 text-success' : 'bg-warning/15 text-foreground',
                        )}
                      >
                        {row.status}
                      </span>
                    </div>
                    <p className="mt-2 text-sm">{row.message}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {row.name || 'Anonymous'} · {new Date(row.createdAt).toLocaleString('en-IN')}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-10"
                        onClick={() => {
                          updateFeedback(row.id, { status: row.status === 'resolved' ? 'pending' : 'resolved' })
                          setRows(allFeedback())
                        }}
                      >
                        {row.status === 'resolved' ? 'Reopen' : 'Mark resolved'}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-10 text-destructive"
                        onClick={() => {
                          deleteFeedback(row.id)
                          setRows(allFeedback())
                          setSaved('Entry deleted.')
                        }}
                      >
                        <Trash2 className="size-4" aria-hidden="true" /> Delete
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <div className="space-y-6">
            <dl className="grid grid-cols-2 gap-3">
              {[
                { label: 'Average rating', value: summary.average ? summary.average.toFixed(1) : '—' },
                { label: 'Total feedback', value: summary.total },
                { label: 'Pending', value: summary.pending },
                { label: 'Question reports', value: summary.reports },
              ].map((c) => (
                <div key={c.label} className="rounded-xl border bg-card p-4">
                  <dt className="font-label text-[0.68rem] font-bold tracking-[0.1em] text-muted-foreground uppercase">
                    {c.label}
                  </dt>
                  <dd className="mt-1 font-display text-2xl font-extrabold tabular-nums">{c.value}</dd>
                </div>
              ))}
            </dl>

            <section aria-labelledby="flagged-heading" className="rounded-xl border bg-card p-5">
              <h2 id="flagged-heading" className="text-lg">
                Flagged questions
              </h2>
              {summary.flagged.length === 0 ? (
                <p className="mt-2 text-sm text-muted-foreground">No question has been reported.</p>
              ) : (
                <ul className="mt-3 space-y-2">
                  {summary.flagged.map((f) => {
                    const q = questions.find((item) => item.id === f.id)
                    return (
                      <li key={f.id} className="flex items-center justify-between gap-3 border-b pb-2 text-sm last:border-0">
                        <span>
                          <span className="font-semibold">Q{f.id}</span>{' '}
                          <span className="text-muted-foreground">{q ? `${q.subject} · ${q.chapter}` : 'added question'}</span>
                        </span>
                        <span className="font-label text-xs font-bold text-destructive">{f.count} reports</span>
                      </li>
                    )
                  })}
                </ul>
              )}
            </section>
          </div>
        </div>
      )}
    </main>
  )
}

type FormState = {
  exam: Exam
  subject: string
  chapter: string
  year: string
  type: 'PYQ' | 'Practice'
  difficulty: Difficulty
  qEn: string
  qHi: string
  oEn: [string, string, string, string]
  oHi: [string, string, string, string]
  correct: number
  sEn: string
  sHi: string
  image: string
}

/* Chapter suggestions, so the owner does not have to retype a name and split
   one chapter into two by a typo. Free text is still allowed. */
const CHAPTERS: Record<string, string[]> = {
  Physics: ['Units and Measurements', 'Kinematics', 'Laws of Motion', 'Work Energy and Power', 'Current Electricity', 'Ray Optics'],
  Chemistry: ['Some Basic Concepts', 'Atomic Structure', 'Chemical Bonding', 'Thermodynamics', 'Equilibrium', 'Organic Chemistry Basics'],
  Biology: ['Cell Structure', 'Human Physiology', 'Genetics and Evolution', 'Plant Physiology', 'Ecology'],
  Mathematics: ['Sets and Relations', 'Complex Numbers', 'Quadratic Equations', 'Straight Lines', 'Limits and Derivatives', 'Integration'],
}

const EMPTY: FormState = {
  exam: 'NEET',
  subject: 'Physics',
  chapter: '',
  year: '',
  type: 'PYQ',
  difficulty: 'Medium',
  qEn: '',
  qHi: '',
  oEn: ['', '', '', ''],
  oHi: ['', '', '', ''],
  correct: 1,
  sEn: '',
  sHi: '',
  image: '',
}

function QuestionAdmin({ onSaved }: { onSaved: (msg: string) => void }) {
  const { questions, questionsReady, status } = useQuestionBank()
  const added = questions.filter((q) => q.id > 100 || hasStored(q.id))
  const [editing, setEditing] = useState<Question | null>(null)

  return (
    <div className="mt-6">
      <ConnectionBanner ready={questionsReady} status={status} />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-start">
        <div className="space-y-6">
          <QuestionForm
            key={editing?.id ?? 'new'}
            editing={editing}
            onDone={(msg) => {
              setEditing(null)
              onSaved(msg)
            }}
            onCancel={() => setEditing(null)}
          />
        </div>
        <div className="space-y-6">
          <CsvImport onSaved={onSaved} />
        </div>
      </div>

      <section aria-labelledby="added-heading" className="mt-10">
        <h2 id="added-heading" className="text-xl">
          Questions in the database
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {added.length === 0
            ? 'None yet. The first question you add appears here, and in every student’s bank.'
            : `${added.length} question${added.length === 1 ? '' : 's'} you added, live for everyone.`}
        </p>
        {added.length > 0 && (
          <ul className="mt-3 space-y-2">
            {added.map((q) => (
              <li key={q.id} className="flex flex-wrap items-start justify-between gap-3 rounded-lg border bg-background p-3 text-sm">
                <div className="min-w-0">
                  <p className="font-label text-xs text-muted-foreground">
                    #{q.id} · {q.exam} {q.subject} · {q.type}
                    {q.year ? ` ${q.year}` : ''}
                  </p>
                  <p className="mt-0.5 line-clamp-2 font-medium">{q.question.en}</p>
                </div>
                <div className="flex shrink-0 gap-1">
                  <Button size="sm" variant="outline" className="h-10" onClick={() => setEditing(q)}>
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-10 text-destructive"
                    onClick={async () => {
                      try {
                        await removeQuestion(q.id)
                        onSaved(`Q${q.id} deleted from the database.`)
                      } catch (e) {
                        onSaved((e as Error).message)
                      }
                    }}
                  >
                    <Trash2 className="size-4" aria-hidden="true" />
                    <span className="sr-only">Delete question {q.id}</span>
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

function ConnectionBanner({ ready, status }: { ready: boolean; status: string }) {
  if (!ready) {
    return (
      <div className="mb-6 rounded-xl border border-warning/60 bg-warning/10 p-5">
        <h2 className="font-display text-lg font-bold">The setup SQL has not been run yet</h2>
        <p className="mt-1 text-sm text-foreground/80">
          The URL and publishable key are already in{' '}
           <code className="rounded bg-background px-1 font-mono text-xs">src/lib/config.ts</code>. Run the SQL
           below in your Supabase project’s SQL Editor, first replacing{' '}
           <code className="rounded bg-background px-1 font-mono text-xs">CHANGE-ME-PASSWORD</code> with the
           password you will type on this page. Writes go through database functions, not the table. The password stays in the database and in your head — it is
          never written into the code.
        </p>
        <pre className="mt-3 overflow-x-auto rounded-lg border bg-background p-3 font-mono text-[0.7rem] leading-relaxed">
          {SETUP_SQL}
        </pre>
        <p className="mt-2 text-xs text-muted-foreground">
          Until then the site keeps reading its built-in bank and the form below cannot save.
        </p>
      </div>
    )
  }
  if (status === 'offline') {
    return (
      <p role="alert" className="mb-6 rounded-xl border border-destructive/50 bg-destructive-soft p-4 text-sm">
        The database could not be reached just now. The built-in bank is showing; check the URL and key, then
        reload.
      </p>
    )
  }
  return null
}

function QuestionForm({
  editing,
  onDone,
  onCancel,
}: {
  editing: Question | null
  onDone: (msg: string) => void
  onCancel: () => void
}) {
  const [form, setForm] = useState<FormState>(() =>
    editing
      ? {
          exam: editing.exam,
          subject: editing.subject,
          chapter: editing.chapter,
          year: editing.year ? String(editing.year) : '',
          type: editing.type,
          difficulty: editing.difficulty,
          qEn: editing.question.en,
          qHi: editing.question.hi,
          oEn: [0, 1, 2, 3].map((i) => editing.options.en[i] ?? '') as FormState['oEn'],
          oHi: [0, 1, 2, 3].map((i) => editing.options.hi[i] ?? '') as FormState['oHi'],
          correct: editing.correctAnswer + 1,
          sEn: editing.solution.en,
          sHi: editing.solution.hi,
          image: editing.image ?? '',
        }
      : EMPTY,
  )
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => setForm((f) => ({ ...f, [key]: value }))

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!form.qEn.trim() || !form.qHi.trim()) return setError('Both the English and the Hindi question text are required.')
    if (form.oEn.some((o) => !o.trim())) return setError('All four options are required in English.')
    if (!form.sEn.trim()) return setError('The solution is what makes the question useful — it is required.')
    if (form.image.trim() && !/^https?:\/\//i.test(form.image.trim()))
      return setError('The image must be a full link starting with http:// or https://')
    if (form.type === 'PYQ' && form.year && !/^\d{4}$/.test(form.year.trim()))
      return setError('The year is four digits, e.g. 2023.')

    const oHi = form.oHi.map((o, i) => o.trim() || form.oEn[i].trim()) as FormState['oEn']
    const question: Question = {
      id: editing?.id ?? nextId(),
      exam: form.exam,
      subject: form.subject.trim(),
      chapter: form.chapter.trim() || 'Unclassified',
      year: form.type === 'PYQ' && form.year ? Number(form.year) : null,
      shift: editing?.shift ?? null,
      type: form.type,
      difficulty: form.difficulty,
      question: { en: form.qEn.trim(), hi: form.qHi.trim() },
      options: { en: form.oEn.map((o) => o.trim()), hi: oHi },
      correctAnswer: form.correct - 1,
      ...(form.image.trim() ? { image: form.image.trim() } : {}),
      solution: { en: form.sEn.trim(), hi: form.sHi.trim() || form.sEn.trim() },
    }

    setBusy(true)
    try {
      if (editing) await editQuestion(question)
      else await addQuestions([question])
      onDone(editing ? `Q${question.id} updated. Students see the new version.` : `Q${question.id} added. It is live for every student.`)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <section aria-labelledby="add-heading" className="rounded-xl border bg-card p-5 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <h2 id="add-heading" className="text-lg">
          {editing ? `Edit question #${editing.id}` : 'Add a question'}
        </h2>
        {editing && (
          <Button variant="ghost" className="h-10" onClick={onCancel}>
            Cancel edit
          </Button>
        )}
      </div>
      <form className="mt-4 grid gap-4" onSubmit={submit} noValidate>
        <div className="grid grid-cols-2 gap-2">
          <div className="grid gap-1">
            <label htmlFor="a-exam" className={labelCls}>
              Exam
            </label>
            <select id="a-exam" value={form.exam} onChange={(e) => set('exam', e.target.value as Exam)} className={fields}>
              <option>NEET</option>
              <option>JEE Mains</option>
            </select>
          </div>
          <div className="grid gap-1">
            <label htmlFor="a-type" className={labelCls}>
              Type
            </label>
            <select
              id="a-type"
              value={form.type}
              onChange={(e) => set('type', e.target.value as 'PYQ' | 'Practice')}
              className={fields}
            >
              <option>PYQ</option>
              <option>Practice</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="grid gap-1">
            <label htmlFor="a-subject" className={labelCls}>
              Subject
            </label>
            <select id="a-subject" value={form.subject} onChange={(e) => set('subject', e.target.value)} className={fields}>
              {(form.exam === 'NEET' ? ['Physics', 'Chemistry', 'Biology'] : ['Physics', 'Chemistry', 'Mathematics']).map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>
          <div className="grid gap-1">
            <label htmlFor="a-year" className={labelCls}>
              Year (PYQ only)
            </label>
            <input
              id="a-year"
              inputMode="numeric"
              value={form.year}
              onChange={(e) => set('year', e.target.value)}
              className={fields}
              placeholder="2023"
              aria-describedby="a-year-hint"
            />
          </div>
        </div>
        <p id="a-year-hint" className="text-xs text-muted-foreground">
          Leave the year blank for a practice question.
        </p>

        <div className="grid gap-1">
          <label htmlFor="a-chapter" className={labelCls}>
            Chapter
          </label>
          <input
            id="a-chapter"
            value={form.chapter}
            onChange={(e) => set('chapter', e.target.value)}
            className={fields}
            list="chapter-options"
            placeholder="e.g. Units and Measurements"
          />
          <datalist id="chapter-options">
            {[...new Set(CHAPTERS[form.subject] ?? [])].map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </div>

        <div className="grid gap-1">
          <label htmlFor="a-difficulty" className={labelCls}>
            Difficulty
          </label>
          <select
            id="a-difficulty"
            value={form.difficulty}
            onChange={(e) => set('difficulty', e.target.value as Difficulty)}
            className={fields}
          >
            <option>Easy</option>
            <option>Medium</option>
            <option>Hard</option>
          </select>
        </div>

        <div className="grid gap-1">
          <label htmlFor="a-qen" className={labelCls}>
            Question (English)
          </label>
          <textarea id="a-qen" value={form.qEn} onChange={(e) => set('qEn', e.target.value)} className={area} />
        </div>
        <div className="grid gap-1">
          <label htmlFor="a-qhi" className={labelCls}>
            Question (Hindi)
          </label>
          <textarea id="a-qhi" value={form.qHi} onChange={(e) => set('qHi', e.target.value)} className={area} lang="hi" />
        </div>

        <fieldset className="grid gap-2">
          <legend className={cn(labelCls, 'mb-1')}>Options — English, then Hindi</legend>
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="grid grid-cols-[auto_minmax(0,1fr)_minmax(0,1fr)] items-center gap-2">
              <span className="grid size-7 place-items-center rounded-md bg-muted font-label text-xs font-bold" aria-hidden="true">
                {['A', 'B', 'C', 'D'][i]}
              </span>
              <div>
                <label htmlFor={`a-oen-${i}`} className="sr-only">
                  Option {['A', 'B', 'C', 'D'][i]}, English
                </label>
                <input
                  id={`a-oen-${i}`}
                  value={form.oEn[i]}
                  onChange={(e) => set('oEn', form.oEn.map((o, j) => (j === i ? e.target.value : o)) as FormState['oEn'])}
                  className={fields}
                />
              </div>
              <div>
                <label htmlFor={`a-ohi-${i}`} className="sr-only">
                  Option {['A', 'B', 'C', 'D'][i]}, Hindi
                </label>
                <input
                  id={`a-ohi-${i}`}
                  value={form.oHi[i]}
                  onChange={(e) => set('oHi', form.oHi.map((o, j) => (j === i ? e.target.value : o)) as FormState['oHi'])}
                  className={fields}
                  lang="hi"
                  placeholder="Hindi (optional)"
                />
              </div>
            </div>
          ))}
        </fieldset>

        <div className="grid gap-1">
          <label htmlFor="a-correct" className={labelCls}>
            Correct option
          </label>
          <select id="a-correct" value={form.correct} onChange={(e) => set('correct', Number(e.target.value))} className={fields}>
            <option value={1}>A</option>
            <option value={2}>B</option>
            <option value={3}>C</option>
            <option value={4}>D</option>
          </select>
        </div>

        <div className="grid gap-1">
          <label htmlFor="a-sen" className={labelCls}>
            Solution (English)
          </label>
          <textarea id="a-sen" value={form.sEn} onChange={(e) => set('sEn', e.target.value)} className={area} />
        </div>
        <div className="grid gap-1">
          <label htmlFor="a-shi" className={labelCls}>
            Solution (Hindi)
          </label>
          <textarea id="a-shi" value={form.sHi} onChange={(e) => set('sHi', e.target.value)} className={area} lang="hi" />
        </div>

        <div className="grid gap-1">
          <label htmlFor="a-image" className={cn(labelCls, 'flex items-center gap-1.5')}>
            <ImagePlus className="size-3.5" aria-hidden="true" /> Question image link (optional)
          </label>
          <input
            id="a-image"
            value={form.image}
            onChange={(e) => set('image', e.target.value)}
            className={fields}
            placeholder="https://…"
            inputMode="url"
            aria-describedby="a-image-hint"
          />
          <p id="a-image-hint" className="text-xs text-muted-foreground">
            Paste a link to a public image. It shows under the question text for both languages.
          </p>
          {form.image.trim() && /^https?:\/\//i.test(form.image.trim()) && (
            <img
              src={form.image.trim()}
              alt="Preview of the question image"
              width={480}
              height={270}
              className="mt-2 max-h-40 w-auto rounded-lg border object-contain"
            />
          )}
        </div>

        {error && (
          <p role="alert" className="rounded-lg border border-destructive/50 bg-destructive-soft px-3 py-2 text-sm font-medium">
            {error}
          </p>
        )}
        <Button type="submit" className="h-12" disabled={busy || !questionsReady}>
          {busy ? 'Saving…' : editing ? 'Save changes' : 'Add question'}
        </Button>
      </form>
    </section>
  )
}

function CsvImport({ onSaved }: { onSaved: (msg: string) => void }) {
  const [text, setText] = useState('')
  const [report, setReport] = useState('')
  const [busy, setBusy] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  async function run() {
    setBusy(true)
    setReport('')
    try {
      const { rows, errors } = parseCsv(text, nextId())
      if (rows.length === 0) {
        setReport(errors[0] ?? 'No rows found. Paste a CSV with a header row first.')
        return
      }
      await addQuestions(rows)
      setText('')
      setReport(
        `${rows.length} question${rows.length === 1 ? '' : 's'} imported and live.${
          errors.length ? ` ${errors.length} row${errors.length === 1 ? '' : 's'} skipped: ${errors.slice(0, 3).join(' ')}` : ''
        }`,
      )
      onSaved(`${rows.length} questions imported from CSV.`)
    } catch (err) {
      setReport((err as Error).message)
    } finally {
      setBusy(false)
    }
  }

  function download() {
    const blob = new Blob([toCsvTemplate()], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'edumahi-questions-template.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <section aria-labelledby="csv-heading" className="rounded-xl border bg-card p-5">
      <h2 id="csv-heading" className="text-lg">
        Bulk upload
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        One question per row. Paste from a spreadsheet or choose a .csv file.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button variant="outline" className="h-11" onClick={download}>
          <Download className="size-4" aria-hidden="true" /> Template
        </Button>
        <Button variant="outline" className="h-11" onClick={() => fileRef.current?.click()}>
          <Upload className="size-4" aria-hidden="true" /> Choose file
        </Button>
        <input
          ref={fileRef}
          type="file"
          accept=".csv,text/csv"
          className="sr-only"
          aria-label="CSV file"
          onChange={async (e) => {
            const file = e.target.files?.[0]
            if (file) setText(await file.text())
          }}
        />
      </div>
      <div className="mt-3 grid gap-1">
        <label htmlFor="csv-body" className={labelCls}>
          CSV text
        </label>
        <textarea
          id="csv-body"
          value={text}
          onChange={(e) => setText(e.target.value)}
          className={cn(area, 'min-h-40 font-mono text-xs')}
          placeholder="exam,subject,chapter,type,year,question_en,…"
        />
      </div>
      {report && (
        <p role="status" className="mt-3 rounded-lg border bg-muted px-3 py-2 text-sm">
          {report}
        </p>
      )}
      <Button className="mt-3 h-12 w-full" onClick={run} disabled={busy || !text.trim() || !questionsReady}>
        {busy ? 'Importing…' : 'Import questions'}
      </Button>
    </section>
  )
}
