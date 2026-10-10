import { SUBJECTS } from '../../content/subjects'
import type { Difficulty, Grade, Question, SubjectId } from '../../content/types'
import { pick, shuffle } from '../../lib/games/shuffle'

/** Puntos de cada fila del tablero, de arriba abajo */
export const VALUES = [100, 200, 300, 400, 500]
/** Dificultad que se busca para cada fila: 100 y 200 fáciles, 300 y 400 medias, 500 difícil */
const TARGETS: Difficulty[] = [1, 1, 2, 2, 3]
/** Preguntas que hacen falta para que un tema sea una categoría */
export const MIN_QUESTIONS = VALUES.length
export const MIN_CATEGORIES = 3
export const MAX_CATEGORIES = 6

/** Un tema de un grado (por ejemplo «Fracciones» de Matemática 4.º) con todas sus preguntas */
export interface Category {
  key: string
  subject: SubjectId
  grade: Grade
  topic: string
  questions: Question[]
}

export interface Settings {
  /** Segundos para responder (0 = sin tiempo) */
  seconds: number
  /** Si quien acierta sigue eligiendo casilla */
  keepTurn: boolean
  /** Si fallar resta puntos */
  penalty: boolean
  /** Si otro equipo puede intentarlo después de un fallo */
  steal: boolean
  /** Casillas de «Doble o nada» escondidas */
  doubles: 0 | 1 | 2
}

export const DEFAULT_SETTINGS: Settings = {
  seconds: 30,
  keepTurn: false,
  penalty: false,
  steal: true,
  doubles: 1
}

export interface Cell {
  question: Question
  value: number
  double: boolean
}

export interface Column {
  category: Pick<Category, 'key' | 'subject' | 'grade' | 'topic'>
  cells: Cell[]
}

export const categoryKey = (q: Pick<Question, 'subject' | 'grade' | 'topic'>): string =>
  `${q.subject}|${q.grade}|${q.topic}`

/** Los temas con preguntas suficientes para armar una columna, ordenados por asignatura, grado y nombre */
export function categoriesOf(questions: Question[]): Category[] {
  const map = new Map<string, Category>()
  for (const q of questions) {
    const key = categoryKey(q)
    const found = map.get(key)
    if (found) found.questions.push(q)
    else map.set(key, { key, subject: q.subject, grade: q.grade, topic: q.topic, questions: [q] })
  }
  const order = (id: SubjectId): number => SUBJECTS.findIndex((s) => s.id === id)
  return [...map.values()]
    .filter((c) => c.questions.length >= MIN_QUESTIONS)
    .sort(
      (a, b) =>
        order(a.subject) - order(b.subject) ||
        a.grade - b.grade ||
        a.topic.localeCompare(b.topic, 'es')
    )
}

/** Cinco preguntas distintas para una columna: las dificultades que corresponden a cada fila o, si faltan, las más cercanas */
export function pickColumn(category: Category): Question[] {
  const left = shuffle(category.questions)
  const chosen: Question[] = []
  for (const target of TARGETS) {
    // El orden es estable: entre dos igual de cercanas queda la que salió primero al mezclar
    const best = [...left].sort(
      (a, b) => Math.abs(a.difficulty - target) - Math.abs(b.difficulty - target)
    )[0]
    chosen.push(best)
    left.splice(left.indexOf(best), 1)
  }
  // De la más fácil a la más difícil, para que los puntos crezcan con la dificultad
  return chosen.sort((a, b) => a.difficulty - b.difficulty)
}

/** Arma el tablero: una columna por categoría y las casillas de «Doble o nada» escondidas al azar (no en la fila de 100) */
export function buildBoard(categories: Category[], doubles: number): Column[] {
  const columns: Column[] = categories.map((c) => ({
    category: { key: c.key, subject: c.subject, grade: c.grade, topic: c.topic },
    cells: pickColumn(c).map((question, i) => ({ question, value: VALUES[i], double: false }))
  }))
  const spots = columns.flatMap((_, c) => VALUES.slice(1).map((__, r) => ({ c, r: r + 1 })))
  for (const { c, r } of pick(spots, doubles)) columns[c].cells[r].double = true
  return columns
}
