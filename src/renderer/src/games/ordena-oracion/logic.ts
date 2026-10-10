import type { Grade } from '../../content/types'
import { randomInt } from '../../lib/random'
import { shuffle } from '../../lib/games/shuffle'
import { BANKS } from './data'

/** Una oración lista para jugar: una o más formas válidas de ordenarla */
export interface Form {
  /** Fichas (palabras y signos) de esta forma, ya con la mayúscula inicial quitada si no es un nombre propio */
  tokens: string[]
  /** Si la primera palabra es un nombre propio (siempre lleva mayúscula) */
  properFirst: boolean
  /** La oración completa escrita correctamente */
  text: string
}

export interface Sentence {
  forms: Form[]
}

/** Una plantilla: una o varias formas con las mismas elecciones */
export interface Template {
  patterns: string[]
}

/** `{nombre:a|b}` define una elección, `{nombre}` la repite y `{a|b}` es una elección que no se repite */
const CHOICE = /\{(?:(\w+):([^}]*)|(\w+)|([^}:]*\|[^}]*))\}/g

/** Todas las oraciones que salen de una plantilla (cada combinación de elecciones) */
export function expandTemplate(template: Template): string[][] {
  // Cada elección tiene un nombre; las anónimas reciben uno propio por forma y posición
  const options = new Map<string, string[]>()
  const named = template.patterns.map((pattern, f) => {
    let n = 0
    return pattern.replace(
      CHOICE,
      (_whole: string, name?: string, defs?: string, ref?: string, anon?: string) => {
        if (name !== undefined) {
          options.set(name, defs!.split('|'))
          return `{${name}}`
        }
        if (anon !== undefined) {
          const id = `_${f}_${n++}`
          options.set(id, anon.split('|'))
          return `{${id}}`
        }
        return `{${ref}}`
      }
    )
  })
  const names = [...options.keys()]
  let combos: Record<string, string>[] = [{}]
  for (const name of names)
    combos = combos.flatMap((c) => options.get(name)!.map((o) => ({ ...c, [name]: o })))
  return combos.map((combo) =>
    named.map((p) =>
      p
        .replace(/\{(\w+)\}/g, (_, name: string) => combo[name] ?? '')
        .replace(/\s+/g, ' ')
        .trim()
    )
  )
}

const OPEN = /^[¿¡]+/
const CLOSE = /[.,;:?!]+$/

/** Pasa el texto de una forma a fichas: «¿Dónde vive el loro?» → ¿ · dónde · vive · el · loro · ? */
export function makeForm(raw: string): Form {
  const first = raw.search(/\p{L}/u)
  const properFirst = first >= 0 && raw[first] !== raw[first].toLowerCase()
  const capitalized =
    first >= 0 ? raw.slice(0, first) + raw[first].toUpperCase() + raw.slice(first + 1) : raw
  const text = /[.?!]$/.test(capitalized) ? capitalized : `${capitalized}.`
  const tokens: string[] = []
  for (const word of text.split(' ')) {
    const open = OPEN.exec(word)?.[0] ?? ''
    const rest = word.slice(open.length)
    const close = CLOSE.exec(rest)?.[0] ?? ''
    for (const ch of open) tokens.push(ch)
    tokens.push(rest.slice(0, rest.length - close.length))
    for (const ch of close) tokens.push(ch)
  }
  const wordAt = tokens.findIndex((t) => /\p{L}/u.test(t))
  if (!properFirst && wordAt >= 0) tokens[wordAt] = tokens[wordAt].toLowerCase()
  return { tokens, properFirst, text }
}

export const isMark = (token: string): boolean => !/[\p{L}\p{N}]/u.test(token)
/** Posición de la primera palabra (la que lleva la mayúscula inicial) */
export const firstWordIndex = (tokens: string[]): number => tokens.findIndex((t) => !isMark(t))

export interface Bank {
  templates: Template[]
  /** Cuántas oraciones distintas hay en total */
  size: number
}

const cache = new Map<Grade, Template[]>()

