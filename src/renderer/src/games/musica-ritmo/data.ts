import { shuffle } from '../../lib/games/shuffle'
import { randomInt } from '../../lib/random'
import {
  CELL_BEATS,
  FIGURES,
  beatsText,
  patternOnsets,
  type CellId,
  type FigureId,
  type OnsetMark,
  type Pattern
} from '../_musica/figures'

export interface RhythmLevel {
  id: number
  name: string
  grades: string
  timeSig: [number, number]
  cells: CellId[]
  bars: number
  bpm: number
}

/**
 * Niveles de «Eco rítmico». El programa de Educación Musical del MEP introduce en 1.º y 2.º el pulso y el ritmo con
 * negras y corcheas, en 3.º el silencio de negra y los compases, y en 4.º la blanca y el compás de 4/4.
 */
export const RHYTHM_LEVELS: RhythmLevel[] = [
  {
    id: 1,
    name: 'Negras y corcheas',
    grades: '1.º y 2.º',
    timeSig: [2, 4],
    cells: ['q', 'ee'],
    bars: 2,
    bpm: 72
  },
  {
    id: 2,
    name: 'Con silencios',
    grades: '2.º y 3.º',
    timeSig: [2, 4],
    cells: ['q', 'ee', 'qr'],
    bars: 2,
    bpm: 72
  },
  {
    id: 3,
    name: 'Compás de 3/4',
    grades: '3.º y 4.º',
    timeSig: [3, 4],
    cells: ['q', 'ee', 'qr', 'h'],
    bars: 2,
    bpm: 76
  },
  {
    id: 4,
    name: 'Compás de 4/4',
    grades: '4.º a 6.º',
    timeSig: [4, 4],
    cells: ['q', 'ee', 'qr', 'h'],
    bars: 2,
    bpm: 80
  }
]

const WEIGHT: Record<CellId, number> = { q: 4, ee: 3, qr: 1.4, h: 2, w: 1, hr: 0.6 }

function weighted(cells: CellId[]): CellId {
  const total = cells.reduce((s, c) => s + WEIGHT[c], 0)
  let r = Math.random() * total
  for (const c of cells) {
    r -= WEIGHT[c]
    if (r <= 0) return c
  }
  return cells[0]
}

const same = (a: Pattern, b: Pattern): boolean => JSON.stringify(a) === JSON.stringify(b)

/** Patrón al azar: empieza con un sonido (no con un silencio), con al menos tres sonidos y sin repetir el anterior */
export function makePattern(level: RhythmLevel, avoid?: Pattern): Pattern {
  for (let tries = 0; tries < 60; tries++) {
    const pattern: Pattern = []
    for (let b = 0; b < level.bars; b++) {
      const bar: CellId[] = []
      let left = level.timeSig[0]
      while (left > 0) {
        const fits = level.cells.filter((c) => CELL_BEATS[c] <= left)
        const cell = weighted(fits)
        bar.push(cell)
        left -= CELL_BEATS[cell]
      }
      pattern.push(bar)
    }
    const first = pattern[0][0]
    if (first === 'qr' || first === 'hr') continue
    if (patternOnsets(pattern).length < 3) continue
    if (level.cells.includes('ee') && !pattern.flat().includes('ee') && tries < 30) continue
    if (avoid && same(pattern, avoid)) continue
    return pattern
  }
  return Array.from({ length: level.bars }, () => Array<CellId>(level.timeSig[0]).fill('q'))
}

export interface Evaluation {
  marks: OnsetMark[]
  /** Golpes que no correspondían a ningún sonido */
  extra: number
  stars: 0 | 1 | 2 | 3
  /** Desfase promedio que se perdonó (en tiempos): cuánto adelantó o atrasó la persona en general */
  offset: number
}

/** Tolerancias en tiempos de negra: «muy bien» hasta 0,17 y «bien» hasta 0,32 */
export const GREAT = 0.17
export const OK = 0.32

const median = (xs: number[]): number => {
  const s = [...xs].sort((a, b) => a - b)
  return s.length ? s[Math.floor(s.length / 2)] : 0
}

/**
 * Compara los golpes de la persona con los sonidos del patrón (ambos en tiempos desde el inicio).
 * Se perdona un desfase constante (por ejemplo, por el retraso del audio o del teclado).
 */
