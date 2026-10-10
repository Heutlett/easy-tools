/**
 * Preguntas escritas como texto corrido (para pegarlas desde Word o Excel).
 *
 *   ¿Cuál es la capital de Costa Rica?
 *   *San José
 *   Cartago
 *   Heredia
 *   Alajuela
 *
 *   ¿Cuánto es 2 + 2?
 *   3
 *   *4
 *   5
 *   6
 *
 * Cada pregunta es un bloque separado por una línea en blanco: la primera línea es la pregunta y las cuatro
 * siguientes son las opciones. La correcta lleva un asterisco (*) al principio. Se aceptan opciones con letra
 * («a) San José», «B. Cartago») y la pregunta con número («1. ¿Cuánto…?»).
 */
export interface ParsedQuestion {
  text: string
  options: string[]
  answer: number
}

export interface ParseResult {
  questions: ParsedQuestion[]
  /** Un mensaje por cada bloque que no se pudo leer, para que la persona sepa cuál arreglar */
  problems: string[]
}

export const BULK_EXAMPLE = `¿Cuál es la capital de Costa Rica?
*San José
Cartago
Heredia
Alajuela

¿Cuánto es 2 + 2?
3
*4
5
6`

const MARK = /^\s*(?:[a-dA-D]\s*[).:-]\s+)?\s*[*✔✓]\s*/
const stripLetter = (line: string): string => line.replace(/^\s*[a-dA-D]\s*[).:-]\s+/, '').trim()
const stripNumber = (line: string): string => line.replace(/^\s*\d+\s*[.)-]\s+/, '').trim()

export function parseQuestions(raw: string): ParseResult {
  const blocks = raw
    .replace(/\r/g, '')
    .split(/\n\s*\n/)
    .map((b) =>
      b
        .split('\n')
        .map((l) => l.trim())
        .filter(Boolean)
    )
    .filter((b) => b.length > 0)

  const questions: ParsedQuestion[] = []
  const problems: string[] = []
  blocks.forEach((lines, i) => {
    const label = `Pregunta ${i + 1} («${lines[0].slice(0, 40)}${lines[0].length > 40 ? '…' : ''}»)`
    if (lines.length !== 5) {
      problems.push(
        `${label}: debe tener la pregunta y 4 opciones (tiene ${Math.max(0, lines.length - 1)} opciones).`
      )
      return
    }
    const marked = lines.slice(1).map((l) => MARK.test(l))
    if (marked.filter(Boolean).length !== 1) {
      problems.push(`${label}: marca la opción correcta con un * al principio (solo una).`)
      return
    }
    const options = lines
      .slice(1)
      .map((l) => stripLetter(l.replace(MARK, (m) => m.replace(/[*✔✓]\s*/, ''))))
    if (options.some((o) => !o) || new Set(options.map((o) => o.toLowerCase())).size !== 4) {
      problems.push(`${label}: las 4 opciones deben ser distintas y no estar vacías.`)
      return
    }
    questions.push({ text: stripNumber(lines[0]), options, answer: marked.indexOf(true) })
  })
  return { questions, problems }
}
