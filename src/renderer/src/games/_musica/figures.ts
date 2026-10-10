// ---------------------------------------------------------------- Figuras y silencios

export type FigureId =
  | 'redonda'
  | 'blanca'
  | 'blancaP'
  | 'negra'
  | 'negraP'
  | 'corchea'
  | 'semicorchea'
  | 'sRedonda'
  | 'sBlanca'
  | 'sNegra'
  | 'sCorchea'
  | 'sSemicorchea'

export interface Figure {
  id: FigureId
  /** «Negra», «Silencio de negra» */
  name: string
  rest: boolean
  /** Cuánto dura, en tiempos de negra */
  beats: number
}

export const FIGURES: Record<FigureId, Figure> = {
  redonda: { id: 'redonda', name: 'Redonda', rest: false, beats: 4 },
  blanca: { id: 'blanca', name: 'Blanca', rest: false, beats: 2 },
  blancaP: { id: 'blancaP', name: 'Blanca con puntillo', rest: false, beats: 3 },
  negra: { id: 'negra', name: 'Negra', rest: false, beats: 1 },
  negraP: { id: 'negraP', name: 'Negra con puntillo', rest: false, beats: 1.5 },
  corchea: { id: 'corchea', name: 'Corchea', rest: false, beats: 0.5 },
  semicorchea: { id: 'semicorchea', name: 'Semicorchea', rest: false, beats: 0.25 },
  sRedonda: { id: 'sRedonda', name: 'Silencio de redonda', rest: true, beats: 4 },
  sBlanca: { id: 'sBlanca', name: 'Silencio de blanca', rest: true, beats: 2 },
  sNegra: { id: 'sNegra', name: 'Silencio de negra', rest: true, beats: 1 },
  sCorchea: { id: 'sCorchea', name: 'Silencio de corchea', rest: true, beats: 0.5 },
  sSemicorchea: { id: 'sSemicorchea', name: 'Silencio de semicorchea', rest: true, beats: 0.25 }
}

/** «1 tiempo», «medio tiempo», «un cuarto de tiempo»… (con la negra como un tiempo) */
export function beatsText(beats: number): string {
  if (beats === 0.5) return 'Medio tiempo'
  if (beats === 0.25) return 'Un cuarto de tiempo'
  if (beats === 1) return '1 tiempo'
  if (beats === 1.5) return '1 tiempo y medio'
  return `${beats} tiempos`
}

// ---------------------------------------------------------------- Patrones rítmicos

/** Figuras que se usan en los patrones: negra, par de corcheas, blanca, redonda y silencios */
export type CellId = 'q' | 'ee' | 'h' | 'w' | 'qr' | 'hr'

export const CELL_BEATS: Record<CellId, number> = { q: 1, ee: 1, h: 2, w: 4, qr: 1, hr: 2 }

/** Momentos (en tiempos desde el inicio de la figura) en que suena algo */
export const CELL_ONSETS: Record<CellId, number[]> = {
  q: [0],
  ee: [0, 0.5],
  h: [0],
  w: [0],
  qr: [],
  hr: []
}

export type Pattern = CellId[][]

export interface Onset {
  /** Tiempo desde el inicio del patrón */
  beat: number
  /** Posición entre las notas que suenan (0, 1, 2…) */
  index: number
}

export function patternOnsets(pattern: Pattern): Onset[] {
  const out: Onset[] = []
  let beat = 0
  for (const bar of pattern)
    for (const cell of bar) {
      for (const o of CELL_ONSETS[cell]) out.push({ beat: beat + o, index: out.length })
      beat += CELL_BEATS[cell]
    }
  return out
}

export const patternBeats = (pattern: Pattern): number =>
  pattern.reduce((sum, bar) => sum + bar.reduce((s, c) => s + CELL_BEATS[c], 0), 0)

export type OnsetMark = 'great' | 'ok' | 'miss'
