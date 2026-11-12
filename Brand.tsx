import { cn } from '@/lib/utils'

/* The EduMahi mark: an E drawn as a spine plus three bars on the brand
   gradient, in a rounded square. It is the same shape at every size — the
   favicon is the bar motif alone. */
export function BrandMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'brand-surface grid size-9 shrink-0 place-items-center rounded-[0.7rem] shadow-[0_4px_14px_-4px_var(--primary)]',
        className,
      )}
      aria-hidden="true"
    >
      <svg viewBox="0 0 24 24" className="size-[60%]" fill="none">
        <rect x="4" y="4" width="6.4" height="16" rx="1.6" fill="currentColor" className="text-primary-foreground" />
        <rect x="12.4" y="4" width="7.6" height="4.2" rx="1.6" fill="currentColor" className="text-primary-foreground" />
        <rect x="12.4" y="9.9" width="5.6" height="4.2" rx="1.6" fill="currentColor" className="text-primary-foreground" />
        <rect x="12.4" y="15.8" width="7.6" height="4.2" rx="1.6" fill="currentColor" className="text-primary-foreground" />
      </svg>
    </span>
  )
}

/* Wordmark + tagline. The name is set tight and heavy; the tagline only
   appears where there is room for it to be read. */
export function Brand({
  className,
  showTagline = false,
  size = 'md',
}: {
  className?: string
  showTagline?: boolean
  size?: 'sm' | 'md' | 'lg'
}) {
  const mark = size === 'lg' ? 'size-12' : size === 'sm' ? 'size-8' : 'size-9'
  const word = size === 'lg' ? 'text-2xl' : size === 'sm' ? 'text-lg' : 'text-[1.35rem]'
  return (
    <span className={cn('flex items-center gap-2.5', className)}>
      <BrandMark className={mark} />
      <span className="flex flex-col leading-none">
        <span className={cn('font-display font-extrabold tracking-[-0.03em]', word)}>EduMahi</span>
        {showTagline && (
          <span className="mt-1 font-label text-[0.7rem] font-medium tracking-[0.02em] text-muted-foreground">
            Practice Smart, Crack NEET &amp; JEE
          </span>
        )}
      </span>
    </span>
  )
}
