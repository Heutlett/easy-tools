import type { Grade, PairList, Question, Statement, SubjectId, WordList } from './types'
import { SUBJECTS } from './subjects'

/** Archivo para compartir contenido propio entre docentes: un .json con su tipo y los elementos */
export type BankKind = 'preguntas' | 'afirmaciones' | 'palabras' | 'parejas'

interface BankFile<T> {
  app: 'educando'
  kind: BankKind
  version: 1
  items: T[]
}

export function bankToFile<T>(kind: BankKind, items: T[]): ArrayBuffer {
  const file: BankFile<T> = { app: 'educando', kind, version: 1, items }
  return new TextEncoder().encode(JSON.stringify(file, null, 2)).buffer as ArrayBuffer
}

const isGrade = (g: unknown): g is Grade => typeof g === 'number' && g >= 1 && g <= 6
const isSubject = (s: unknown): s is SubjectId => SUBJECTS.some((x) => x.id === s)
const isText = (t: unknown): t is string => typeof t === 'string' && t.trim().length > 0
const clean = (t: string): string => t.trim().replace(/\s+/g, ' ')

/** Lee un archivo compartido. Devuelve solo los elementos válidos (sin id: al agregarlos se les pone uno nuevo) y cuántos se descartaron. */
export async function readBankFile(
  file: File,
  kind: BankKind
): Promise<{ items: Record<string, unknown>[]; skipped: number }> {
  let parsed: unknown
  try {
    parsed = JSON.parse(await file.text())
  } catch {
    throw new Error('Ese archivo no se puede leer. ¿Es un archivo de Educando?')
  }
  const data = parsed as Partial<BankFile<unknown>>
  if ((data?.app !== 'educando' && data?.app !== 'easy-tools') || !Array.isArray(data.items))
    throw new Error('Ese archivo no es de Educando.')
  if (data.kind !== kind) throw new Error(`Ese archivo es de otro tipo («${data.kind}»).`)

  const items: Record<string, unknown>[] = []
  let skipped = 0
  for (const raw of data.items as Record<string, unknown>[]) {
    const item = sanitize(kind, raw)
    if (item) items.push(item)
    else skipped++
  }
  return { items, skipped }
}

function sanitize(kind: BankKind, r: Record<string, unknown>): Record<string, unknown> | null {
  if (!r || !isSubject(r.subject)) return null
  if (kind === 'preguntas') {
    const options = Array.isArray(r.options) ? r.options.map(String).map(clean) : []
    if (!isGrade(r.grade) || !isText(r.text) || options.length !== 4 || options.some((o) => !o))
      return null
    if (new Set(options.map((o) => o.toLowerCase())).size !== 4) return null
    const answer = Number(r.answer)
    if (!Number.isInteger(answer) || answer < 0 || answer > 3) return null
    const q: Omit<Question, 'id' | 'custom'> = {
      subject: r.subject,
      grade: r.grade,
      topic: isText(r.topic) ? clean(r.topic) : 'Sin tema',
      difficulty: [1, 2, 3].includes(Number(r.difficulty))
        ? (Number(r.difficulty) as 1 | 2 | 3)
        : 2,
      text: clean(r.text as string),
      options,
      answer,
      ...(isText(r.explanation) ? { explanation: clean(r.explanation) } : {})
    }
    return q
  }
  if (kind === 'afirmaciones') {
    if (!isGrade(r.grade) || !isText(r.text) || typeof r.answer !== 'boolean') return null
    const s: Omit<Statement, 'id' | 'custom'> = {
      subject: r.subject,
      grade: r.grade,
      topic: isText(r.topic) ? clean(r.topic) : 'Sin tema',
      text: clean(r.text),
      answer: r.answer,
      ...(isText(r.explanation) ? { explanation: clean(r.explanation) } : {})
    }
    return s
  }
  const grades = Array.isArray(r.grades) ? r.grades.filter(isGrade) : []
  if (!isText(r.title) || grades.length === 0) return null
  if (kind === 'palabras') {
    const items = (Array.isArray(r.items) ? r.items : [])
      .map((i) => i as { text?: unknown; clue?: unknown })
      .filter((i) => isText(i.text))
      .map((i) => ({
        text: clean(i.text as string),
        ...(isText(i.clue) ? { clue: clean(i.clue) } : {})
      }))
    if (items.length === 0) return null
    const w: Omit<WordList, 'id' | 'custom'> = {
      title: clean(r.title),
      subject: r.subject,
      grades,
      ...(isText(r.topic) ? { topic: clean(r.topic) } : {}),
      items
    }
    return w
  }
  const pairs = (Array.isArray(r.pairs) ? r.pairs : [])
    .filter((p): p is [string, string] => Array.isArray(p) && isText(p[0]) && isText(p[1]))
    .map((p): [string, string] => [clean(p[0]), clean(p[1])])
  if (pairs.length === 0) return null
  const p: Omit<PairList, 'id' | 'custom'> = {
    title: clean(r.title),
    subject: r.subject,
    grades,
    ...(isText(r.topic) ? { topic: clean(r.topic) } : {}),
    pairs
  }
  return p
}
