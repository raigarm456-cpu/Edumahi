import { Link } from 'react-router'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

/* Small shared pieces that carry the site's character: a section wrapper on
   the page's spine, a label, a heading with an optional aside, and the bar the
   analytics are drawn with. */

export function Section({
  children,
  className,
  id,
  ground = 'page',
}: {
  children: ReactNode
  className?: string
  id?: string
  ground?: 'page' | 'raised'
}) {
  return (
    <section
      id={id}
      className={cn(
        'py-section',
        ground === 'raised' && 'border-y border-border bg-muted/60',
        className,
      )}
    >
      <div className="mx-auto w-full max-w-content px-gutter">{children}</div>
    </section>
  )
}

export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p
      className={cn(
        'font-label text-xs font-bold tracking-[0.14em] text-muted-foreground uppercase',
        className,
      )}
    >
      {children}
    </p>
  )
}

export function SectionHead({
  id,
  title,
  intro,
  action,
  className,
}: {
  id?: string
  title: ReactNode
  intro?: ReactNode
  action?: ReactNode
  className?: string
}) {
  return (
    <div className={cn('mb-8 flex flex-wrap items-end justify-between gap-x-8 gap-y-4', className)}>
      <div className="max-w-2xl">
        <h2 id={id} className="text-[clamp(1.6rem,3.2vw,2.35rem)]">
          {title}
        </h2>
        {intro && <p className="mt-2 max-w-xl text-[0.98rem] text-muted-foreground">{intro}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}

/* A thin progress bar used for accuracy and coverage. The value is printed
   beside it, so colour is never the only signal. */
export function Bar({
  value,
  tone = 'brand',
  label,
  className,
}: {
  value: number
  tone?: 'brand' | 'success' | 'warning'
  label: string
  className?: string
}) {
  return (
    <div
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
      className={cn('h-2 w-full overflow-hidden rounded-full bg-border/80', className)}
    >
      <div
        className={cn(
          'h-full rounded-full transition-[width] duration-500',
          tone === 'brand' && 'brand-surface',
          tone === 'success' && 'bg-success',
          tone === 'warning' && 'bg-warning',
        )}
        style={{ width: `${Math.max(2, Math.min(100, value))}%` }}
      />
    </div>
  )
}

export function TextLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link
      to={to}
      className="inline-flex items-center gap-1 font-label text-sm font-semibold text-accent-foreground underline-offset-4 hover:underline"
    >
      {children}
    </Link>
  )
}
