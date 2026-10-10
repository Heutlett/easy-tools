import { randomInt } from '../random'
import type { Question } from '../../content/types'

/** Copia del arreglo en orden al azar (Fisher–Yates con el generador seguro del sistema) */
export function shuffle<T>(items: readonly T[]): T[] {
  const out = [...items]
  for (let i = out.length - 1; i > 0; i--) {
    const j = randomInt(0, i)
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

/** `count` elementos distintos al azar */
export const pick = <T>(items: readonly T[], count: number): T[] => shuffle(items).slice(0, count)

/** Un elemento al azar (undefined si la lista está vacía) */
export const pickOne = <T>(items: readonly T[]): T | undefined =>
  items.length ? items[randomInt(0, items.length - 1)] : undefined

/** Las opciones de una pregunta en orden al azar, con la posición de la correcta ya recalculada. Llamar una vez por pregunta mostrada. */
export function shuffleOptions(q: Pick<Question, 'options' | 'answer'>): {
  options: string[]
  answer: number
} {
  const order = shuffle(q.options.map((_, i) => i))
  return { options: order.map((i) => q.options[i]), answer: order.indexOf(q.answer) }
}
