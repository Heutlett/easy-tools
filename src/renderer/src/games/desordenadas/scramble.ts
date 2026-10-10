import { shuffle } from '../../lib/games/shuffle'

/**
 * Pone las fichas `ids` en orden al azar de modo que NUNCA queden formando `goal` (la palabra ya armada),
 * y, mientras se pueda, con pocas letras en su lugar. `bases[id]` es la letra de cada ficha.
 */
export function scrambleIds(ids: number[], bases: string[], goal: string): number[] {
  if (new Set(ids.map((i) => bases[i])).size < 2) return ids // todas iguales: no hay otra forma
  const goalLetters = Array.from(goal)
  const allowedInPlace = Math.floor(ids.length / 4)
  let fallback: number[] | null = null
  for (let attempt = 0; attempt < 80; attempt++) {
    const candidate = shuffle(ids)
    const spelled = candidate.map((i) => bases[i]).join('')
    if (spelled === goal) continue
    fallback ??= candidate
    const inPlace = candidate.filter((id, pos) => bases[id] === goalLetters[pos]).length
    if (inPlace <= allowedInPlace) return candidate
  }
  if (fallback) return fallback
  // Último recurso (muy raro): girar una posición hasta que sea distinta
  for (let shift = 1; shift < ids.length; shift++) {
    const rotated = [...ids.slice(shift), ...ids.slice(0, shift)]
    if (rotated.map((i) => bases[i]).join('') !== goal) return rotated
  }
  return ids
}
