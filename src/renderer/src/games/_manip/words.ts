const NUMS = [
  '',
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
const TENS: Record<number, string> = { 3: 'treinta', 4: 'cuarenta', 5: 'cincuenta' }

/** Número de 1 a 59 en palabras; `apocope` convierte «uno» en «un» (un minuto) */
export function numberWords(n: number, apocope = false): string {
  let w: string
  if (n < 30) w = NUMS[n]
  else {
    const t = Math.floor(n / 10)
    const u = n % 10
    w = u === 0 ? TENS[t] : `${TENS[t]} y ${NUMS[u]}`
  }
  if (apocope) w = w.replace(/veintiuno$/, 'veintiún').replace(/uno$/, 'un')
  return w
}
