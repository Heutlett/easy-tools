import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.mjs'
import type { PDFDocumentProxy } from 'pdfjs-dist/legacy/build/pdf.mjs'
import workerUrl from 'pdfjs-dist/legacy/build/pdf.worker.min.mjs?url'

pdfjs.GlobalWorkerOptions.workerSrc = workerUrl

/**
 * Abre un PDF. Con `fontExtraProperties` también se puede leer el nombre real de cada letra
 * (útil para detectar negritas y cursivas al convertir a Word).
 */
export async function openPdf(
  path: string,
  fontExtraProperties = false
): Promise<PDFDocumentProxy> {
  const bytes = await (await fetch(window.api.mediaUrl(path))).arrayBuffer()
  return pdfjs.getDocument({ data: new Uint8Array(bytes), fontExtraProperties }).promise
}

/** Dibuja una página como miniatura y devuelve una imagen (data URL). */
export async function renderThumbnail(
  doc: PDFDocumentProxy,
  pageNumber: number,
  width = 220
): Promise<string> {
  const page = await doc.getPage(pageNumber)
  const base = page.getViewport({ scale: 1 })
  const viewport = page.getViewport({ scale: (width * window.devicePixelRatio) / base.width })
  const canvas = document.createElement('canvas')
  canvas.width = Math.floor(viewport.width)
  canvas.height = Math.floor(viewport.height)
  await page.render({ canvas, viewport }).promise
  return canvas.toDataURL('image/jpeg', 0.8)
}
