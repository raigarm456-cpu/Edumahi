/* Bulk upload, as CSV. The owner may paste a sheet or a file; both arrive as one
 * string. Columns are matched by header name, so the column order does not
 * matter, and a row that fails a check is reported rather than half-saved.
 *
 * Hindi columns are optional and fall back to the English text, because a
 * translation that is missing is better than a blank option. */
import type { Difficulty, Exam, Question } from '@/data/questions'

const COLUMNS = [
  'exam',
  'subject',
  'chapter',
  'type',
  'year',
  'difficulty',
  'question_en',
  'question_hi',
  'option_a_en',
  'option_b_en',
  'option_c_en',
  'option_d_en',
  'option_a_hi',
  'option_b_hi',
  'option_c_hi',
  'option_d_hi',
  'correct',
  'solution_en',
  'solution_hi',
  'image_url',
] as const

export function toCsvTemplate(): string {
  const header = COLUMNS.join(',')
  const example = [
    'NEET',
    'Physics',
    'Units and Measurements',
    'PYQ',
    '2023',
    'Easy',
    '"The dimensional formula of energy is"',
    '"ऊर्जा का विमीय सूत्र है"',
    '[MLT^-2]',
    '[ML^2T^-2]',
    '[MLT^-1]',
    '[ML^2T^-1]',
    '',
    '',
    '',
    '',
    'B',
    '"Energy is force × distance, so ML^2T^-2."',
    '"ऊर्जा = बल × दूरी, इसलिए ML^2T^-2।"',
    '',
  ].join(',')
  return `${header}\r\n${example}\r\n`
}

/* A small RFC-4180 reader: quotes, doubled quotes and commas or newlines
   inside quotes. Enough for a spreadsheet export, and no dependency. */
function parseRows(input: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let quoted = false
  const text = input.replace(/^\uFEFF/, '')

  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    if (quoted) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"'
          i++
        } else quoted = false
      } else field += ch
      continue
    }
    if (ch === '"') quoted = true
    else if (ch === ',') {
      row.push(field)
      field = ''
    } else if (ch === '\n') {
      row.push(field)
      rows.push(row)
      row = []
      field = ''
    } else if (ch !== '\r') field += ch
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field)
    rows.push(row)
  }
  return rows.filter((r) => r.some((c) => c.trim() !== ''))
}

const LETTERS = ['A', 'B', 'C', 'D']

export function parseCsv(text: string, firstId: number): { rows: Question[]; errors: string[] } {
  const raw = parseRows(text)
  if (raw.length === 0) return { rows: [], errors: ['Paste a CSV with a header row first.'] }

  const header = raw[0].map((h) => h.trim().toLowerCase().replace(/\s+/g, '_'))
  const at = (cells: string[], name: string) => {
    const i = header.indexOf(name)
    return i === -1 ? '' : (cells[i] ?? '').trim()
  }
  if (!header.includes('question_en')) {
    return { rows: [], errors: ['The header row needs a question_en column. Use the template.'] }
  }

  const rows: Question[] = []
  const errors: string[] = []

  raw.slice(1).forEach((cells, n) => {
    const line = n + 2
    const examRaw = at(cells, 'exam').toLowerCase()
    const exam: Exam = examRaw.startsWith('jee') ? 'JEE Mains' : examRaw.startsWith('neet') ? 'NEET' : 'NEET'
    const typeRaw = at(cells, 'type').toLowerCase()
    const type = typeRaw.startsWith('p') && !typeRaw.startsWith('py') ? 'Practice' : 'PYQ'
    const difficultyRaw = at(cells, 'difficulty').toLowerCase()
    const difficulty: Difficulty =
      difficultyRaw.startsWith('e') ? 'Easy' : difficultyRaw.startsWith('h') ? 'Hard' : 'Medium'
    const qEn = at(cells, 'question_en')
    const oEn = LETTERS.map((l) => at(cells, `option_${l.toLowerCase()}_en`))
    const oHiRaw = LETTERS.map((l) => at(cells, `option_${l.toLowerCase()}_hi`))
    const correctRaw = at(cells, 'correct').toUpperCase()
    const correct = LETTERS.indexOf(correctRaw)

    if (!qEn) return errors.push(`Row ${line}: no question_en.`)
    if (oEn.some((o) => !o)) return errors.push(`Row ${line}: one of the four English options is empty.`)
    if (correct === -1) return errors.push(`Row ${line}: correct must be A, B, C or D.`)
    if (!at(cells, 'solution_en')) return errors.push(`Row ${line}: solution_en is required.`)
    const yearText = at(cells, 'year')
    if (yearText && !/^\d{4}$/.test(yearText)) return errors.push(`Row ${line}: year must be four digits.`)
    const image = at(cells, 'image_url')
    if (image && !/^https?:\/\//i.test(image)) return errors.push(`Row ${line}: image_url must start with http.`)

    const qHi = at(cells, 'question_hi')
    const sEn = at(cells, 'solution_en')
    const sHi = at(cells, 'solution_hi')

    rows.push({
      id: firstId + rows.length,
      exam,
      subject: at(cells, 'subject') || (exam === 'NEET' ? 'Physics' : 'Physics'),
      chapter: at(cells, 'chapter') || 'Unclassified',
      year: type === 'PYQ' && yearText ? Number(yearText) : null,
      shift: null,
      type,
      difficulty,
      question: { en: qEn, hi: qHi || qEn },
      options: { en: oEn, hi: oHiRaw.map((o, i) => o || oEn[i]) },
      correctAnswer: correct,
      ...(image ? { image } : {}),
      solution: { en: sEn, hi: sHi || sEn },
    })
  })

  return { rows, errors }
}
