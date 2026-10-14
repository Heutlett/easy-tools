import { capitalize, spanishDigits, spanishNumber } from './numbers'

/** Nombre de cada letra del bingo, escrito como se pronuncia */
const LETTER_NAMES = ['Be', 'I', 'Ene', 'Ge', 'O']

/**
 * Lo que dice la voz al cantar una bolita: «Ge, cincuenta y ocho. Cinco, ocho.» (con letra, de 1 a 75) o «Cuarenta y siete. Cuatro, siete.»
 * (de 1 a 90). Si tiene dos cifras, se dice cada una. Lo usan el juego y el laboratorio de voces (tools/tts-lab) para decir lo mismo.
 */
export function bingoSpeech(n: number, variant: 75 | 90): string {
  const spelled = n >= 10 ? ` ${capitalize(spanishDigits(n))}.` : ''
  return variant === 75
    ? `${LETTER_NAMES[Math.ceil(n / 15) - 1]}, ${spanishNumber(n)}.${spelled}`
    : `${capitalize(spanishNumber(n))}.${spelled}`
}
