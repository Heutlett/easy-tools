/**
 * Mide cuánto ocupa un texto con una letra "normal" (sin espacio extra entre letras) para compararlo con lo que
 * mide en el PDF. La diferencia se reparte entre las letras y así el texto en Word ocupa lo mismo que en el PDF.
 * Solo se mide con letras que existen en el equipo; si no, el resultado sería engañoso.
 */
let context: CanvasRenderingContext2D | null | undefined
const available = new Map<string, boolean>()

function ctx(): CanvasRenderingContext2D | null {
  if (context === undefined) {
    context =
      typeof document === 'undefined' ? null : document.createElement('canvas').getContext('2d')
  }
  return context
}

const SAMPLE = 'mmmmmmmmmmlliWWW0123456789'

function hasFont(family: string): boolean {
  const c = ctx()
  if (!c) return false
  const cached = available.get(family)
  if (cached !== undefined) return cached
  c.font = `72px "${family}", monospace`
  const mono = c.measureText(SAMPLE).width
  c.font = `72px "${family}", serif`
  const serif = c.measureText(SAMPLE).width
  // Si la letra no existe, los dos resultados coinciden con las de reemplazo (distintas entre sí)
  c.font = '72px monospace'
  const monoOnly = c.measureText(SAMPLE).width
  c.font = '72px serif'
  const serifOnly = c.measureText(SAMPLE).width
  const exists = !(mono === monoOnly && serif === serifOnly)
  available.set(family, exists)
  return exists
}

/** Ancho natural del texto en puntos, o null si no se puede medir con confianza. */
export function naturalWidth(
  text: string,
  font: string,
  size: number,
  bold?: boolean,
  italic?: boolean
): number | null {
  const c = ctx()
  if (!c || !hasFont(font)) return null
  c.font = `${italic ? 'italic ' : ''}${bold ? 'bold ' : ''}${size}px "${font}"`
  return c.measureText(text).width
}
