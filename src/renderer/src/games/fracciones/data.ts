/*
 * Fracciones — alineado con los Programas de Estudio de Matemáticas del MEP (2012), área de Números (el programa dice que el
 * tratamiento de fracciones y decimales se concentra en el segundo ciclo):
 *  - 3.º: solo de manera intuitiva, en Medidas (¼, ½ y ¾ de kg). Se usa para empezar con mitades, tercios y cuartos.
 *  - 4.º: fracciones propias: concepto, escritura, lectura y representaciones (gráfica, literal y simbólica); comparar con <, > o =;
 *         resolver problemas. «Durante el 4.º año sólo se trabajarán fracciones propias.»
 *  - 5.º: fracciones impropias, representación mixta, fracciones homogéneas y heterogéneas, comparar (con denominadores 2, 3, 4, 5 o 10),
 *         relación con los decimales.
 *  - 6.º: fracciones equivalentes (simplificar y amplificar), suma y resta de fracciones homogéneas y heterogéneas, porcentajes.
 * Por eso «Equivalentes» y «Suma visual» se ofrecen como actividades de 6.º (con las mismas figuras para repasar en 5.º) y los decimales
 * y porcentajes simples aparecen en el nivel de 6.º.
 * Fuente: MEP, «Programas de Estudio de Matemáticas. I y II ciclos de la Educación General Básica y Ciclo Diversificado», 2012.
 */
import { numberWords } from '../_manip/words'

export type Kind = 'circle' | 'bar' | 'grid'

export interface FrLevel {
  id: 3 | 4 | 5 | 6
  title: string
  grade: string
  dens: number[]
}

export const FR_LEVELS: FrLevel[] = [
  { id: 3, title: 'Mitades, tercios y cuartos', grade: '3.º', dens: [2, 3, 4] },
  { id: 4, title: 'Fracciones propias', grade: '4.º', dens: [2, 3, 4, 5, 6, 8, 10] },
  { id: 5, title: 'Impropias y mixtas', grade: '5.º', dens: [2, 3, 4, 5, 6, 8, 10] },
  { id: 6, title: 'Equivalentes, decimales y %', grade: '6.º', dens: [2, 3, 4, 5, 6, 8, 10, 12] }
]
export const levelOf = (id: number): FrLevel => FR_LEVELS.find((l) => l.id === id) ?? FR_LEVELS[0]

/** Un número que se puede mostrar como fracción, número mixto, decimal o porcentaje */
export type Val =
  | { t: 'f'; n: number; d: number }
  | { t: 'm'; w: number; n: number; d: number }
  | { t: 'dec'; x: number }
  | { t: 'pct'; x: number }

export const numeric = (v: Val): number =>
  v.t === 'f' ? v.n / v.d : v.t === 'm' ? v.w + v.n / v.d : v.t === 'dec' ? v.x : v.x / 100

export const decText = (x: number): string => String(Math.round(x * 1000) / 1000).replace('.', ',')
export const valText = (v: Val): string =>
  v.t === 'f'
    ? `${v.n}/${v.d}`
    : v.t === 'm'
      ? `${v.w} ${v.n}/${v.d}`
      : v.t === 'dec'
        ? decText(v.x)
        : `${v.x}\u00A0%`

export const sameValue = (a: Val, b: Val): boolean => Math.abs(numeric(a) - numeric(b)) < 1e-9

const DEN_SING: Record<number, string> = {
  2: 'medio',
  3: 'tercio',
  4: 'cuarto',
  5: 'quinto',
  6: 'sexto',
  7: 'séptimo',
  8: 'octavo',
  9: 'noveno',
  10: 'décimo',
  12: 'doceavo',
  20: 'veinteavo',
  100: 'centésimo'
}

/** «tres cuartos», «un medio», «cinco novenos» */
export function fracWords(n: number, d: number): string {
  const den = DEN_SING[d] ?? `${d}avo`
  const num = n === 1 ? 'un' : numberWords(n, true)
  return `${num} ${n === 1 ? den : `${den}s`}`
}

export const valWords = (v: Val): string => {
  if (v.t === 'f') return fracWords(v.n, v.d)
  if (v.t === 'm')
    return `${v.w === 1 ? 'una unidad' : `${numberWords(v.w)} unidades`} y ${fracWords(v.n, v.d)}`
  return ''
}

/** Filas y columnas de una cuadrícula con esa cantidad de partes */
export function gridDims(parts: number): { rows: number; cols: number } {
  const table: Record<number, [number, number]> = {
    1: [1, 1],
    2: [1, 2],
    3: [1, 3],
    4: [2, 2],
    5: [1, 5],
    6: [2, 3],
    7: [1, 7],
    8: [2, 4],
    9: [3, 3],
    10: [2, 5],
    12: [3, 4],
    16: [4, 4],
    20: [4, 5],
    100: [10, 10]
  }
  const [rows, cols] = table[parts] ?? [1, parts]
  return { rows, cols }
}
