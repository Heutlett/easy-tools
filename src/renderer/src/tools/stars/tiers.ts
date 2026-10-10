/** Cada cuántos puntos se cambia por un emoji más grande (de mayor a menor valor) */
export const TIERS = [
  { emoji: '💯', value: 100, name: 'cien' },
  { emoji: '👑', value: 10, name: 'corona' },
  { emoji: '💎', value: 5, name: 'diamante' },
  { emoji: '⭐', value: 1, name: 'estrella' }
] as const

/** Los emojis que representan una cantidad de puntos: 15 puntos = 👑💎, 7 puntos = 💎⭐⭐ */
export function pointsToEmojis(points: number): string[] {
  const out: string[] = []
  let left = Math.max(0, Math.floor(points))
  for (const tier of TIERS) {
    const count = Math.floor(left / tier.value)
    left -= count * tier.value
    for (let i = 0; i < count; i++) out.push(tier.emoji)
  }
  return out
}

export const pointsLabel = (n: number): string => `${n} ${n === 1 ? 'punto' : 'puntos'}`
