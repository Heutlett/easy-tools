import type { WordModel } from '../../../shared/types'
import type { WordImage } from '../../../shared/types'
import { openPdf } from './pdf'
import { readPage } from './pdfRead'
import type { PageLines } from './pdfRead'
import { buildExactModel } from './pdfToWordExact'

/** Lee un PDF y lo convierte en un modelo de documento de Word con todo en su posición exacta. */
export async function pdfToWordModel(
  path: string,
  onProgress: (fraction: number) => void
): Promise<WordModel> {
  const doc = await openPdf(path, true)
  const pages: PageLines[] = []
  const imageCache = new Map<string, Omit<WordImage, 'width' | 'height'> | null>()
  for (let n = 1; n <= doc.numPages; n++) {
    pages.push(await readPage(await doc.getPage(n), imageCache))
    onProgress(n / doc.numPages)
  }

  const textLength = pages
    .flatMap((p) => p.lines.filter((l) => !l.image))
    .reduce((sum, l) => sum + l.text.trim().length, 0)
  if (textLength < 20) {
    throw new Error(
      'Este PDF parece ser una imagen (por ejemplo, una hoja escaneada o fotografiada) y no tiene texto que convertir.'
    )
  }

  return buildExactModel(pages)
}
