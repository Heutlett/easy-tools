import type { WordItem, WordList } from '../../content/types'
import { shuffle } from '../../lib/games/shuffle'

/** Teclado en pantalla con la distribución del español (la Ñ junto a la L), igual que el físico */
export const KEY_ROWS = ['QWERTYUIOP', 'ASDFGHJKLÑ', 'ZXCVBNM']

/** La letra en mayúscula y sin tilde ni diéresis («á» → «A», «ü» → «U»); la Ñ se conserva */
export function baseLetter(ch: string): string {
  const upper = ch.normalize('NFC').toUpperCase()
  if (upper === 'Ñ') return 'Ñ'
  return upper.normalize('NFD').replace(/[̀-ͯ]/g, '')
}

/** ¿Es una letra del abecedario español (A–Z y Ñ, con o sin tilde)? */
export const isLetter = (ch: string): boolean => /^[A-ZÑ]$/.test(baseLetter(ch))

/** Texto sin espacios repetidos ni al borde, con las letras con tilde en una sola pieza */
export const cleanText = (text: string): string => text.normalize('NFC').replace(/\s+/g, ' ').trim()

/** Solo las letras de un texto, en mayúscula y sin tildes: sirve para comparar lo que escribió alguien con la palabra */
export const lettersOnly = (text: string): string =>
  Array.from(cleanText(text)).filter(isLetter).map(baseLetter).join('')

/** Las palabras de varias listas, sin repetir, en orden al azar (se descartan las que no tienen letras) */
export function itemsFromLists(lists: WordList[]): WordItem[] {
  const seen = new Set<string>()
  const out: WordItem[] = []
  for (const list of lists) {
    for (const item of list.items) {
      const text = cleanText(item.text)
      const key = lettersOnly(text)
      if (!key || seen.has(key)) continue
      seen.add(key)
      out.push({ text, ...(item.clue ? { clue: item.clue } : {}) })
    }
  }
  return shuffle(out)
}

/** Cantidades que se pueden ofrecer según cuántas hay disponibles (la última puede ser «todas») */
export function countOptions(available: number, steps: number[]): number[] {
  const options = steps.filter((n) => n <= available)
  const top = steps[steps.length - 1]
  if (available <= top && !options.includes(available)) options.push(available)
  return options.length > 0 ? options : [available]
}

/** La opción guardada si todavía sirve; si no, la más cercana hacia abajo */
export function fitCount(saved: number, options: number[]): number {
  const fits = options.filter((n) => n <= saved)
  return fits.length > 0 ? fits[fits.length - 1] : options[0]
}