export function templatesFor(grade: Grade, twoOnly: boolean): Template[] {
  let all = cache.get(grade)
  if (!all) {
    const bank = BANKS[grade]
    all = [
      ...bank.one.map((p) => ({ patterns: [p] })),
      ...bank.two.map((patterns) => ({ patterns }))
    ]
    cache.set(grade, all)
  }
  return twoOnly ? all.filter((t) => t.patterns.length > 1) : all
}

export function bankSize(grade: Grade, twoOnly: boolean): number {
  return templatesFor(grade, twoOnly).reduce((n, t) => n + expandTemplate(t).length, 0)
}

const key = (tokens: string[]): string => [...tokens].sort().join('\u0001')

/**
 * Elige la oración de una plantilla. Con signos, las fichas salen de una forma al azar y solo valen las formas
 * que usan exactamente las mismas fichas (por ejemplo, las que no cambian la coma de lugar).
 */
export function drawSentence(template: Template, punctuation: boolean): Sentence {
  const all = expandTemplate(template)
  const raws = all[randomInt(0, all.length - 1)]
  const forms = raws.map(makeForm)
  if (!punctuation) return { forms }
  const base = forms[randomInt(0, forms.length - 1)]
  return { forms: [base, ...forms.filter((f) => f !== base && key(f.tokens) === key(base.tokens))] }
}

/** Con `twoOnly` y signos, solo sirven las plantillas que en esa elección tienen más de una forma válida */
export function pickSentences(
  grade: Grade,
  count: number,
  punctuation: boolean,
  twoOnly: boolean
): Sentence[] {
  const out: Sentence[] = []
  let deck: Template[] = []
  let guard = 0
  while (out.length < count && guard++ < count * 20) {
    if (deck.length === 0) deck = shuffle(templatesFor(grade, twoOnly))
    const s = drawSentence(deck.pop()!, punctuation)
    if (twoOnly && s.forms.length < 2) continue
    out.push(s)
  }
  return out
}

/** Las fichas desordenadas: nunca salen ya en un orden correcto */
export function shuffledTiles(
  sentence: Sentence,
  punctuation: boolean
): { id: number; text: string }[] {
  const base = punctuation
    ? sentence.forms[0].tokens
    : sentence.forms[0].tokens.filter((t) => !isMark(t))
  const tiles = base.map((text, id) => ({ id, text }))
  if (new Set(base).size < 2) return tiles
  const isCorrect = (list: { text: string }[]): boolean =>
    sentence.forms.some((f) => {
      const want = punctuation ? f.tokens : f.tokens.filter((t) => !isMark(t))
      return want.every((t, i) => t === list[i]?.text)
    })
  let mix = shuffle(tiles)
  let tries = 0
  while (isCorrect(mix) && tries++ < 30) mix = shuffle(tiles)
  return mix
}

export interface Verdict {
  /** ¿Las fichas están en un orden válido? */
  ordered: boolean
  /** ¿Falta la mayúscula inicial? (solo con signos) */
  needsCapital: boolean
}

/** Revisa lo que armó el grupo */
export function check(
  sentence: Sentence,
  placed: string[],
  punctuation: boolean,
  capital: boolean
): Verdict {
  for (const form of sentence.forms) {
    const want = punctuation ? form.tokens : form.tokens.filter((t) => !isMark(t))
    if (want.length === placed.length && want.every((t, i) => t === placed[i])) {
      return { ordered: true, needsCapital: punctuation && !form.properFirst && !capital }
    }
  }
  return { ordered: false, needsCapital: false }
}

/** La oración correcta que se muestra al acertar o al acabarse el tiempo (con la mayúscula y los signos) */
export function answerText(sentence: Sentence, placed?: string[], punctuation?: boolean): string {
  if (placed && punctuation !== undefined) {
    for (const form of sentence.forms) {
      const want = punctuation ? form.tokens : form.tokens.filter((t) => !isMark(t))
      if (want.length === placed.length && want.every((t, i) => t === placed[i])) return form.text
    }
  }
  return sentence.forms[0].text
}
