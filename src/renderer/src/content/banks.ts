import { useCallback, useMemo } from 'react'
import { usePersistentState } from '../lib/usePersistentState'
import type { Difficulty, Grade, PairList, Question, Statement, SubjectId, WordList } from './types'

/** Todo lo que viene con la app: un archivo por asignatura en cada carpeta (ver docs/juegos.md) */
const flat = <T>(modules: Record<string, { default: T[] }>): T[] =>
  Object.values(modules).flatMap((m) => m.default)

export const builtInQuestions: Question[] = flat(
  import.meta.glob<{ default: Question[] }>('./questions/*.ts', { eager: true })
)
export const builtInStatements: Statement[] = flat(
  import.meta.glob<{ default: Statement[] }>('./statements/*.ts', { eager: true })
)
export const builtInWordLists: WordList[] = flat(
  import.meta.glob<{ default: WordList[] }>('./lists/*.ts', { eager: true })
)
export const builtInPairLists: PairList[] = flat(
  import.meta.glob<{ default: PairList[] }>('./pairs/*.ts', { eager: true })
)

export interface Bank<T> {
  /** Lo que viene con la app más lo que creó la persona */
  all: T[]
  builtIn: T[]
  custom: T[]
  /** Agrega uno propio (se le pone un id nuevo y la marca de «propio») */
  add: (item: Omit<T, 'id' | 'custom'>) => T
  /** Reemplaza uno propio por su id */
  update: (item: T) => void
  remove: (id: string) => void
  /** Agrega varios propios de una vez (importar un archivo) */
  addMany: (items: Omit<T, 'id' | 'custom'>[]) => number
}

function useBank<T extends { id: string; custom?: boolean }>(key: string, builtIn: T[]): Bank<T> {
  const [custom, setCustom] = usePersistentState<T[]>(key, [])
  const all = useMemo(() => [...builtIn, ...custom], [builtIn, custom])

  const add = useCallback(
    (item: Omit<T, 'id' | 'custom'>): T => {
      const created = { ...item, id: `propio-${crypto.randomUUID()}`, custom: true } as unknown as T
      setCustom([...custom, created])
      return created
    },
    [custom, setCustom]
  )
  const update = useCallback(
    (item: T) => setCustom(custom.map((c) => (c.id === item.id ? { ...item, custom: true } : c))),
    [custom, setCustom]
  )
  const remove = useCallback(
    (id: string) => setCustom(custom.filter((c) => c.id !== id)),
    [custom, setCustom]
  )
  const addMany = useCallback(
    (items: Omit<T, 'id' | 'custom'>[]): number => {
      const created = items.map(
        (item) => ({ ...item, id: `propio-${crypto.randomUUID()}`, custom: true }) as unknown as T
      )
      setCustom([...custom, ...created])
      return created.length
    },
    [custom, setCustom]
  )
  return { all, builtIn, custom, add, update, remove, addMany }
}

/** Preguntas de 4 opciones: las incluidas y las de la persona */
export const useQuestionBank = (): Bank<Question> => useBank('bank-questions', builtInQuestions)
export const useStatementBank = (): Bank<Statement> => useBank('bank-statements', builtInStatements)
export const useWordListBank = (): Bank<WordList> => useBank('bank-words', builtInWordLists)
export const usePairListBank = (): Bank<PairList> => useBank('bank-pairs', builtInPairLists)

/** Los criterios con los que se filtra un banco (todos opcionales; lo que no se indica no filtra) */
export interface BankFilter {
  subjects?: SubjectId[]
  grades?: Grade[]
  topics?: string[]
  difficulties?: Difficulty[]
  /** Solo lo incluido en la app, solo lo propio, o todo */
  source?: 'all' | 'builtIn' | 'custom'
}

type Filterable = {
  subject: SubjectId
  grade?: Grade
  grades?: Grade[]
  topic?: string
  difficulty?: Difficulty
  custom?: boolean
}

/** Los elementos que cumplen los filtros. Una lista (de palabras o parejas) sirve para un grado si lo incluye en `grades`. */
export function filterBank<T extends Filterable>(items: T[], f: BankFilter): T[] {
  return items.filter((it) => {
    if (f.subjects?.length && !f.subjects.includes(it.subject)) return false
    if (f.grades?.length) {
      const own = it.grades ?? (it.grade ? [it.grade] : [])
      if (!own.some((g) => f.grades!.includes(g))) return false
    }
    if (f.topics?.length && !(it.topic && f.topics.includes(it.topic))) return false
    if (f.difficulties?.length && !(it.difficulty && f.difficulties.includes(it.difficulty)))
      return false
    if (f.source === 'builtIn' && it.custom) return false
    if (f.source === 'custom' && !it.custom) return false
    return true
  })
}

/** Los temas que existen en una lista, con cuántos elementos tiene cada uno (orden alfabético) */
export function topicsOf(items: Filterable[]): { topic: string; count: number }[] {
  const counts = new Map<string, number>()
  for (const it of items) if (it.topic) counts.set(it.topic, (counts.get(it.topic) ?? 0) + 1)
  return [...counts.entries()]
    .map(([topic, count]) => ({ topic, count }))
    .sort((a, b) => a.topic.localeCompare(b.topic, 'es'))
}
