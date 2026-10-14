import { families } from '../../../src/renderer/src/games/trabalenguas/rhymes'
import { twisters } from '../../../src/renderer/src/games/trabalenguas/twisterList'
import { verses } from '../../../src/renderer/src/games/trabalenguas/verses'
import { slug, type Item } from './util'

/**
 * Trabalenguas y rimas. El juego dice:
 *  - cada trabalenguas, a tres velocidades (lento, normal y rápido): id es/trabalenguas/<id>, con versión lenta y rápida;
 *  - la palabra de «Busca la rima» (id es/palabras/<palabra>, compartido con lectura por sílabas);
 *  - el verso completo de «Complete la rima», con la palabra correcta puesta (id es/trabalenguas/<id del verso>).
 * Fuentes: games/trabalenguas/twisterList.ts, rhymes.ts y verses.ts.
 */
export function collect(): Item[] {
  const items: Item[] = []
  const variants: ('slow' | 'fast')[] = ['slow', 'fast']
  for (const t of twisters)
    items.push({ id: `es/trabalenguas/${t.id}`, lang: 'es', text: t.text, variants })
  for (const f of families)
    for (const word of f.words)
      items.push({ id: `es/palabras/${slug(word)}`, lang: 'es', text: word })
  for (const v of verses) {
    // Igual que el juego: la palabra correcta (la primera opción) en el hueco y las líneas unidas con punto
    const filled = v.lines.map((l) => l.replace('___', v.options[0])).join('. ')
    items.push({ id: `es/trabalenguas/${v.id}`, lang: 'es', text: filled })
  }
  return items
}
