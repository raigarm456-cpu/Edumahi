import { Link } from 'react-router'
import { Meta } from '@/components/Meta'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <main className="mx-auto flex w-full max-w-content flex-col items-start px-gutter py-20">
      <Meta title="Page not found — EduMahi" description="That page does not exist on EduMahi." />
      <p className="font-label text-xs font-bold tracking-[0.12em] text-muted-foreground uppercase">
        404
      </p>
      <h1 className="mt-3 text-[clamp(2rem,5vw,3rem)] font-extrabold text-balance">
        This question is not in the paper.
      </h1>
      <p className="mt-3 max-w-md text-muted-foreground">
        The page you asked for does not exist. The question bank does — start from a subject and
        you will land on a real one.
      </p>
      <div className="mt-6 flex flex-wrap gap-2.5">
        <Button asChild className="h-12 px-5">
          <Link to="/neet">Start NEET PYQ</Link>
        </Button>
        <Button asChild variant="outline" className="h-12 px-5">
          <Link to="/">Go home</Link>
        </Button>
      </div>
    </main>
  )
}
