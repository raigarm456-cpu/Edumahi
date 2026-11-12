import { useEffect, useState, type ReactNode } from 'react'
import { Link, NavLink, useLocation } from 'react-router'
import { BookOpen, Languages, Menu, MessageSquarePlus, Moon, Sun } from 'lucide-react'
import { Brand } from '@/components/Brand'
import { DeviceProfile } from '@/components/DeviceProfile'
import { QuickFeedback } from '@/components/QuickFeedback'
import { useLang } from '@/components/lang'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { cn } from '@/lib/utils'

export const NAV = [
  { to: '/', label: 'Home', hi: 'होम' },
  { to: '/neet', label: 'NEET', hi: 'नीट' },
  { to: '/jee', label: 'JEE Mains', hi: 'जेईई' },
  { to: '/practice', label: 'Practice', hi: 'अभ्यास' },
  { to: '/feedback', label: 'Feedback', hi: 'प्रतिक्रिया' },
  { to: '/about', label: 'About', hi: 'परिचय' },
]

/* One theme state for the document: the class on <html> is what theme.css
   reads for the dark scheme, and it is remembered across visits. */
function useTheme() {
  const [dark, setDark] = useState(() => {
    try {
      return localStorage.getItem('edumahi:theme') === 'dark'
    } catch {
      return false
    }
  })
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    try {
      localStorage.setItem('edumahi:theme', dark ? 'dark' : 'light')
    } catch {
      /* ignore */
    }
  }, [dark])
  return [dark, setDark] as const
}

/* The site's shell: sticky top bar with the mark, the six sections, a language
   toggle and the theme switch; the floating feedback button; the footer. Pages
   own their own `main`. */
export function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <div className="flex-1">{children}</div>
      <SiteFooter />
      {/* Clear of the content: a compact disc at the very corner, with room
          reserved under the page so it never covers the last line. */}
      <div className="h-16 sm:h-0" aria-hidden="true" />
      <FeedbackFab />
    </div>
  )
}

