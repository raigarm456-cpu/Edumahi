/* Aggregate views the pages read: the footer figures, the home review slider
   and the admin summary. Kept apart from the mutating helpers so a page imports
   the shape it needs and nothing else. */
import { allFeedback, averageRating, ratingBreakdown, websiteReviews } from '@/lib/feedback'
import type { Feedback } from '@/lib/feedback'
import { allQuestions } from '@/lib/questions'
import { attempts } from '@/lib/progress'

/* Every figure on the home page is counted from the bank itself, so the site
   can never claim a number it does not have. */
export function stats() {
  const list = allQuestions()
  return {
    total: list.length,
    subjects: new Set(list.map((q) => `${q.exam}|${q.subject}`)).size,
    exams: new Set(list.map((q) => q.exam)).size,
    chapters: new Set(list.map((q) => `${q.exam}|${q.subject}|${q.chapter}`)).size,
    pyq: list.filter((q) => q.type === 'PYQ').length,
    practice: list.filter((q) => q.type === 'Practice').length,
    years: [...new Set(list.filter((q) => q.year).map((q) => q.year as number))].sort(),
  }
}

export function ratingSummary() {
  const reviews = websiteReviews()
  return {
    count: reviews.length,
    average: averageRating(reviews),
    breakdown: ratingBreakdown(reviews),
  }
}

/* Public reviews — named or anonymous — with a sort and a page. */
export function publicReviews({
  sort,
  page,
  perPage = 5,
}: {
  sort: 'helpful' | 'latest'
  page: number
  perPage?: number
}) {
  const list = [...websiteReviews()].sort((a, b) =>
    sort === 'latest' ? b.createdAt.localeCompare(a.createdAt) : b.rating - a.rating || b.createdAt.localeCompare(a.createdAt),
  )
  const pages = Math.max(1, Math.ceil(list.length / perPage))
  const safePage = Math.min(Math.max(1, page), pages)
  return {
    items: list.slice((safePage - 1) * perPage, safePage * perPage),
    page: safePage,
    pages,
    total: list.length,
  }
}

export function adminSummary() {
  const all = allFeedback()
  const reviews = websiteReviews()
  const pending = all.filter((f) => f.status === 'pending' && f.message.trim().length > 0)
  const reports = all.filter((f) => f.type === 'question' && f.message)
  const byQuestion = new Map<number, number>()
  for (const r of reports) {
    if (r.questionId !== null) byQuestion.set(r.questionId, (byQuestion.get(r.questionId) ?? 0) + 1)
  }
  const flagged = [...byQuestion.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([id, count]) => ({ id, count }))
  return {
    average: averageRating(reviews),
    reviews: reviews.length,
    total: all.length,
    pending: pending.length,
    reports: reports.length,
    attempts: attempts().length,
    flagged,
  }
}

export function exportFeedbackCsv(rows: Feedback[]) {
  const head = [
    'id',
    'type',
    'questionId',
    'rating',
    'category',
    'message',
    'name',
    'email',
    'helpful',
    'status',
    'reply',
    'createdAt',
  ]
  const escape = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`
  return [head.join(','), ...rows.map((r) => head.map((h) => escape(r[h as keyof Feedback])).join(','))].join('\n')
}
