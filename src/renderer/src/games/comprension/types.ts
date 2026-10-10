import type { Grade } from '../../content/types'

export type TextKind =
  'cuento' | 'fábula' | 'leyenda' | 'informativo' | 'instructivo' | 'noticia' | 'carta' | 'poema'

export const TEXT_KINDS: { id: TextKind; title: string; icon: string }[] = [
  { id: 'cuento', title: 'Cuento', icon: '📚' },
  { id: 'fábula', title: 'Fábula', icon: '🦊' },
  { id: 'leyenda', title: 'Leyenda', icon: '🌙' },
  { id: 'informativo', title: 'Informativo', icon: '🔎' },
  { id: 'instructivo', title: 'Instructivo', icon: '📝' },
  { id: 'noticia', title: 'Noticia', icon: '📰' },
  { id: 'carta', title: 'Carta', icon: '✉️' },
  { id: 'poema', title: 'Poema', icon: '🎶' }
]

/** Clase de pregunta: literal (está escrito), vocabulario, inferencia (hay que deducir) o idea principal */
export type QuestionKind = 'literal' | 'vocabulario' | 'inferencia' | 'idea'

export const QUESTION_KIND_LABEL: Record<QuestionKind, string> = {
  literal: 'Lo que dice el texto',
  vocabulario: 'Vocabulario',
  inferencia: 'Pensemos más allá',
  idea: 'Idea principal'
}

export interface ReadingQuestion {
  kind: QuestionKind
  text: string
  /** La correcta va primero; al jugar se mezclan */
  options: [string, string, string, string]
  explanation?: string
}

export interface ReadingText {
  id: string
  grade: Grade
  kind: TextKind
  title: string
  emoji: string
  /** Un párrafo por elemento; en los poemas, un verso por salto de línea */
  paragraphs: string[]
  questions: ReadingQuestion[]
}

type Q = ['l' | 'v' | 'i' | 'm', string, string, string, string, string, (string | undefined)?]

const KIND = { l: 'literal', v: 'vocabulario', i: 'inferencia', m: 'idea' } as const

let counter = 0

/**
 * Define un texto con sus preguntas. Preguntas: [clase, pregunta, CORRECTA, incorrecta, incorrecta, incorrecta, explicación]
 * (l = literal, v = vocabulario, i = inferencia, m = idea principal). La primera línea del texto es el título.
 */
export function defineText(
  grade: Grade,
  kind: TextKind,
  emoji: string,
  title: string,
  body: string,
  questions: Q[]
): ReadingText {
  counter += 1
  return {
    id: `lc-${grade}-${counter}`,
    grade,
    kind,
    title,
    emoji,
    paragraphs: body.split('\n\n').map((p) => p.trim()),
    questions: questions.map(([k, text, a, b, c, d, explanation]) => ({
      kind: KIND[k],
      text,
      options: [a, b, c, d],
      explanation
    }))
  }
}
