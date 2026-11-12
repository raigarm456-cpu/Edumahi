/* The bank the whole site reads: the built-in questions plus every question the
 * owner has added to the shared database. One store (a module-level cache) and
 * one hook, so the hero, the exam pages, the builder and the quiz all see the
 * same list and a question added on /admin appears everywhere at once. */
import { useEffect, useState } from 'react'
import { questions as seed, type Difficulty, type Exam, type Question, type QuestionType } from '@/data/questions'
import {
  deleteStoredQuestion,
  fetchStoredQuestions,
  insertStoredQuestions,
  noteHighestId,
  questionsReady,
  updateStoredQuestion,
  type StoredQuestion,
} from '@/lib/supabase'

export { questionsReady }

export type { Exam, Question }

export const SEED_MAX_ID = Math.max(...seed.map((q) => q.id), 0)

let stored: Question[] = []
let status: 'loading' | 'ready' | 'offline' | 'unconfigured' = 'loading'
let started = false
const listeners = new Set<() => void>()

function emit() {
  listeners.forEach((fn) => fn())
}

export function rowToQuestion(r: StoredQuestion): Question {
  return {
    id: Number(r.id),
    exam: (r.exam === 'JEE Mains' ? 'JEE Mains' : 'NEET') as Exam,
    subject: r.subject,
    chapter: r.chapter || 'Unclassified',
    year: r.year ?? null,
    shift: r.shift ?? null,
    type: (r.type === 'PYQ' ? 'PYQ' : 'Practice') as QuestionType,
    difficulty: (['Easy', 'Medium', 'Hard'] as const).includes(r.difficulty as Difficulty)
      ? (r.difficulty as Difficulty)
      : 'Medium',
    question: { en: r.question_en, hi: r.question_hi || r.question_en },
    options: {
      en: r.options_en ?? [],
      hi: r.options_hi?.length ? r.options_hi : (r.options_en ?? []),
    },
    correctAnswer: r.answer,
    ...(r.image_url ? { image: r.image_url } : {}),
    solution: { en: r.solution_en, hi: r.solution_hi || r.solution_en },
  }
}

export function questionToRow(q: Question): StoredQuestion {
  return {
    id: q.id,
    exam: q.exam,
    subject: q.subject,
    chapter: q.chapter,
    year: q.year,
    shift: q.shift ?? null,
    type: q.type,
    difficulty: q.difficulty,
    question_en: q.question.en,
    question_hi: q.question.hi,
    options_en: q.options.en,
    options_hi: q.options.hi,
    image_url: q.image ?? null,
    answer: q.correctAnswer,
    solution_en: q.solution.en,
    solution_hi: q.solution.hi,
  }
}

export async function loadQuestions() {
  if (!questionsReady) {
    status = 'unconfigured'
    emit()
    return
  }
  if (started) return
  started = true
  try {
    const rows = await fetchStoredQuestions()
    stored = rows.map(rowToQuestion)
    noteHighestId(stored.map((q) => q.id))
    status = 'ready'
  } catch {
    status = 'offline'
  }
  emit()
}

export function reloadQuestions() {
  started = false
  return loadQuestions()
}

/* Built-in bank first; a stored question with a matching id replaces it. */
export function allQuestions(): Question[] {
  if (stored.length === 0) return seed
  const byId = new Map<number, Question>()
  for (const q of seed) byId.set(q.id, q)
  for (const q of stored) byId.set(q.id, q)
  return [...byId.values()]
}

export function hasStored(id: number) {
  return stored.some((q) => q.id === id)
}

export function questionsStatus() {
  return status
}

/* Writes go to the database first, then into the cache, so every page repaints
   only once the database has accepted the change. */
export async function addQuestions(questions: Question[]) {
  await insertStoredQuestions(questions.map(questionToRow))
  stored = [...questions, ...stored.filter((s) => !questions.some((q) => q.id === s.id))]
  noteHighestId(stored.map((q) => q.id))
  status = 'ready'
  emit()
}

/* An edit is a different function from an add, so an edited question can never
   become a new row. */
export async function editQuestion(question: Question) {
  await updateStoredQuestion(questionToRow(question))
  stored = [question, ...stored.filter((s) => s.id !== question.id)]
  status = 'ready'
  emit()
}

export async function removeQuestion(id: number) {
  await deleteStoredQuestion(id)
  stored = stored.filter((s) => s.id !== id)
  emit()
}

export function nextId(): number {
  return Math.max(SEED_MAX_ID, ...stored.map((q) => q.id), 0) + 1
}

/* One hook for every page. It kicks off the fetch on first mount and reruns the
   component whenever the cache changes. */
export function useQuestionBank() {
  const [, bump] = useState(0)
  useEffect(() => {
    const fn = () => bump((n) => n + 1)
    listeners.add(fn)
    void loadQuestions()
    return () => {
      listeners.delete(fn)
    }
  }, [])
  return { questions: allQuestions(), status, questionsReady }
}
