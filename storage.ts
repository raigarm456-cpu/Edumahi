/* Browser storage, all of it. There is no server yet: progress, bookmarks,
   saved questions and feedback live in the visitor's own browser, and a
   backend (Firebase/Supabase) would replace the bodies of these helpers
   without any component changing. */
import { useCallback, useEffect, useState } from 'react'

const PREFIX = 'edumahi:'

export function readStore<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(PREFIX + key)
    if (raw === null) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

export function writeStore(key: string, value: unknown) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value))
  } catch {
    /* Private mode or a full quota: the page still works, it just forgets. */
  }
}

export function removeStore(key: string) {
  try {
    localStorage.removeItem(PREFIX + key)
  } catch {
    /* ignore */
  }
}

/* A piece of state that survives a reload. The initialiser runs once, lazily,
   so the first paint is never blocked by a JSON parse. */
export function useStored<T>(key: string, fallback: T) {
  const [value, setValue] = useState<T>(() => readStore(key, fallback))
  useEffect(() => {
    writeStore(key, value)
  }, [key, value])
  const update = useCallback((next: T | ((prev: T) => T)) => {
    setValue((prev) => (typeof next === 'function' ? (next as (p: T) => T)(prev) : next))
  }, [])
  return [value, update] as const
}

export function todayKey() {
  return new Date().toISOString().slice(0, 10)
}
