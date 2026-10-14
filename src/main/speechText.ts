/**
 * Prepara un texto para leerlo en voz alta: lo parte en trozos cortos (por oraciones, de hasta `max` caracteres).
 * El modelo se equivoca mucho más con trozos largos (se queda pegado, se come palabras o repite): en las pruebas con los textos
 * de comprensión de lectura, los trozos de 140 caracteres fallaron en 8 % de las palabras y los de 300 o más, en 13 a 15 %.
 */
/** Largo del primer trozo, más corto que los demás */
const FIRST = 70
/** Las frases más cortas que esto se unen con la siguiente */
const MIN = 14
const END = /[^.!?…]+[.!?…]*[»”")\]]*/g

/** Une trozos cortos seguidos mientras no pasen de `max` */
function pack(pieces: string[], max: number): string[] {
  const out: string[] = []
  let cur = ''
  for (const p of pieces) {
    if (cur && cur.length + 1 + p.length > max) {
      out.push(cur)
      cur = p
    } else cur = cur ? `${cur} ${p}` : p
  }
  if (cur) out.push(cur)
  return out
}

/** Parte una oración larga en comas y punto y coma y, si hace falta, en espacios */
function breakLong(sentence: string, max: number): string[] {
  const byComma = sentence.split(/(?<=[,;:])\s+/)
  const pieces = byComma.flatMap((p) => {
    if (p.length <= max) return [p]
    return pack(p.split(/\s+/), max)
  })
  return pack(pieces, max)
}

/** Un trozo de texto para leer y cuánto silencio dejar después (ms) */
export interface Phrase {
  text: string
  pause: number
}

/**
 * Pausas que deja la voz: Piper casi no las hace por sí solo (en las pruebas, 5 veces menos que Supertonic) y se oía todo seguido.
 * Se parte el texto en frases y se deja un silencio de verdad entre ellas.
 */
export const PAUSE = { comma: 180, sentence: 350, paragraph: 600 }

/**
 * Parte un texto en frases para leerlo: por párrafos, oraciones y comas, con la pausa que corresponde después de cada una.
 * Las frases cortas se unen con la siguiente, las largas se parten (hasta `max` caracteres), y la primera es corta para que la voz
 * empiece a sonar enseguida (el modelo se equivoca mucho más con trozos largos: 8 % de palabras con 140 caracteres y 13 a 15 % con 300).
 */
export function splitForSpeech(raw: string, max = 140): Phrase[] {
  const text = raw
    .replace(/\r/g, '')
    .replace(/[ \t]+/g, ' ')
    // Número de lista («1. Lava…»): sin el punto, para que no se tome como el final de una oración
    .replace(/^\s*(\d+)[.)]\s+/gm, '$1: ')
    // Guion de diálogo al inicio de la línea: se quita
    .replace(/^\s*[—–]\s*/gm, '')
    // Guiones dentro de la oración («—le preguntó la chicharra—»): una pausa
    .replace(/\s*[—–]\s*/g, ', ')
    .replace(/,\s*([.!?…])/g, '$1')
    .replace(/([.!?…])\s*,\s*/g, '$1 ')
    // Puntos repetidos («refrescos..») o pegados a dos puntos («Preparación:.») no son pausas distintas
    .replace(/([:;,])\s*\./g, '$1')
    .replace(/\.{2,}/g, '.')
  const lines = text
    .split(/\n+/)
    .map((l) => l.trim())
    .filter((l) => /[\p{L}\p{N}]/u.test(l))

  const phrases: Phrase[] = []
  lines.forEach((line, li) => {
    const sentences = (line.match(END) ?? [])
      .map((x) => x.trim())
      .filter((x) => /[\p{L}\p{N}]/u.test(x))
    sentences.forEach((sentence, si) => {
      const parts = sentence.split(/(?<=[,;:])\s+/).filter(Boolean)
      parts.forEach((part, pi) => {
        const lastPart = pi === parts.length - 1
        const lastSentence = si === sentences.length - 1
        const pause = !lastPart
          ? PAUSE.comma
          : lastSentence && li < lines.length - 1
            ? PAUSE.paragraph
            : PAUSE.sentence
        // Una frase muy larga se parte en trozos de a lo más `max` caracteres
        const pieces = part.length <= max ? [part] : breakLong(part, max)
        pieces.forEach((piece, k) =>
          phrases.push({ text: piece, pause: k === pieces.length - 1 ? pause : PAUSE.comma })
        )
      })
    })
  })

  // Las frases muy cortas («Sí,», «Hola.») se unen con la siguiente para no sonar entrecortado
  const merged: Phrase[] = []
  for (const p of phrases) {
    const prev = merged[merged.length - 1]
    if (prev && prev.text.length < MIN && prev.text.length + 1 + p.text.length <= max) {
      prev.text = `${prev.text} ${p.text}`
      prev.pause = p.pause
    } else merged.push({ ...p })
  }

  // La primera frase es corta, para que la voz empiece a sonar enseguida
  if (merged.length && merged[0].text.length > FIRST) {
    const parts = breakLong(merged[0].text, FIRST)
    merged.splice(
      0,
      1,
      { text: parts[0], pause: PAUSE.comma },
      ...(parts.length > 1 ? [{ text: parts.slice(1).join(' '), pause: merged[0].pause }] : [])
    )
    if (parts.length === 1) merged[0].pause = merged[1]?.pause ?? PAUSE.sentence
  }
  return merged
}

