import { Link } from 'react-router'
import { Flag, Languages, ListChecks, Wallet } from 'lucide-react'
import { Meta } from '@/components/Meta'
import { Section } from '@/components/Primitives'
import { Button } from '@/components/ui/button'
import { stats } from '@/lib/analytics'

const PRINCIPLES = [
  {
    icon: Languages,
    title: 'Both languages, every question',
    body: 'The Hindi and English versions are written as a pair, not translated afterwards. Switch mid-question and your choice follows you to the next one.',
  },
  {
    icon: ListChecks,
    title: 'A solution, not just a key',
    body: 'Submit and the correct option turns green with the reasoning underneath — including why the option you picked is wrong.',
  },
  {
    icon: Wallet,
    title: 'No account, no payment',
    body: 'There is nothing to sign up for. Your progress and bookmarks stay in your browser.',
  },
  {
    icon: Flag,
    title: 'A wrong key is a bug',
    body: 'Use Report an issue under any solution and it lands in the admin report list with the question id.',
  },
]

export default function About() {
  const s = stats()
  return (
    <main className="mx-auto w-full max-w-content px-gutter py-10 sm:py-12">
      <Meta
        title="About EduMahi — NEET and JEE practice in Hindi and English"
        description="EduMahi is a free practice site for NEET and JEE Mains: previous year questions, extra practice, a solution on every answer, and a plain way to report a wrong key."
      />

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)] lg:items-start">
        <header>
          <h1 className="text-[clamp(2rem,5vw,3rem)] font-extrabold text-balance">
            Practice smart, crack NEET &amp; JEE.
          </h1>
          <p className="mt-4 max-w-xl text-muted-foreground">
            EduMahi is a free practice site for NEET and JEE Mains aspirants, most of whom work on a
            phone between classes. It exists because a previous year paper is worth nothing without
            the reasoning behind its answers.
          </p>
          <p className="mt-3 max-w-xl text-muted-foreground">
            Every question here carries a Hindi and an English version, four options, a single correct
            answer and a worked solution — in both languages — that opens the moment you submit.
          </p>
          <div className="mt-6 flex flex-wrap gap-2.5">
            <Button asChild className="h-12 px-5">
              <Link to="/neet">Start NEET PYQ</Link>
            </Button>
            <Button asChild variant="outline" className="h-12 px-5">
              <Link to="/feedback">Report a wrong key</Link>
            </Button>
          </div>
        </header>

        <dl className="grid grid-cols-2 gap-4 rounded-xl border bg-card p-5 shadow-raised sm:p-6">
          {[
            { label: 'Questions', value: s.total },
            { label: 'Chapters covered', value: s.chapters },
            { label: 'Previous year', value: s.pyq },
            { label: 'Extra practice', value: s.practice },
          ].map((item) => (
            <div key={item.label} className="rounded-lg bg-background p-4">
              <dt className="font-label text-[0.68rem] font-bold tracking-[0.12em] text-muted-foreground uppercase">
                {item.label}
              </dt>
              <dd className="mt-1 font-display text-3xl font-extrabold tabular-nums">{item.value}</dd>
            </div>
          ))}
        </dl>
      </div>

      <Section className="mt-12">
        <h2 className="text-[clamp(1.6rem,3.2vw,2.35rem)]">How the site is built</h2>
        <ul className="mt-6 grid gap-4 sm:grid-cols-2">
          {PRINCIPLES.map((p) => (
            <li key={p.title} className="rounded-xl border bg-background p-5">
              <p.icon className="size-5 text-primary" strokeWidth={1.75} aria-hidden="true" />
              <h3 className="mt-3 font-display text-base font-bold">{p.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{p.body}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section ground="raised" className="mt-10">
        <h2 className="text-2xl">Reporting a wrong answer key</h2>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Submit any question, then use Report an issue under the solution. Choose Wrong answer key,
          say in a line what you worked out, and it is stored against that question id — the admin
          page lists the flagged questions in order of how many reports they carry.
        </p>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          To suggest something about the site itself, the feedback page takes a rating and a message,
          with or without your name.
        </p>
        <Button asChild variant="outline" className="mt-5 h-11">
          <Link to="/feedback">Open the feedback page</Link>
        </Button>
      </Section>
    </main>
  )
}
