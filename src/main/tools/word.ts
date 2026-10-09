import { BrowserWindow } from 'electron'
import { is } from '@electron-toolkit/utils'
import { writeFileSync } from 'fs'
import { join } from 'path'
import { handle } from '../ipc'
import { UserError } from '../jobs'
import { nameOf, outputDir, uniquePath } from '../paths'

const TIMEOUT_MS = 90_000

/** Abre la página oculta (print.html) que dibuja el documento, para poder imprimirla. */
async function loadPrintPage(win: BrowserWindow, input: string): Promise<void> {
  const query = { path: input }
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    const url = new URL('/print.html', process.env['ELECTRON_RENDERER_URL'])
    url.searchParams.set('path', input)
    await win.loadURL(url.toString())
  } else {
    await win.loadFile(join(__dirname, '../renderer/print.html'), { query })
  }
}

export function registerWordTools(): void {
  handle('word:toPdf', async (_e, p: { input: string }) => {
    if (/\.doc$/i.test(p.input)) {
      throw new UserError(
        'Este es un Word antiguo (.doc). Ábrelo en Word, elige Archivo → Guardar como → Documento de Word (.docx) y vuelve a intentarlo.'
      )
    }

    const win = new BrowserWindow({
      show: false,
      width: 1200,
      height: 900,
      webPreferences: { sandbox: true }
    })
    try {
      await loadPrintPage(win, p.input)
      const timeout = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('timeout')), TIMEOUT_MS)
      )
      await Promise.race([win.webContents.executeJavaScript('window.__docxReady'), timeout])
      const pdf = await win.webContents.printToPDF({
        preferCSSPageSize: true,
        printBackground: true,
        margins: { marginType: 'none' }
      })
      const output = uniquePath(outputDir(), nameOf(p.input), '.pdf')
      writeFileSync(output, pdf)
      return { output }
    } catch (err) {
      console.error('[word:toPdf]', err)
      throw new UserError(
        'No se pudo convertir ese documento. ¿Está dañado o protegido con contraseña? Prueba abrirlo y guardarlo de nuevo en Word.'
      )
    } finally {
      win.destroy()
    }
  })
}
