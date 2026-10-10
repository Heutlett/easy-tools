import { randomInt } from '../../lib/random'

export type Tab = 'dados' | 'moneda' | 'colores' | 'personalizado'

export const TABS: { id: Tab; icon: string; title: string }[] = [
  { id: 'dados', icon: '🎲', title: 'Dados' },
  { id: 'moneda', icon: '🪙', title: 'Moneda' },
  { id: 'colores', icon: '🎨', title: 'Dado de colores' },
  { id: 'personalizado', icon: '✏️', title: 'Dado propio' }
]

export interface Config {
  tab: Tab
  /** Cuántos dados o monedas se lanzan a la vez (1 a 3) */
  count: number
  /** Caras de los dados numéricos */
  sides: 6 | 10 | 12
  /** Qué cuenta el gráfico con varios dados: cada cara o la suma */
  chart: 'face' | 'sum'
}

export const DEFAULT_CONFIG: Config = { tab: 'dados', count: 1, sides: 6, chart: 'face' }

export const SIDES: Config['sides'][] = [6, 10, 12]

export const COIN_FACES = ['Cara', 'Sello']

export const COLOR_FACES: { name: string; color: string; dark?: boolean }[] = [
  { name: 'Rojo', color: '#dc2626' },
  { name: 'Amarillo', color: '#facc15', dark: true },
  { name: 'Verde', color: '#16a34a' },
  { name: 'Azul', color: '#2563eb' },
  { name: 'Naranja', color: '#f97316' },
  { name: 'Morado', color: '#7c3aed' }
]

export const MIN_FACES = 2
export const MAX_FACES = 12

export const PRESETS: { id: string; title: string; faces: string[] }[] = [
  {
    id: 'acciones',
    title: '🏃 Acciones',
    faces: ['Salta', 'Aplaude', 'Gira', 'Baila', 'Canta', 'Silencio']
  },
  { id: 'letras', title: '🔤 Letras', faces: ['A', 'E', 'I', 'O', 'U', 'M'] },
  {
    id: 'si-no',
    title: '❓ Sí o no',
    faces: ['Sí', 'No', 'Quizás', 'Sí', 'No', 'Pregunta otra vez']
  },
  {
    id: 'emociones',
    title: '😀 Emociones',
    faces: ['Alegre', 'Triste', 'Enojado', 'Sorprendido', 'Tranquilo', 'Asustado']
  },
  { id: 'operaciones', title: '➕ Operaciones', faces: ['+', '−', '×', '÷'] }
]

/**
 * Posición de cada cara de un cubo: 0 al frente, 1 arriba, 2 a la derecha, 3 a la izquierda, 4 abajo, 5 atrás.
 * En el dado normal la cara i es el número i + 1 (las opuestas suman 7).
 */
export const FACE_ROTATION: [number, number][] = [
  [0, 0],
  [-90, 0],
  [0, -90],
  [0, 90],
  [90, 0],
  [0, 180]
]

/** Puntos del dado en una cuadrícula de 3 × 3 (celdas 1 a 9) */
export const PIPS: Record<number, number[]> = {
  1: [5],
  2: [1, 9],
  3: [1, 5, 9],
  4: [1, 3, 7, 9],
  5: [1, 3, 5, 7, 9],
  6: [1, 3, 4, 6, 7, 9]
}

const mod = (n: number, m: number): number => ((n % m) + m) % m

export interface Rotation {
  x: number
  y: number
}

/** Giro nuevo que termina con la cara pedida al frente, siempre dando vueltas completas hacia adelante */
export function nextRotation(prev: Rotation, face: number): Rotation {
  const [tx, ty] = FACE_ROTATION[face]
  return {
    x: prev.x + 360 * randomInt(1, 2) + mod(tx - prev.x, 360),
    y: prev.y + 360 * randomInt(1, 2) + mod(ty - prev.y, 360)
  }
}

/** Giro de la moneda: cara (0) o sello (1) */
export function nextCoinRotation(prev: number, face: number): number {
  return prev + 360 * randomInt(4, 6) + mod(face * 180 - prev, 360)
}

/** De cuántas maneras se puede obtener cada suma al lanzar `count` dados de `sides` caras (empieza en count) */
export function sumWays(count: number, sides: number): number[] {
  let ways = [1]
  for (let d = 0; d < count; d++) {
    const next = new Array(ways.length + sides - 1).fill(0)
    ways.forEach((w, i) => {
      for (let f = 0; f < sides; f++) next[i + f] += w
    })
    ways = next
  }
  return ways
}

export interface Roll {
  id: number
  /** Cara que salió en cada dado o moneda */
  faces: number[]
  /** Quién lanzó, si se juega por turnos */
  by?: string
}
