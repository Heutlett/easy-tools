import { mkdirSync, writeFileSync } from 'fs'
import { join } from 'path'
import { handle } from '../ipc'
import { outputDir, safeName, uniquePath } from '../paths'

/** Guardado de archivos que la ventana ya generó (imágenes de un PDF, un PDF hecho con imágenes…). */
export function registerOutputTools(): void {
  handle('output:saveFile', (_e, p: { name: string; ext: string; data: ArrayBuffer }) => {
    const output = uniquePath(outputDir(), p.name, p.ext)
    writeFileSync(output, Buffer.from(p.data))
    return { output }
  })

  /** Guarda varios archivos en una misma carpeta nueva: la primera llamada la crea y devuelve su ruta. */
  handle(
    'output:saveInFolder',
    (_e, p: { dir?: string; folderName: string; fileName: string; data: ArrayBuffer }) => {
      const dir = p.dir ?? uniquePath(outputDir(), p.folderName, '')
      mkdirSync(dir, { recursive: true })
      const output = join(dir, safeName(p.fileName))
      writeFileSync(output, Buffer.from(p.data))
      return { dir, output }
    }
  )
}
