import type { Grade } from '../../../content/types'
import { G1 } from './g1'
import { G2 } from './g2'
import { G3 } from './g3'
import { G4 } from './g4'
import { G5 } from './g5'
import { G6 } from './g6'
import type { Row } from './types'

export interface Fill {
  /** Posición de la palabra que se quita (en `tokens`) */
  index: number
  /** Palabra correcta, tal como se escribe en la oración */
  answer: string
  /** Todas las opciones (la correcta incluida), todavía sin mezclar */
  options: string[]
}

export interface Sentence {
  id: string
  grade: Grade
  topic: string
  /** La oración completa, con su puntuación */
  en: string
  es: string
  /** Las palabras como fichas: sin el punto final y con la primera en minúscula (salvo nombres propios) */
  tokens: string[]
  /** Las palabras tal como se escriben (con mayúscula inicial), para mostrar la oración completa */
  words: string[]
  /** Signo con que termina: «.», «?» o «!» */
  end: string
  fill?: Fill
}

/** Primeras palabras que siempre llevan mayúscula */
const KEEP_CAPS = /^(I|I['’](m|ll|ve|d)|Costa|Tico|Ticos|Christmas|January|Monday|Tuesday|Friday)$/

/** Quita la puntuación de los extremos de una palabra («recycle,» → «recycle») */
export const core = (token: string): string =>
  token.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, '')

export function tokenize(en: string): { tokens: string[]; words: string[]; end: string } {
  const match = /([.?!])$/.exec(en)
  const end = match ? match[1] : ''
  const words = (match ? en.slice(0, -1) : en).split(' ')
  const tokens = [...words]
  if (!KEEP_CAPS.test(core(tokens[0])))
    tokens[0] = tokens[0].charAt(0).toLowerCase() + tokens[0].slice(1)
  return { tokens, words, end }
}

function build(grade: Grade, rows: Row[]): Sentence[] {
  return rows.map(([topic, en, es, answer, ...wrong], i) => {
    const { tokens, words, end } = tokenize(en)
    const sentence: Sentence = {
      id: `ing-${grade}-${i + 1}`,
      grade,
      topic,
      en,
      es,
      tokens,
      words,
      end
    }
    if (answer) {
      const index = tokens.findIndex((t) => core(t).toLowerCase() === answer.toLowerCase())
      if (index >= 0) sentence.fill = { index, answer, options: [answer, ...wrong] }
    }
    return sentence
  })
}

export const SENTENCES: Sentence[] = [
  ...build(1, G1),
  ...build(2, G2),
  ...build(3, G3),
  ...build(4, G4),
  ...build(5, G5),
  ...build(6, G6)
]

/** Temas de un grado, en el orden en que aparecen en el programa */
export function sentenceTopics(grade: Grade): string[] {
  return [...new Set(SENTENCES.filter((s) => s.grade === grade).map((s) => s.topic))]
}

/** Oraciones de un grado (y los temas elegidos; todos si no se elige ninguno) */
export function sentencesFor(grade: Grade, topics: string[], fillOnly: boolean): Sentence[] {
  return SENTENCES.filter(
    (s) =>
      s.grade === grade &&
      (topics.length === 0 || topics.includes(s.topic)) &&
      (!fillOnly || s.fill)
  )
}
