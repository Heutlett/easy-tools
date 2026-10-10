import { gcd, oneOf, rand } from '../_manip/util'
import { money, type Denom, type MoneyLevel } from './data'

/** Medidas relativas: una moneda es cuadrada (crece con el valor) y un billete es 2:1 */
export const pieceSize = (d: Denom, scale = 1): { w: number; h: number } =>
  d.kind === 'coin'
    ? { w: 76 * (d.size ?? 1) * scale, h: 76 * (d.size ?? 1) * scale }
    : { w: 128 * scale, h: 64 * scale }

/** Menor cantidad de piezas que forman el monto (null si no se puede) */
export function minPieces(amount: number, denoms: number[]): number[] | null {
  const unit = denoms.reduce((a, b) => gcd(a, b))
  if (amount % unit) return null
  const n = amount / unit
  const best: number[] = Array(n + 1).fill(Infinity)
  const from: number[] = Array(n + 1).fill(0)
  best[0] = 0
  for (let a = 1; a <= n; a++)
    for (const d of denoms) {
      const k = d / unit
      if (k <= a && best[a - k] + 1 < best[a]) {
        best[a] = best[a - k] + 1
        from[a] = d
      }
    }
  if (!isFinite(best[n])) return null
  const out: number[] = []
  for (let a = n; a > 0; a -= from[a] / unit) out.push(from[a])
  return out
}

/** «2 × ₡500 + ₡100» */
export function describe(values: number[]): string {
  const counts = new Map<number, number>()
  for (const v of [...values].sort((a, b) => b - a)) counts.set(v, (counts.get(v) ?? 0) + 1)
  return [...counts].map(([v, n]) => (n > 1 ? `${n} × ${money(v)}` : money(v))).join(' + ')
}

/** Un montón al azar para el nivel: devuelve las piezas y el total */
export function randomPile(level: MoneyLevel): { values: number[]; total: number } {
  for (let i = 0; i < 400; i++) {
    const n = rand(level.pieces[0], level.pieces[1])
    const values: number[] = []
    for (let k = 0; k < n; k++) values.push(oneOf(level.denoms))
    const total = values.reduce((a, b) => a + b, 0)
    const hasBill = values.some((v) => v >= 1000)
    const kinds = new Set(values).size
    if (total > level.max || total < (level.id === 1 ? 30 : 60)) continue
    if (level.id >= 3 && !hasBill) continue
    if (kinds < 2) continue
    return { values, total }
  }
  return { values: [50, 25, 10], total: 85 }
}
