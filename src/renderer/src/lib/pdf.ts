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

/** Dibuja una página del PDF (con fondo blanco) y la devuelve como imagen JPG o PNG, a unos 200 puntos por pulgada. */
export async function renderPageImage(
  doc: PDFDocumentProxy,
  pageNumber: number,
  format: 'jpg' | 'png'
): Promise<ArrayBuffer> {
  const page = await doc.getPage(pageNumber)
  const base = page.getViewport({ scale: 1 })
  // 200 ppp, pero sin pasar de 4500 píxeles de lado (hojas muy grandes)
  const scale = Math.min(200 / 72, 4500 / Math.max(base.width, base.height))
  const viewport = page.getViewport({ scale })
  const canvas = document.createElement('canvas')
  canvas.width = Math.floor(viewport.width)
  canvas.height = Math.floor(viewport.height)
  await page.render({ canvas, viewport, background: '#ffffff' }).promise
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, format === 'jpg' ? 'image/jpeg' : 'image/png', 0.92)
  )
  if (!blob) throw new Error('No se pudo crear la imagen.')
  return blob.arrayBuffer()
}
