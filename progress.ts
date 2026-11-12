/* The learner's own history: attempts completed, per-subject accuracy and
   the questions they saved for revision. */
import { readStore, writeStore, todayKey } from '@/lib/storage'

export type Attempt = {
  id: string
  exam: string
  subject: string
  total: number
  correct: number
  wrong: number
  unattempted: number
  seconds: number
  date: string
}

const ATTEMPTS = 'attempts'

export function attempts(): Attempt[] {
  return readStore<Attempt[]>(ATTEMPTS, [])
}

export function recordAttempt(a: Omit<Attempt, 'id' | 'date'>) {
  const list = attempts()
  writeStore(ATTEMPTS, [
    { ...a, id: `${Date.now()}`, date: todayKey() },
    ...list,
  ].slice(0, 40))
}

export function subjectAccuracy(list = attempts().slice(0, 20)) {
  const by = new Map<string, { correct: number; total: number }>()
  for (const a of list) {
    const row = by.get(a.subject) ?? { correct: 0, total: 0 }
    row.correct += a.correct
    row.total += a.correct + a.wrong
    by.set(a.subject, row)
  }
  return [...by.entries()]
    .map(([subject, r]) => ({
      subject,
      accuracy: r.total ? Math.round((r.correct / r.total) * 100) : 0,
      answered: r.total,
    }))
    .sort((a, b) => b.accuracy - a.accuracy)
}

export function streakDays(): number {
  const dates = new Set(attempts().map((a) => a.date))
  let streak = 0
  const cursor = new Date()
  for (;;) {
    const key = cursor.toISOString().slice(0, 10)
    if (!dates.has(key)) break
    streak += 1
    cursor.setDate(cursor.getDate() - 1)
  }
  return streak
}

/* Bookmarks are a set of question ids, stored as an array for JSON. */
export function bookmarks(): number[] {
  return readStore<number[]>('bookmarks', [])
}

export function toggleBookmark(id: number): number[] {
  const list = bookmarks()
  const next = list.includes(id) ? list.filter((b) => b !== id) : [id, ...list]
  writeStore('bookmarks', next)
  return next
}
