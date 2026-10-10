/** Escaleras de premios (en colones). `safe` son las posiciones (desde 0) de los niveles seguros. */
export interface LadderSpec {
  prizes: number[]
  safe: number[]
  /** Cuántas preguntas de dificultad 1, 2 y 3 lleva la escalera */
  targets: [number, number, number]
}

export const LADDER_15: LadderSpec = {
  prizes: [
    100, 200, 300, 500, 1_000, 2_000, 4_000, 8_000, 16_000, 32_000, 64_000, 125_000, 250_000,
    500_000, 1_000_000
  ],
  safe: [4, 9],
  targets: [5, 5, 5]
}

/** Escalera corta, para cuando se elige 10 preguntas o hay pocas */
export const LADDER_10: LadderSpec = {
  prizes: [100, 300, 500, 1_000, 2_000, 8_000, 32_000, 125_000, 500_000, 1_000_000],
  safe: [3, 6],
  targets: [3, 4, 3]
}

/** Escalera para una cantidad cualquiera de preguntas (de 5 a 15), cuando la persona las elige una por una */
export function ladderFor(count: number): LadderSpec {
  if (count >= 15) return LADDER_15
  if (count === 10) return LADDER_10
  const n = Math.max(2, count)
  // Se toman premios repartidos de la escalera grande; el último siempre es el millón
  const prizes = Array.from(
    { length: n },
    (_, i) => LADDER_15.prizes[Math.round((i * 14) / (n - 1))]
  )
  const safe = n >= 8 ? [Math.floor(n / 3), Math.floor((2 * n) / 3)] : [Math.floor(n / 2)]
  return { prizes, safe: safe.filter((x) => x < n - 1), targets: [n, 0, 0] }
}

/** Menos de esto no hace una partida; más de esto no cabe en la escalera */
export const MIN_PICKED = 5
export const MAX_PICKED = 15

/** Tiempo de «Consultar al equipo / a la clase», en segundos */
export const CONSULT_SECONDS = 30

/** Pausa de suspenso antes de revelar la respuesta, en milisegundos */
export const SUSPENSE_MS = 2400

export const PRAISE = [
  '¡Correcto!',
  '¡Muy bien!',
  '¡Excelente!',
  '¡Eso es!',
  '¡Pura vida, correcto!',
  '¡Así se hace!'
]

export const CONSOLATION = [
  'Era difícil, ¡buen intento!',
  '¡Casi! La próxima será.',
  'No pasa nada, ¡aprendimos algo nuevo!'
]
