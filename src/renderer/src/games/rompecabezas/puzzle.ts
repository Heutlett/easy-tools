import { randomInt } from '../../lib/random'

/** perm[posición] = ficha que está ahí; la ficha n*n-1 es el hueco */
export type Perm = number[]

export const solvedPerm = (n: number): Perm => Array.from({ length: n * n }, (_, i) => i)
export const isSolved = (perm: Perm): boolean => perm.every((t, i) => t === i)
export const misplaced = (perm: Perm): number =>
  perm.filter((t, i) => t !== i && t !== perm.length - 1).length

/** Posiciones vecinas (arriba, abajo, izquierda, derecha) de una posición */
function neighbors(pos: number, n: number): number[] {
  const r = Math.floor(pos / n)
  const c = pos % n
  const out: number[] = []
  if (r > 0) out.push(pos - n)
  if (r < n - 1) out.push(pos + n)
  if (c > 0) out.push(pos - 1)
  if (c < n - 1) out.push(pos + 1)
  return out
}

/**
 * Mezcla con movimientos legales a partir del rompecabezas resuelto, así que siempre tiene solución.
 * Sigue hasta que haya suficientes fichas fuera de su lugar.
 */
export function shuffled(n: number): Perm {
  const perm = solvedPerm(n)
  const blank = n * n - 1
  let hole = perm.indexOf(blank)
  let last = -1
  let steps = 0
  const minOut = Math.ceil(n * n * 0.7)
  while (steps < n * n * 10 || misplaced(perm) < minOut) {
    const options = neighbors(hole, n).filter((p) => p !== last)
    const p = options[randomInt(0, options.length - 1)]
    perm[hole] = perm[p]
    perm[p] = blank
    last = hole
    hole = p
    steps++
  }
  return perm
}

/** Desliza la ficha de la posición `p` (y las que estén entre ella y el hueco) hacia el hueco. Devuelve null si no se puede. */
export function slide(perm: Perm, p: number, n: number): Perm | null {
  const blank = n * n - 1
  const hole = perm.indexOf(blank)
  if (p === hole) return null
  const sameRow = Math.floor(p / n) === Math.floor(hole / n)
  const sameCol = p % n === hole % n
  if (!sameRow && !sameCol) return null
  const step = sameRow ? Math.sign(p - hole) : Math.sign(p - hole) * n
  const next = [...perm]
  for (let q = hole; q !== p; q += step) next[q] = next[q + step]
  next[p] = blank
  return next
}

/** Posición de la ficha que se desliza al pulsar una flecha (la ficha se mueve en la dirección de la flecha) */
export function arrowTarget(perm: Perm, n: number, key: string): number | null {
  const hole = perm.indexOf(n * n - 1)
  const r = Math.floor(hole / n)
  const c = hole % n
  switch (key) {
    case 'ArrowLeft':
      return c < n - 1 ? hole + 1 : null
    case 'ArrowRight':
      return c > 0 ? hole - 1 : null
    case 'ArrowUp':
      return r < n - 1 ? hole + n : null
    case 'ArrowDown':
      return r > 0 ? hole - n : null
    default:
      return null
  }
}
