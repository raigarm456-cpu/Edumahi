import { cn } from '@/lib/utils'

/* The site's one imagery treatment: hairline diagrams of the subject itself —
   a sine wave, a bond structure, a cell, an orbital. They are drawn in the ink
   and brand tokens, so they repaint with the palette, and they take aria-hidden
   because the text beside them already names the thing. */

export type FigureKind = 'oscillation' | 'molecule' | 'cell' | 'orbital'

const STROKE = 1.6

export function ScienceFigure({
  kind,
  className,
  label,
}: {
  kind: FigureKind
  className?: string
  label?: string
}) {
  return (
    <svg
      viewBox="0 0 120 80"
      fill="none"
      strokeWidth={STROKE}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn('h-full w-full', className)}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      {kind === 'oscillation' && (
        <g className="stroke-current">
          <path d="M6 40h8" className="opacity-50" />
          <path d="M14 40c8-26 16-26 24 0s16 26 24 0 16-26 24 0" className="stroke-[var(--primary)]" />
          <path d="M6 40h108" className="opacity-30" strokeDasharray="3 5" />
          <circle cx="38" cy="14" r="2.6" className="fill-[var(--primary)] stroke-none" />
          <path d="M38 14v9" className="opacity-40" strokeDasharray="2 4" />
          <path d="M90 40v18h18" className="opacity-40" />
        </g>
      )}

      {kind === 'molecule' && (
        <g className="stroke-current">
          <path d="M30 54 60 26l30 28" className="stroke-[var(--primary)]" />
          <path d="M60 26v-12" className="opacity-50" />
          <circle cx="30" cy="54" r="8" className="fill-[var(--primary)]/12 stroke-[var(--primary)]" />
          <circle cx="90" cy="54" r="8" className="fill-[var(--primary)]/12 stroke-[var(--primary)]" />
          <circle cx="60" cy="26" r="6" className="opacity-60" />
          <circle cx="60" cy="14" r="4" className="fill-current stroke-none opacity-70" />
          <path d="M8 70h32M80 70h32" className="opacity-25" strokeDasharray="3 5" />
        </g>
      )}

      {kind === 'cell' && (
        <g className="stroke-current">
          <ellipse cx="60" cy="40" rx="46" ry="30" className="stroke-[var(--primary)]" />
          <ellipse cx="60" cy="40" rx="37" ry="23" className="opacity-25" strokeDasharray="4 5" />
          <circle cx="50" cy="38" r="9" className="fill-[var(--primary)]/12 stroke-[var(--primary)]" />
          <circle cx="50" cy="38" r="3.4" className="fill-[var(--primary)] stroke-none" />
          <ellipse cx="82" cy="34" rx="8" ry="4" className="opacity-60" transform="rotate(-24 82 34)" />
          <circle cx="72" cy="54" r="2.4" className="fill-current stroke-none opacity-60" />
          <circle cx="38" cy="56" r="1.8" className="fill-current stroke-none opacity-40" />
        </g>
      )}

      {kind === 'orbital' && (
        <g className="stroke-current">
          <circle cx="60" cy="40" r="4" className="fill-[var(--primary)] stroke-none" />
          <ellipse cx="60" cy="40" rx="46" ry="16" className="stroke-[var(--primary)]" transform="rotate(-20 60 40)" />
          <ellipse cx="60" cy="40" rx="46" ry="16" className="stroke-[var(--primary)] opacity-70" transform="rotate(40 60 40)" />
          <ellipse cx="60" cy="40" rx="30" ry="11" className="opacity-45" transform="rotate(100 60 40)" />
          <circle cx="97" cy="24" r="2.6" className="fill-current stroke-none opacity-70" />
        </g>
      )}
    </svg>
  )
}
