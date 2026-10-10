import { renderAsync } from 'docx-preview'
import './assets/print.css'

export interface PrintInfo {
  /** Tamaño de página del documento, en píxeles CSS (96 por pulgada) */
  width: number
  height: number
}

declare global {
  interface Window {
    /** El proceso principal espera esta promesa antes de imprimir */
    __docxReady: Promise<PrintInfo>
  }
}

/**
 * Página oculta: dibuja un .docx con docx-preview (respeta estilos, tablas, imágenes, encabezados…)
 * y deja listo el tamaño de página para que el proceso principal lo imprima como PDF.
 */
window.__docxReady = (async (): Promise<PrintInfo> => {
  const path = new URLSearchParams(location.search).get('path')
  if (!path) throw new Error('Falta el archivo')
  const response = await fetch(`easy-media://local/?path=${encodeURIComponent(path)}`)
  const bytes = await response.arrayBuffer()

  const root = document.getElementById('root')!
  await renderAsync(bytes, root, root, {
    className: 'docx',
    inWrapper: true,
    breakPages: true,
    useBase64URL: true,
    renderHeaders: true,
    renderFooters: true,
    renderFootnotes: true,
    renderEndnotes: true
  })

  await document.fonts.ready
  await Promise.all(Array.from(document.images).map((img) => img.decode().catch(() => {})))

  const page = root.querySelector<HTMLElement>('section.docx')
  if (!page) throw new Error('El documento está vacío')
  const style = getComputedStyle(page)
  const width = parseFloat(style.width)
  const height = parseFloat(style.minHeight) || parseFloat(style.height)
  const sheet = document.createElement('style')
  sheet.textContent = `@page { size: ${width}px ${height}px; margin: 0 }`
  document.head.appendChild(sheet)
  return { width, height }
})()
