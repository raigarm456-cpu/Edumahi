/* Everything a visitor can leave behind: website reviews, per-question
   signals and quiz ratings. One store, because one admin table reads it.

   There is no server yet. These helpers are the seam: swap their bodies for
   fetch() calls to Firebase or Supabase and nothing else in the site changes. */
import { readStore, writeStore, todayKey } from '@/lib/storage'

export type FeedbackType = 'website' | 'question' | 'quiz'
export type FeedbackStatus = 'pending' | 'resolved'

export type Feedback = {
  id: number
  type: FeedbackType
  questionId: number | null
  rating: number
  category: string
  message: string
  name: string
  email: string
  helpful: boolean | null
  status: FeedbackStatus
  reply: string
  createdAt: string
}

const KEY = 'feedback'

export function allFeedback(): Feedback[] {
  return readStore<Feedback[]>(KEY, [])
}

export function addFeedback(entry: Omit<Feedback, 'id' | 'status' | 'reply' | 'createdAt'>) {
  const list = allFeedback()
  const id = list.reduce((max, f) => Math.max(max, f.id), 0) + 1
  const record: Feedback = {
    ...entry,
    id,
    status: 'pending',
    reply: '',
    createdAt: new Date().toISOString(),
  }
  writeStore(KEY, [record, ...list])
  return record
}

export function updateFeedback(id: number, patch: Partial<Feedback>) {
  writeStore(
    KEY,
    allFeedback().map((f) => (f.id === id ? { ...f, ...patch } : f)),
  )
}

export function deleteFeedback(id: number) {
  writeStore(
    KEY,
    allFeedback().filter((f) => f.id !== id),
  )
}

/* One website review per browser per day, and a message too short to be
   useful is refused before it is stored. */
export function canReviewToday(): boolean {
  const last = readStore<{ date: string; review: Feedback | null }>('review-today', {
    date: '',
    review: null,
  })
  return last.date !== todayKey()
}

export function rememberReview(review: Feedback) {
  writeStore('review-today', { date: todayKey(), review })
}

export function lastReviewToday(): Feedback | null {
  const last = readStore<{ date: string; review: Feedback | null }>('review-today', {
    date: '',
    review: null,
  })
  return last.date === todayKey() ? last.review : null
}

export const CATEGORIES = [
  'Suggestion',
  'Bug Report',
  'Question Error',
  'Feature Request',
  'Appreciation',
] as const

export const REPORT_REASONS = [
  'Wrong answer key',
  'Wrong translation (Hindi)',
  'Wrong translation (English)',
  'Typo',
  'Unclear solution',
  'Other',
] as const

/* Signals a question has collected, used to flag the ones that need a look. */
export type QuestionSignal = {
  helpfulYes: number
  helpfulNo: number
  ratingSum: number
  ratingCount: number
  reports: number
}

export type QuestionSignals = Record<string, QuestionSignal>

export function questionSignals(): QuestionSignals {
  const signals: QuestionSignals = {}
  for (const f of allFeedback()) {
    if (f.type !== 'question' || f.questionId === null) continue
    const key = String(f.questionId)
    const s = (signals[key] ??= {
      helpfulYes: 0,
      helpfulNo: 0,
      ratingSum: 0,
      ratingCount: 0,
      reports: 0,
    })
    if (f.helpful === true) s.helpfulYes += 1
    if (f.helpful === false) s.helpfulNo += 1
    if (f.rating > 0) {
      s.ratingSum += f.rating
      s.ratingCount += 1
    }
    if (f.category.startsWith('Wrong') || f.category === 'Typo' || f.category === 'Other') {
      s.reports += 1
    }
  }
  return signals
}

export function signalFor(signals: QuestionSignals, questionId: number): QuestionSignal {
  return (
    signals[String(questionId)] ?? {
      helpfulYes: 0,
      helpfulNo: 0,
      ratingSum: 0,
      ratingCount: 0,
      reports: 0,
    }
  )
}

/* Average website rating from the people who left one. */
export function websiteReviews(): Feedback[] {
  return allFeedback().filter((f) => f.type === 'website' && f.rating > 0)
}

export function averageRating(list: Feedback[]): number {
  if (list.length === 0) return 0
  return list.reduce((sum, f) => sum + f.rating, 0) / list.length
}

export function ratingBreakdown(list: Feedback[]): { stars: number; count: number; pct: number }[] {
  return [5, 4, 3, 2, 1].map((stars) => {
    const count = list.filter((f) => f.rating === stars).length
    return { stars, count, pct: list.length ? Math.round((count / list.length) * 100) : 0 }
  })
}

export function toCsv(rows: Feedback[]): string {
  const head = ['id', 'type', 'questionId', 'rating', 'category', 'message', 'name', 'email', 'status', 'createdAt']
  const escape = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`
  return [head.join(','), ...rows.map((r) => head.map((h) => escape(r[h as keyof Feedback])).join(','))].join('\n')
}
