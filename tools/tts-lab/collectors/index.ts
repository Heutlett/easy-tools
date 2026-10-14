import { createHash } from 'node:crypto'
import { collect as bingo } from './bingo'
import { collect as comprension } from './comprension'
import { collect as ingles } from './ingles'
import { collect as lecturaSilabas } from './lectura-silabas'
import { collect as ordenaOracion } from './ordena-oracion'
import { collect as trabalenguas } from './trabalenguas'
import type { Item } from './util'

/**
 * Los juegos que tienen audios. Para agregar uno nuevo: crear collectors/<juego>.ts que exporte `collect(): Item[]` y sumarlo aquí
 * (ver README). Juegos que NO leen en voz alta, a propósito: el Millonario, el Concurso y Ortografía.
 */
export const GAMES: Record<string, () => Item[]> = {
  bingo,
  comprension,
  ingles,
  'lectura-silabas': lecturaSilabas,
  'ordena-oracion': ordenaOracion,
  trabalenguas
}

const hash = (text: string): string => createHash('sha1').update(text).digest('hex').slice(0, 6)

/**
 * Junta todo: un mismo texto que sale en varios juegos queda en un solo audio (se suman sus velocidades), y si dos textos distintos
 * dan el mismo nombre de archivo, a los dos se les agrega una huella para distinguirlos.
 */
export function collectAll(): Item[] {
  const all = Object.values(GAMES).flatMap((collect) => collect())
  const byId = new Map<string, Map<string, Item>>()
  for (const item of all) {
    const texts = byId.get(item.id) ?? new Map<string, Item>()
    byId.set(item.id, texts)
    const same = texts.get(item.text)
    if (!same) {
      texts.set(item.text, { ...item, variants: item.variants ? [...item.variants] : undefined })
      continue
    }
    same.variants = [...new Set([...(same.variants ?? []), ...(item.variants ?? [])])]
    continue
  }
  const items: Item[] = []
  for (const [id, texts] of byId)
    for (const item of texts.values())
      items.push(texts.size > 1 ? { ...item, id: `${id}-${hash(item.text)}` } : item)
  return items
}
