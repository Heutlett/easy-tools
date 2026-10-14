import { bingoSpeech } from '../../../src/shared/speech/bingo'
import type { Item } from './util'

/** Los cantos del Bingo (75 con letra y 90 sin letra): el texto lo arma `bingoSpeech`, el mismo que usa el juego. */
export function collect(): Item[] {
  const items: Item[] = []
  for (let n = 1; n <= 75; n++)
    items.push({ id: `es/bingo/75-${n}`, lang: 'es', text: bingoSpeech(n, 75) })
  for (let n = 1; n <= 90; n++)
    items.push({ id: `es/bingo/90-${n}`, lang: 'es', text: bingoSpeech(n, 90) })
  return items
}
