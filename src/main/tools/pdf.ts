import { PDFDocument } from 'pdf-lib'
import { mkdirSync, readFileSync, writeFileSync } from 'fs'
import { join } from 'path'
import { handle } from '../ipc'
import { UserError } from '../jobs'
import { nameOf, outputDir, uniquePath } from '../paths'

async function load(file: string): Promise<PDFDocument> {
  try {
    return await PDFDocument.load(readFileSync(file))
  } catch (err) {
    if (/encrypted/i.test(String(err)))
      throw new UserError(`"${nameOf(file)}" está protegido con contraseña y no se puede usar.`)
    throw new UserError(`No se pudo abrir "${nameOf(file)}". ¿Es un PDF válido?`)
  }
}

async function extract(source: PDFDocument, pages: number[]): Promise<Uint8Array> {
  const doc = await PDFDocument.create()
  const copied = await doc.copyPages(source, pages)
  copied.forEach((p) => doc.addPage(p))
  return doc.save()
}

export function registerPdfTools(): void {
  handle('pdf:merge', async (_e, p: { inputs: string[] }) => {
    if (p.inputs.length < 2) throw new UserError('Elige al menos dos PDFs para unir.')
    const merged = await PDFDocument.create()
    for (const file of p.inputs) {
      const doc = await load(file)
      const pages = await merged.copyPages(doc, doc.getPageIndices())
      pages.forEach((page) => merged.addPage(page))
    }
    const output = uniquePath(outputDir(), 'PDF unido', '.pdf')
    writeFileSync(output, await merged.save())
    return { output }
  })

  /** pages: números de página a partir de 1 */
  handle(
    'pdf:split',
    async (_e, p: { input: string; pages: number[]; mode: 'selected' | 'each' }) => {
      const doc = await load(p.input)
      const total = doc.getPageCount()
      const name = nameOf(p.input)

      if (p.mode === 'selected') {
        const pages = [...new Set(p.pages)]
          .filter((n) => n >= 1 && n <= total)
          .sort((a, b) => a - b)
        if (pages.length === 0) throw new UserError('Elige al menos una página.')
        const output = uniquePath(outputDir(), `${name} (páginas elegidas)`, '.pdf')
        writeFileSync(
          output,
          await extract(
            doc,
            pages.map((n) => n - 1)
          )
        )
        return { output, count: pages.length }
      }

      const folder = uniquePath(outputDir(), `${name} (páginas separadas)`, '')
      mkdirSync(folder, { recursive: true })
      const digits = String(total).length
      for (let i = 0; i < total; i++) {
        const num = String(i + 1).padStart(digits, '0')
        writeFileSync(join(folder, `${name} - página ${num}.pdf`), await extract(doc, [i]))
      }
      return { output: folder, count: total }
    }
  )
}