export function evaluate(expected: number[], taps: number[]): Evaluation {
  // 1.º: emparejar con una ventana amplia para medir el desfase general
  const pair = (offset: number, window: number): { err: number | null; tap: number }[] => {
    const used = new Set<number>()
    const out: { err: number | null; tap: number }[] = expected.map(() => ({ err: null, tap: -1 }))
    const order = expected.map((e, i) => ({ e, i }))
    // cada sonido toma el golpe libre más cercano
    const candidates: { d: number; i: number; j: number }[] = []
    order.forEach(({ e, i }) =>
      taps.forEach((t, j) => {
        const d = Math.abs(t - offset - e)
        if (d <= window) candidates.push({ d, i, j })
      })
    )
    candidates.sort((a, b) => a.d - b.d)
    const done = new Set<number>()
    for (const c of candidates) {
      if (done.has(c.i) || used.has(c.j)) continue
      done.add(c.i)
      used.add(c.j)
      out[c.i] = { err: taps[c.j] - offset - expected[c.i], tap: c.j }
    }
    return out
  }
  const rough = pair(0, 0.45)
  const errs = rough.filter((r) => r.err !== null).map((r) => r.err as number)
  const offset = errs.length >= 2 ? Math.max(-0.12, Math.min(0.12, median(errs))) : 0
  const fine = pair(offset, OK)
  const marks: OnsetMark[] = fine.map((r) =>
    r.err === null ? 'miss' : Math.abs(r.err) <= GREAT ? 'great' : 'ok'
  )
  const matched = fine.filter((r) => r.err !== null).length
  const extra = taps.length - matched
  const misses = marks.filter((m) => m === 'miss').length
  const greats = marks.filter((m) => m === 'great').length
  let stars: 0 | 1 | 2 | 3 = 0
  if (misses === 0 && extra === 0 && greats >= Math.ceil(expected.length * 0.7)) stars = 3
  else if (misses === 0 && extra <= 1) stars = 2
  else if (matched >= Math.ceil(expected.length * 0.6) && extra <= 2) stars = 1
  return { marks, extra, stars, offset }
}

// ---------------------------------------------------------------- ¿Qué figura es?

export interface FigureLevel {
  id: number
  name: string
  grades: string
  figures: FigureId[]
}

export const FIGURE_LEVELS: FigureLevel[] = [
  {
    id: 1,
    name: 'Negra, corchea y blanca',
    grades: '2.º y 3.º',
    figures: ['negra', 'corchea', 'blanca', 'sNegra']
  },
  {
    id: 2,
    name: 'Redonda y semicorchea',
    grades: '4.º',
    figures: ['negra', 'corchea', 'blanca', 'redonda', 'semicorchea', 'sNegra', 'sBlanca']
  },
  {
    id: 3,
    name: 'Con puntillo y todos los silencios',
    grades: '5.º y 6.º',
    figures: [
      'redonda',
      'blanca',
      'blancaP',
      'negra',
      'negraP',
      'corchea',
      'semicorchea',
      'sRedonda',
      'sBlanca',
      'sNegra',
      'sCorchea',
      'sSemicorchea'
    ]
  }
]

export type FigureQuestion =
  | { kind: 'name'; figure: FigureId; options: string[]; answer: number }
  | { kind: 'beats'; figure: FigureId; options: string[]; answer: number }
  | { kind: 'draw'; figure: FigureId; options: FigureId[]; answer: number }

const ALL_BEATS = [0.25, 0.5, 1, 1.5, 2, 3, 4]

export function makeFigureQuestion(level: FigureLevel, avoid?: FigureId): FigureQuestion {
  const pool = level.figures.filter((f) => f !== avoid)
  const figure = pool[randomInt(0, pool.length - 1)]
  const kinds: FigureQuestion['kind'][] = ['name', 'name', 'beats', 'draw']
  const kind = kinds[randomInt(0, kinds.length - 1)]
  if (kind === 'name') {
    const others = shuffle(level.figures.filter((f) => f !== figure)).slice(0, 3)
    const options = shuffle([figure, ...others])
    return {
      kind,
      figure,
      options: options.map((f) => FIGURES[f].name),
      answer: options.indexOf(figure)
    }
  }
  if (kind === 'beats') {
    const levelBeats = [...new Set(level.figures.map((f) => FIGURES[f].beats))]
    const rest = shuffle(
      [
        ...new Set([...levelBeats, ...ALL_BEATS.filter((b) => levelBeats.length < 4 && b >= 1)])
      ].filter((b) => b !== FIGURES[figure].beats)
    ).slice(0, 3)
    const options = shuffle([FIGURES[figure].beats, ...rest])
    return {
      kind,
      figure,
      options: options.map(beatsText),
      answer: options.indexOf(FIGURES[figure].beats)
    }
  }
  const others = shuffle(level.figures.filter((f) => f !== figure)).slice(0, 3)
  const options = shuffle([figure, ...others])
  return { kind, figure, options, answer: options.indexOf(figure) }
}
