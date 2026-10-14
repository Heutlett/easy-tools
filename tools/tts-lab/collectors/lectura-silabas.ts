import {
  LARGAS,
  MONOSILABAS,
  WORDS,
  wordText
} from '../../../src/renderer/src/games/lectura-silabas/data'
import { slug, type Item } from './util'

/**
 * «Lectura por sílabas»: el juego dice la palabra completa (al armarla, al contar las sílabas y en el botón 🔊 «Escúchala»).
 * Fuente: games/lectura-silabas/data.ts. Id: es/palabras/<palabra> (se comparte con las palabras de rimas de los trabalenguas).
 */
export function collect(): Item[] {
  return [...WORDS, ...MONOSILABAS, ...LARGAS].map((w) => {
    const text = wordText(w)
    return { id: `es/palabras/${slug(text)}`, lang: 'es' as const, text }
  })
}
