/** Nivel de dificultad de una palabra o ficha: 1 sencilla (1.º–2.º), 2 media (3.º–4.º), 3 difícil (5.º–6.º) */
export type Level = 1 | 2 | 3

export type BandId = 'b12' | 'b34' | 'b56' | 'all'

export interface Band {
  id: BandId
  label: string
  levels: Level[]
}

/** Grupos de grados para elegir el contenido. Cada grupo incluye también lo más sencillo del grupo anterior. */
export const BANDS: Band[] = [
  { id: 'b12', label: '1.º y 2.º', levels: [1] },
  { id: 'b34', label: '3.º y 4.º', levels: [1, 2] },
  { id: 'b56', label: '5.º y 6.º', levels: [2, 3] },
  { id: 'all', label: 'Todos los grados', levels: [1, 2, 3] }
]

/** ¿Sirve un elemento de este nivel para el grupo de grados? (nivel 0 = sin nivel: sirve siempre) */
export function bandAllows(band: BandId, level: Level | 0): boolean {
  if (level === 0) return true
  return (BANDS.find((b) => b.id === band) ?? BANDS[3]).levels.includes(level)
}
