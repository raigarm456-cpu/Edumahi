import { createContext, useContext, useState, type ReactNode } from 'react'

/* The language toggle is one state for the whole visit: a question card, the
   quiz, the solution and the review all read the same value, so switching to
   Hindi once keeps every following question in Hindi. */
export type Lang = 'en' | 'hi'

const STORAGE_KEY = 'edumahi:lang'

export const LangContext = createContext<{ lang: Lang; setLang: (l: Lang) => void }>({
  lang: 'en',
  setLang: () => {},
})

function initialLang(): Lang {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'hi' ? 'hi' : 'en'
  } catch {
    return 'en'
  }
}

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(initialLang)
  const setLang = (next: Lang) => {
    setLangState(next)
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      /* a private window still works, it just forgets */
    }
    document.documentElement.lang = next === 'hi' ? 'hi' : 'en'
  }
  return <LangContext.Provider value={{ lang, setLang }}>{children}</LangContext.Provider>
}

export function useLang() {
  return useContext(LangContext)
}
