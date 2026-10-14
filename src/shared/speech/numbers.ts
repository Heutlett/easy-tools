/** Números en palabras para las voces: así el modelo de voz no los lee en otro idioma ni se come ninguna cifra. */

const UNITS = [
  'cero',
  'uno',
  'dos',
  'tres',
  'cuatro',
  'cinco',
  'seis',
  'siete',
  'ocho',
  'nueve',
  'diez',
  'once',
  'doce',
  'trece',
  'catorce',
  'quince',
  'dieciséis',
  'diecisiete',
  'dieciocho',
  'diecinueve',
  'veinte',
  'veintiuno',
  'veintidós',
  'veintitrés',
  'veinticuatro',
  'veinticinco',
  'veintiséis',
  'veintisiete',
  'veintiocho',
  'veintinueve'
]
const TENS = [
  '',
  '',
  '',
  'treinta',
  'cuarenta',
  'cincuenta',
  'sesenta',
  'setenta',
  'ochenta',
  'noventa'
]

/** De 0 a 99 en palabras («47» → «cuarenta y siete») */
export function spanishNumber(n: number): string {
  if (n < 30) return UNITS[n]
  const t = Math.floor(n / 10)
  const u = n % 10
  return u ? `${TENS[t]} y ${UNITS[u]}` : TENS[t]
}

/** Cada cifra por separado («47» → «cuatro, siete») */
export const spanishDigits = (n: number): string =>
  [...String(n)].map((d) => UNITS[Number(d)]).join(', ')

/** Mayúscula inicial */
export const capitalize = (s: string): string => s.charAt(0).toUpperCase() + s.slice(1)
