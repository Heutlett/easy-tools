import {
  expandTemplate,
  makeForm,
  templatesFor
} from '../../../src/renderer/src/games/ordena-oracion/logic'
import type { Grade } from '../../../src/renderer/src/content/types'
import { slug, type Item } from './util'

/**
 * «Ordena la oración»: al acertar, el juego dice la oración completa y bien escrita. Las oraciones salen de plantillas con elecciones
 * ({el niño|la niña} …), así que aquí se recorren TODAS las combinaciones de todos los grados (y todas las formas válidas de cada una).
 * Fuente: games/ordena-oracion/data.ts. Id: es/ordena-oracion/<oración>.
 */
export function collect(): Item[] {
  const texts = new Set<string>()
  for (const grade of [1, 2, 3, 4, 5, 6] as Grade[])
    for (const template of templatesFor(grade, false))
      for (const forms of expandTemplate(template))
        for (const raw of forms) texts.add(makeForm(raw).text)
  return [...texts].map((text) => ({
    id: `es/ordena-oracion/${slug(text)}`,
    lang: 'es' as const,
    text
  }))
}
