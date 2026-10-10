import { randomInt } from '../../lib/random'
import { shuffle } from '../../lib/games/shuffle'

export const mod = (n: number, m: number): number => ((n % m) + m) % m
export const gcd = (a: number, b: number): number => (b === 0 ? Math.abs(a) : gcd(b, a % b))
export const lcm = (a: number, b: number): number => (a / gcd(a, b)) * b
export const rand = randomInt
export const chance = (p: number): boolean => randomInt(0, 999) < p * 1000
export const oneOf = <T>(items: readonly T[]): T => items[randomInt(0, items.length - 1)]

/** Toma de a uno de los candidatos (en orden al azar) hasta juntar `count` que cumplan `ok` y no se repitan según `key` */
export function takeUnique<T>(
  candidates: readonly T[],
  count: number,
  key: (item: T) => string,
  taken: string[] = []
): T[] {
  const seen = new Set(taken)
  const out: T[] = []
  for (const c of shuffle(candidates)) {
    const k = key(c)
    if (seen.has(k)) continue
    seen.add(k)
    out.push(c)
    if (out.length === count) break
  }
  return out
}
