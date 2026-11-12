import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

/* A five-star control. Read-only stars announce the number; interactive ones
   are radio buttons under a fieldset so a keyboard can work them. */
export function Stars({
  value,
  onChange,
  size = 'md',
  label,
}: {
  value: number
  onChange?: (v: number) => void
  size?: 'sm' | 'md' | 'lg'
  label?: string
}) {
  const icon = size === 'lg' ? 'size-7' : size === 'sm' ? 'size-3.5' : 'size-5'

  if (!onChange) {
    return (
      <span className="inline-flex items-center gap-0.5" aria-label={`${value} out of 5 stars`} role="img">
        {[1, 2, 3, 4, 5].map((n) => (
          <Star
            key={n}
            className={cn(
              icon,
              n <= Math.round(value) ? 'fill-warning text-warning' : 'text-border',
            )}
            aria-hidden="true"
          />
        ))}
      </span>
    )
  }

  return (
    <fieldset>
      <legend className="mb-2 font-label text-xs font-semibold tracking-[0.08em] text-muted-foreground uppercase">
        {label ?? 'Your rating'}
      </legend>
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <label
            key={n}
            className="group grid size-11 cursor-pointer place-items-center rounded-md transition-transform hover:scale-110 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ring"
          >
            <input
              type="radio"
              name={label ?? 'rating'}
              value={n}
              checked={value === n}
              onChange={() => onChange(n)}
              className="sr-only"
            />
            <Star
              className={cn(
                icon,
                n <= value
                  ? 'fill-warning text-warning'
                  : 'text-border group-hover:text-warning/60',
              )}
              aria-hidden="true"
            />
            <span className="sr-only">{n} star{n > 1 ? 's' : ''}</span>
          </label>
        ))}
        <span className="ml-1 font-label text-sm font-semibold text-muted-foreground">
          {value > 0 ? `${value}.0` : '—'}
        </span>
      </div>
    </fieldset>
  )
}
