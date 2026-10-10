import { app } from 'electron'
import { existsSync, mkdirSync } from 'fs'
import { join, parse } from 'path'

const OS_DIR =
  { win32: 'win', darwin: 'mac', linux: 'linux' }[process.platform as string] ?? 'linux'

/** Carpeta donde viven ffmpeg y yt-dlp (empaquetados con la app). */
export function binDir(): string {
  return app.isPackaged
    ? join(process.resourcesPath, 'bin')
    : join(app.getAppPath(), 'resources', 'bin', OS_DIR)
}

const exe = process.platform === 'win32' ? '.exe' : ''

export const ffmpegPath = (): string => join(binDir(), `ffmpeg${exe}`)
export const bundledYtDlpPath = (): string => join(binDir(), `yt-dlp${exe}`)

/** Carpeta donde se guardan todos los resultados: Documentos/Educando */
export function outputDir(): string {
  const dir = join(app.getPath('documents'), 'Educando')
  mkdirSync(dir, { recursive: true })
  return dir
}

/** Quita caracteres que Windows no permite en nombres de archivo. */
export function safeName(name: string): string {
  const cleaned = name
    // eslint-disable-next-line no-control-regex -- los caracteres de control tampoco son válidos en nombres de archivo
    .replace(/[<>:"/\\|?*\u0000-\u001f]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  return cleaned.slice(0, 120) || 'archivo'
}

/** Devuelve una ruta libre: "nombre.ext", "nombre (2).ext", ... Nunca pisa archivos existentes. */
export function uniquePath(dir: string, baseName: string, ext: string): string {
  const base = safeName(baseName)
  let candidate = join(dir, `${base}${ext}`)
  for (let i = 2; existsSync(candidate); i++) candidate = join(dir, `${base} (${i})${ext}`)
  return candidate
}

export const nameOf = (file: string): string => parse(file).name