export function SiteHeader() {
  const [dark, setDark] = useTheme()
  const [open, setOpen] = useState(false)
  const { lang, setLang } = useLang()
  const location = useLocation()

  // A route change closes the sheet, or it would sit over the new page.
  useEffect(() => {
    setOpen(false)
  }, [location.pathname])

  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-content items-center gap-3 px-gutter">
        <Link to="/" className="rounded-md" aria-label="EduMahi home">
          <Brand />
        </Link>

        <nav aria-label="Main" className="ml-auto hidden lg:block">
          <ul className="flex items-center gap-1">
            {NAV.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) =>
                    cn(
                      'inline-flex h-9 items-center rounded-md px-3 font-label text-sm font-semibold transition-colors',
                      isActive
                        ? 'bg-accent text-accent-foreground'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                    )
                  }
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="ml-auto flex items-center gap-1 lg:ml-2">
          <DeviceProfile />
          <button
            type="button"
            onClick={() => setLang(lang === 'en' ? 'hi' : 'en')}
            className="inline-flex h-9 items-center gap-1.5 rounded-md px-2 font-label text-sm font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label={lang === 'en' ? 'Switch questions to Hindi' : 'Switch questions to English'}
          >
            <Languages className="size-4" aria-hidden="true" />
            <span className="tabular-nums">{lang === 'en' ? 'EN' : 'हिं'}</span>
          </button>
          <button
            type="button"
            onClick={() => setDark(!dark)}
            className="grid size-9 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
            aria-pressed={dark}
          >
            {dark ? <Sun className="size-4" aria-hidden="true" /> : <Moon className="size-4" aria-hidden="true" />}
          </button>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <button
                type="button"
                className="grid size-10 place-items-center rounded-md text-foreground transition-colors hover:bg-muted lg:hidden"
                aria-label="Open menu"
              >
                <Menu className="size-5" aria-hidden="true" />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[84%] max-w-xs px-0">
              <SheetTitle className="sr-only">Menu</SheetTitle>
              <div className="border-b px-5 py-5">
                <Brand showTagline />
              </div>
              <nav aria-label="Main" className="px-3 py-2">
                <ul className="flex flex-col">
                  {NAV.map((item) => (
                    <li key={item.to}>
                      <NavLink
                        to={item.to}
                        end={item.to === '/'}
                        onClick={() => setOpen(false)}
                        className={({ isActive }) =>
                          cn(
                            'flex min-h-12 items-center justify-between rounded-md px-3 font-label text-base font-semibold',
                            isActive ? 'bg-accent text-accent-foreground' : 'text-foreground',
                          )
                        }
                      >
                        {item.label}
                        <span className="text-sm font-normal text-muted-foreground">{item.hi}</span>
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </nav>
              <div className="mt-auto flex flex-col gap-2 border-t px-5 py-4">
                <Button asChild size="lg" className="h-11">
                  <Link to="/practice">Start a practice set</Link>
                </Button>
                <p className="text-center font-label text-xs text-muted-foreground">
                  Practice Smart, Crack NEET &amp; JEE
                </p>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-muted/50">
      <div className="mx-auto grid w-full max-w-content gap-8 px-gutter py-12 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <Brand showTagline />
          <p className="mt-4 max-w-xs text-sm text-muted-foreground">
            Free previous-year and extra practice questions for NEET and JEE Mains, in Hindi and
            English, with a worked solution on every question.
          </p>
        </div>
        <nav aria-label="Practise">
          <h2 className="font-label text-xs font-bold tracking-[0.1em] text-foreground uppercase">
            Practise
          </h2>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li><Link className="hover:text-foreground" to="/neet">NEET previous year questions</Link></li>
            <li><Link className="hover:text-foreground" to="/jee">JEE Mains previous year questions</Link></li>
            <li><Link className="hover:text-foreground" to="/practice">Practice Zone</Link></li>
            <li><Link className="hover:text-foreground" to="/practice#progress">Your progress</Link></li>
          </ul>
        </nav>
        <nav aria-label="EduMahi">
          <h2 className="font-label text-xs font-bold tracking-[0.1em] text-foreground uppercase">
            EduMahi
          </h2>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li><Link className="hover:text-foreground" to="/about">About and answer-key reports</Link></li>
            <li><Link className="hover:text-foreground" to="/admin">Add a question (owner)</Link></li>
            <li><Link className="hover:text-foreground" to="/feedback">Leave feedback</Link></li>
            <li><Link className="hover:text-foreground" to="/admin">Owner sign-in</Link></li>
          </ul>
        </nav>
      </div>
      <div className="border-t border-border/70">
        <div className="mx-auto flex w-full max-w-content flex-col gap-1 px-gutter py-5 font-label text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© EduMahi. Questions are solved free, for every aspirant.</p>
          <p className="flex items-center gap-1.5">
            <BookOpen className="size-3.5" aria-hidden="true" />
            Your progress is saved in this browser.
          </p>
        </div>
      </div>
    </footer>
  )
}

/* The floating feedback button: on every route, bottom right, opening the
   quick-feedback dialog. */
export function FeedbackFab() {
  return (
    <QuickFeedback>
      <button
        type="button"
        className="fixed right-3 bottom-3 z-30 inline-flex size-11 items-center justify-center gap-2 rounded-full border border-primary-foreground/25 bg-primary font-label text-sm font-semibold text-primary-foreground shadow-lifted transition-transform hover:scale-[1.03] active:scale-100 sm:right-4 sm:bottom-4 sm:h-11 sm:w-auto sm:px-4"
      >
        <MessageSquarePlus className="size-4" aria-hidden="true" />
        <span className="sr-only sm:not-sr-only">Feedback</span>
      </button>
    </QuickFeedback>
  )
}
