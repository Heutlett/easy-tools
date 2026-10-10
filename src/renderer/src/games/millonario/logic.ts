import type { Difficulty, Question } from '../../content/types'
import { randomFloat, randomInt } from '../../lib/random'
import { shuffle } from '../../lib/games/shuffle'
import type { LadderSpec } from './data'

/** Resultado de un concursante */
export interface TurnResult {
  playerId?: string
  /** perdió (cae al último nivel seguro), se retiró o ganó el premio mayor */
  outcome: 'lost' | 'walked' | 'won'
  /** Colones que se lleva */
  amount: number
  /** Preguntas contestadas bien */
  answered: number
  /** Número de la pregunta (desde 1) en la que perdió, si perdió */
  lostAt?: number
}

/** ₡1 000 000: con espacio fino de miles, como se escribe en Costa Rica */
export function colones(n: number): string {
  return `₡${String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')}`
}

/** Lo que se queda quien pierde cuando iba a contestar la pregunta `level` (desde 0): el último nivel seguro superado */
export function safeFloor(spec: LadderSpec, level: number): number {
  let floor = 0
  for (const s of spec.safe) if (s < level) floor = Math.max(floor, spec.prizes[s])
  return floor
}

/** Lo ganado hasta ahora (preguntas contestadas bien) cuando se va a contestar la pregunta `level` */
export const wonSoFar = (spec: LadderSpec, level: number): number =>
  level > 0 ? spec.prizes[level - 1] : 0

/**
 * Arma una escalera de preguntas de dificultad creciente (tantas de nivel 1, 2 y 3 como pida `spec.targets`).
 * Prefiere preguntas que no se han usado (`usedIds`); si el filtro no alcanza, completa con las de dificultad más
 * cercana y, solo si no queda otra, repite alguna ya usada en un turno anterior. Nunca repite dentro de la escalera.
 */
export function buildLadder(pool: Question[], usedIds: string[], spec: LadderSpec): Question[] {
  const total = spec.prizes.length
  const used = new Set(usedIds)
  const fresh = pool.filter((q) => !used.has(q.id))
  let chosen = selectByDifficulty(fresh, spec.targets, total)
  if (chosen.length < total) {
    const taken = new Set(chosen.map((q) => q.id))
    const rest = pool.filter((q) => !taken.has(q.id))
    chosen = [...chosen, ...selectByDifficulty(rest, spec.targets, total - chosen.length)]
  }
  // De la más fácil a la más difícil (el orden es estable, así que dentro de cada nivel queda al azar)
  return [...chosen].sort((a, b) => a.difficulty - b.difficulty)
}

function selectByDifficulty(
  candidates: Question[],
  targets: [number, number, number],
  total: number
): Question[] {
  const shuffled = shuffle(candidates)
  const chosen: Question[] = []
  const taken = new Set<string>()
  const take = (q: Question): void => {
    chosen.push(q)
    taken.add(q.id)
  }
  // Se reducen proporcionalmente las metas si se piden menos de las de la escalera completa
  const goals = targets.map((t) => Math.min(t, total)) as [number, number, number]
  ;([1, 2, 3] as Difficulty[]).forEach((d, i) => {
    shuffled
      .filter((q) => q.difficulty === d && !taken.has(q.id))
      .slice(0, goals[i])
      .forEach(take)
  })
  // Lo que falte se completa con las de dificultad más cercana a la que faltó
  ;([1, 2, 3] as Difficulty[]).forEach((d, i) => {
    const missing = goals[i] - chosen.filter((q) => q.difficulty === d).length
    if (missing <= 0) return
    shuffled
      .filter((q) => !taken.has(q.id))
      .sort((a, b) => Math.abs(a.difficulty - d) - Math.abs(b.difficulty - d))
      .slice(0, missing)
      .forEach(take)
  })
  return chosen.slice(0, total)
}

/**
 * Votos simulados de «Ayuda del público», en porcentaje (suman 100 entre las opciones visibles; el resto, 0).
 * En lo fácil casi siempre gana la correcta; en lo difícil el público duda y a veces se equivoca.
 */
export function simulateAudience(
  difficulty: Difficulty,
  answer: number,
  visible: number[]
): number[] {
  const range: Record<Difficulty, [number, number]> = { 1: [55, 82], 2: [36, 62], 3: [18, 44] }
  const [lo, hi] = range[difficulty]
  const others = visible.filter((i) => i !== answer)
  let correct = randomInt(lo, hi)
  if (others.length === 1) correct = Math.min(94, correct + 20)
  const weights = others.map(() => randomInt(1, 10))
  const sum = weights.reduce((a, b) => a + b, 0)
  const shares = new Map<number, number>()
  others.forEach((o, i) => shares.set(o, ((100 - correct) * weights[i]) / sum))
  const misled = difficulty === 3 ? 0.3 : difficulty === 2 ? 0.1 : 0
  if (others.length > 0 && randomFloat() < misled) {
    const decoy = others.reduce((a, b) => (shares.get(a)! >= shares.get(b)! ? a : b))
    const decoyShare = shares.get(decoy)!
    shares.set(decoy, correct)
    correct = decoyShare
  }
  const out = [0, 0, 0, 0]
  out[answer] = Math.round(correct)
  others.forEach((o) => (out[o] = Math.round(shares.get(o)!)))
  // Ajuste por redondeo para que sumen exactamente 100
  const top = visible.reduce((a, b) => (out[a] >= out[b] ? a : b))
  out[top] += 100 - out.reduce((a, b) => a + b, 0)
  return out
}