/* ---------- Números en español ---------- */

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
const HUNDREDS = [
  '',
  'ciento',
  'doscientos',
  'trescientos',
  'cuatrocientos',
  'quinientos',
  'seiscientos',
  'setecientos',
  'ochocientos',
  'novecientos'
]

/** De 0 a 999 */
function below1000(n: number): string {
  if (n === 100) return 'cien'
  const h = Math.floor(n / 100)
  const r = n % 100
  const parts: string[] = []
  if (h) parts.push(HUNDREDS[h])
  if (r) {
    if (r < 30) parts.push(UNITS[r])
    else {
      const t = Math.floor(r / 10)
      const u = r % 10
      parts.push(u ? `${TENS[t]} y ${UNITS[u]}` : TENS[t])
    }
  }
  return parts.join(' ')
}

/** Un entero como lo dice una persona («1500» → «mil quinientos»); los muy grandes se dicen cifra por cifra */
export function spanishNumber(n: number): string {
  if (!Number.isFinite(n) || n < 0 || n >= 1e12)
    return [...String(Math.trunc(Math.abs(n)))].map((d) => UNITS[Number(d)]).join(' ')
  if (n < 1000) return n === 0 ? 'cero' : below1000(n)
  const millions = Math.floor(n / 1e6)
  const thousands = Math.floor((n % 1e6) / 1000)
  const rest = n % 1000
  const parts: string[] = []
  if (millions) parts.push(millions === 1 ? 'un millón' : `${spanishNumber(millions)} millones`)
  if (thousands) parts.push(thousands === 1 ? 'mil' : `${below1000(thousands)} mil`)
  if (rest) parts.push(below1000(rest))
  // «uno» delante de «mil» o «millones» pierde la o («veintiún mil», «treinta y un mil»)
  return parts
    .join(' ')
    .replace(/veintiuno (mil|millones)/g, 'veintiún $1')
    .replace(/uno (mil|millones)/g, 'un $1')
}

const ORDINALS = [
  '',
  'primero',
  'segundo',
  'tercero',
  'cuarto',
  'quinto',
  'sexto',
  'séptimo',
  'octavo',
  'noveno',
  'décimo'
]

/**
 * El modelo lee las cifras en inglés aunque el texto sea en español («47» sale «forty-seven», «58» sale «fitch i sinkle»): se escriben
 * con letras antes de generar. También los signos de las cuentas, los colones y los porcentajes.
 */
export function expandNumbersEs(raw: string): string {
  let text = raw
    // Colones: «₡500» o «₡ 1.500.000»
    .replace(/₡\s*(\d[\d. ]*\d|\d)/g, (_m, n: string) => `${n} colones`)
    // Ordinales: «1.º», «3.ª», «2º»
    .replace(/(\d+)\s*\.?\s*([ºª])/g, (_m, n: string, o: string) => {
      const k = Number(n)
      const w = ORDINALS[k]
      if (!w) return spanishNumber(k)
      return o === 'ª' ? w.replace(/o$/, 'a') : w
    })
    // Signos de las cuentas
    .replace(/×|\s[xX*]\s/g, ' por ')
    .replace(/÷/g, ' entre ')
    .replace(/(\d)\s*\+\s*(?=\d)/g, '$1 más ')
    .replace(/(\d)\s+[-−–]\s+(?=\d)/g, '$1 menos ')
    .replace(/\s*=\s*/g, ' es igual a ')
    // Porcentajes
    .replace(/(\d)\s*%/g, '$1 por ciento')
    // Horas: «3:30»
    .replace(/\b(\d{1,2}):(\d{2})\b/g, (_m, h: string, m: string) =>
      m === '00'
        ? `${spanishNumber(Number(h))} en punto`
        : `${spanishNumber(Number(h))} y ${spanishNumber(Number(m))}`
    )
  // Miles con punto o espacio: «1.500», «100 000» (grupos de tres cifras)
  text = text.replace(/\b\d{1,3}(?:[. ]\d{3})+\b/g, (m) => m.replace(/[. ]/g, ''))
  // Decimales con coma o punto: «3,5» «2.5»
  text = text.replace(/\b(\d+)[,.](\d{1,2})\b(?!\d)/g, (_m, a: string, b: string) => {
    const dec =
      b.length === 2 && b.startsWith('0')
        ? `cero ${spanishNumber(Number(b))}`
        : spanishNumber(Number(b))
    return `${spanishNumber(Number(a))} coma ${dec}`
  })
  // Enteros
  text = text.replace(/\d+/g, (m, offset: number, whole: string) => {
    const words = spanishNumber(Number(m))
    // «uno» antes de un sustantivo se dice «un» o «una» («21 niños» → «veintiún niños», «21 niñas» → «veintiuna niñas»)
    const next = /^\s+([\p{L}]+)/u.exec(whole.slice(offset + m.length))?.[1]?.toLowerCase()
    if (
      next &&
      /uno$/.test(words) &&
      !/^(y|o|coma|por|más|menos|entre|es|colones|por)$/.test(next)
    ) {
      const fem = /(as|a)$/.test(next) && next.length > 2
      return fem
        ? words.replace(/uno$/, 'una')
        : words.replace(/veintiuno$/, 'veintiún').replace(/uno$/, 'un')
    }
    return words
  })
  return text.replace(/ {2,}/g, ' ')
}
