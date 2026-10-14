import { readingTexts } from '../../../src/renderer/src/games/comprension/data/index'
import { slug, type Item } from './util'

/**
 * Comprensión de lectura: el texto completo (título y párrafos) y cada pregunta, que son los dos botones 🔊 del juego.
 * Los textos están en src/renderer/src/games/comprension/data/g1.ts … g6.ts.
 */
export function collect(): Item[] {
  const items: Item[] = []
  const seen = new Set<string>()
  for (const t of readingTexts) {
    const base = `es/comprension/${slug(t.title)}`
    if (seen.has(base))
      throw new Error(`Dos textos de comprensión tienen el mismo título: «${t.title}»`)
    seen.add(base)
    items.push({ id: base, lang: 'es', text: [t.title, ...t.paragraphs].join('\n') })
    t.questions.forEach((q, i) => items.push({ id: `${base}/q${i + 1}`, lang: 'es', text: q.text }))
  }
  return items
}
