import { createHash } from 'node:crypto'

/** Un texto que hay que convertir en audio */
export interface Item {
  /** Identificador estable: idioma/juego/nombre. El juego usa el mismo id para encontrar su audio. */
  id: string
  lang: 'es' | 'en'
  text: string
  /**
   * Otras velocidades que el juego ofrece: `slow` (despacio, botón 🐢 o «lento») y `fast` (rápido). Se generan como `<id>.<nombre>.opus`
   * estirando el audio normal (el tono no cambia); las velocidades exactas están en `TEMPOS` de generate.py.
   */
  variants?: ('slow' | 'fast')[]
}

/** «Cómo hacer un barco de papel» → «como-hacer-un-barco-de-papel» (sin tildes, para usarlo en nombres de archivo) */
export function slug(text: string, max = 56): string {
  const base = text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  if (base.length <= max) return base || 'x'
  // Si se corta, se agrega una huella corta para que dos textos largos parecidos no choquen
  return `${base.slice(0, max).replace(/-+$/, '')}-${createHash('sha1').update(text).digest('hex').slice(0, 6)}`
}

export { capitalize, spanishDigits, spanishNumber } from '../../../src/shared/speech/numbers'
