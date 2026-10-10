import type { Difficulty, Grade, PairList, Question, Statement, SubjectId, WordList } from './types'

/**
 * Formas cortas para escribir el contenido que viene con la app (ver docs/juegos.md).
 * Los archivos de contenido solo usan estas funciones, así cada pregunta ocupa una línea.
 */

/** [grado, tema, dificultad, pregunta, RESPUESTA CORRECTA, incorrecta 1, incorrecta 2, incorrecta 3, explicación (opcional)] */
export type QuestionRow = [
  grade: Grade,
  topic: string,
  difficulty: Difficulty,
  text: string,
  correct: string,
  wrong1: string,
  wrong2: string,
  wrong3: string,
  explanation?: string
]

/** [grado, tema, afirmación, ¿es verdadera?, explicación (opcional)] */
export type StatementRow = [
  grade: Grade,
  topic: string,
  text: string,
  answer: boolean,
  explanation?: string
]

const pad = (n: number): string => String(n).padStart(3, '0')

export function defineQuestions(subject: SubjectId, rows: QuestionRow[]): Question[] {
  const counters: Record<number, number> = {}
  return rows.map(([grade, topic, difficulty, text, correct, w1, w2, w3, explanation]) => {
    counters[grade] = (counters[grade] ?? 0) + 1
    return {
      id: `${subject}-${grade}-${pad(counters[grade])}`,
      subject,
      grade,
      topic,
      difficulty,
      text,
      // La respuesta correcta se escribe primero; el juego mezcla las opciones al mostrarlas
      options: [correct, w1, w2, w3],
      answer: 0,
      ...(explanation ? { explanation } : {})
    }
  })
}

export function defineStatements(subject: SubjectId, rows: StatementRow[]): Statement[] {
  const counters: Record<number, number> = {}
  return rows.map(([grade, topic, text, answer, explanation]) => {
    counters[grade] = (counters[grade] ?? 0) + 1
    return {
      id: `${subject}-vf-${grade}-${pad(counters[grade])}`,
      subject,
      grade,
      topic,
      text,
      answer,
      ...(explanation ? { explanation } : {})
    }
  })
}

export interface WordListRow {
  /** Nombre que se ve al elegir la lista, por ejemplo «Animales de Costa Rica» */
  title: string
  grades: Grade[]
  topic?: string
  /** Palabras o frases; con pista: ['mariposa', 'Insecto con alas de colores'] */
  words: (string | [word: string, clue: string])[]
}

export function defineWordLists(subject: SubjectId, rows: WordListRow[]): WordList[] {
  return rows.map((row, i) => ({
    id: `${subject}-palabras-${pad(i + 1)}`,
    title: row.title,
    subject,
    grades: row.grades,
    ...(row.topic ? { topic: row.topic } : {}),
    items: row.words.map((w) => (typeof w === 'string' ? { text: w } : { text: w[0], clue: w[1] }))
  }))
}

export interface PairListRow {
  title: string
  grades: Grade[]
  topic?: string
  /** Cada pareja: lo que está en una carta y lo que está en la otra (pueden ser emojis) */
  pairs: [string, string][]
}

export function definePairLists(subject: SubjectId, rows: PairListRow[]): PairList[] {
  return rows.map((row, i) => ({
    id: `${subject}-parejas-${pad(i + 1)}`,
    title: row.title,
    subject,
    grades: row.grades,
    ...(row.topic ? { topic: row.topic } : {}),
    pairs: row.pairs
  }))
}
