import { writeFileSync } from 'fs'
import { Packer } from 'docx'
import { handle } from '../ipc'
import { UserError } from '../jobs'
import { nameOf, outputDir, uniquePath } from '../paths'
import type { WordModel } from '../../shared/types'
import { buildExactDocument } from './pdfToWordExact'

export function registerPdfToWordTools(): void {
  /** La ventana lee el PDF y manda su estructura; aquí se escribe el archivo .docx */
  handle('pdf:toWord', async (_e, p: { input: string; model: WordModel }) => {
    if (!p.model.exact.some((page) => page.blocks.length > 0))
      throw new UserError('No se encontró texto en el PDF.')
    const output = uniquePath(outputDir(), nameOf(p.input), '.docx')
    writeFileSync(output, await Packer.toBuffer(buildExactDocument(p.model)))
    return { output }
  })
}
