import { app, ipcMain } from 'electron'
import {
  closeSync,
  copyFileSync,
  existsSync,
  fsyncSync,
  mkdirSync,
  openSync,
  readdirSync,
  readFileSync,
  renameSync,
  rmSync,
  writeSync
} from 'fs'
import { join } from 'path'
import { handle } from './ipc'
import { outputDir } from './paths'

/**
 * Almacén de datos de la persona (listas de estudiantes, puntos, ranking, preguntas propias, preferencias).
 * Vive en un archivo en la carpeta de datos de la app, no en el almacenamiento del navegador, y se protege así:
 *  - se escribe de forma segura (archivo temporal + renombrar), así nunca queda un archivo a medias;
 *  - antes de cambiarlo se guarda la versión anterior, y cada día hay un respaldo (se conservan 30 días);
 *  - se deja además una copia visible en Documentos/Educando/Respaldo;
 *  - si el archivo principal se daña, se recupera solo del respaldo más reciente que sirva.
 */
type Data = Record<string, unknown>

interface Snapshot {
  data: Data
  /** Cuándo se guardó (milisegundos); 0 si el archivo no lo dice */
  savedAt: number
}

const SAVE_DELAY_MS = 400
const KEEP_DAILY = 30
const PREV_EVERY_MS = 10 * 60 * 1000
const COPY_NAME = 'Mis datos de Educando.json'

let data: Data = {}
let loaded = false
let dirty = false
let timer: ReturnType<typeof setTimeout> | null = null
let lastPrevAt = 0
let lastPrunedDay = ''

const dir = (): string => {
  const d = join(app.getPath('userData'), 'datos')
  mkdirSync(d, { recursive: true })
  return d
}
const mainFile = (): string => join(dir(), 'datos.json')
const prevFile = (): string => join(dir(), 'datos.anterior.json')
const dailyDir = (): string => {
  const d = join(dir(), 'respaldos')
  mkdirSync(d, { recursive: true })
  return d
}
const visibleCopy = (): string => {
  const d = join(outputDir(), 'Respaldo')
  mkdirSync(d, { recursive: true })
  return join(d, COPY_NAME)
}
const today = (): string => new Date().toISOString().slice(0, 10)

/** Lee un archivo de datos; null si no existe o no sirve */
function readValid(file: string): Snapshot | null {
  try {
    if (!existsSync(file)) return null
    const parsed = JSON.parse(readFileSync(file, 'utf8')) as { data?: unknown; savedAt?: string }
    if (
      !parsed ||
      typeof parsed.data !== 'object' ||
      parsed.data === null ||
      Array.isArray(parsed.data)
    )
      return null
    return { data: parsed.data as Data, savedAt: Date.parse(parsed.savedAt ?? '') || 0 }
  } catch {
    return null
  }
}

/** Escribe sin dejar nunca el archivo a medias: se escribe aparte, se fuerza al disco y se renombra */
function writeAtomic(file: string, text: string): void {
  const tmp = `${file}.tmp`
  const fd = openSync(tmp, 'w')
  try {
    writeSync(fd, text)
    fsyncSync(fd)
  } finally {
    closeSync(fd)
  }
  renameSync(tmp, file)
}

function dailyBackups(): string[] {
  try {
    return readdirSync(dailyDir())
      .filter((f) => /^datos-\d{4}-\d{2}-\d{2}\.json$/.test(f))
      .sort()
  } catch {
    return []
  }
}

/** Carga los datos desde el archivo principal o, si no sirve, desde el respaldo más reciente que sirva. */
export function loadStore(): { data: Data; recoveredFrom: string | null } {
  const main = mainFile()
  const fromMain = readValid(main)
  if (fromMain) {
    data = fromMain.data
    loaded = true
    return { data, recoveredFrom: null }
  }
  // El archivo principal falta o está dañado: si existe, se aparta para no perderlo
  if (existsSync(main)) {
    try {
      renameSync(main, join(dir(), `datos.danado-${Date.now()}.json`))
    } catch {
      // Si no se puede apartar, se sobrescribirá de forma segura más adelante.
    }
  }
  // Se usa el respaldo más reciente que sirva, venga de donde venga
  const candidates: [string, string][] = [
    ['la copia anterior', prevFile()],
    ...dailyBackups().map((f): [string, string] => [
      `el respaldo del ${f.slice(6, 16)}`,
      join(dailyDir(), f)
    ]),
    ['la copia de Documentos', visibleCopy()]
  ]
  let best: { label: string; snap: Snapshot } | null = null
  for (const [label, file] of candidates) {
    const snap = readValid(file)
    if (snap && (!best || snap.savedAt > best.snap.savedAt)) best = { label, snap }
  }
  loaded = true
  if (best) {
    data = best.snap.data
    dirty = true
    scheduleSave()
    return { data, recoveredFrom: best.label }
  }
  data = {}
  return { data, recoveredFrom: null }
}

function scheduleSave(): void {
  if (timer) clearTimeout(timer)
  timer = setTimeout(flushStore, SAVE_DELAY_MS)
}

/** Guarda ya (se llama también al cerrar la app) */
export function flushStore(): void {
  if (timer) clearTimeout(timer)
  timer = null
  if (!loaded || !dirty) return
  dirty = false
  try {
    const main = mainFile()
    const now = Date.now()
    // Versión anterior: no en cada cambio, para que sirva de verdad como «lo de hace un rato»
    if (existsSync(main) && now - lastPrevAt > PREV_EVERY_MS && readValid(main)) {
      copyFileSync(main, prevFile())
      lastPrevAt = now
    }
    const text = JSON.stringify({ version: 1, savedAt: new Date(now).toISOString(), data })
    writeAtomic(main, text)
    // Respaldo del día: se actualiza con cada guardado, así al terminar el día tiene lo último.
    const day = today()
    writeAtomic(join(dailyDir(), `datos-${day}.json`), text)
    if (day !== lastPrunedDay) {
      lastPrunedDay = day
      const all = dailyBackups()
      for (const old of all.slice(0, Math.max(0, all.length - KEEP_DAILY)))
        rmSync(join(dailyDir(), old), { force: true })
    }
    // Copia visible en Documentos
    writeAtomic(visibleCopy(), text)
  } catch (err) {
    dirty = true
    console.error('[datos] no se pudo guardar', err)
  }
}

export function registerStoreHandlers(): void {
  handle('store:load', () => loadStore())
  // Cambios: sin esperar respuesta, para que escribir una lista no se sienta lento
  ipcMain.on('store:set', (_e, key: string, value: unknown) => {
    if (typeof key !== 'string' || !loaded) return
    if (value === undefined) delete data[key]
    else data[key] = value
    dirty = true
    scheduleSave()
  })
  /** Reemplaza todos los datos (al restaurar una copia de seguridad) */
  handle('store:replaceAll', (_e, next: Data) => {
    if (!next || typeof next !== 'object' || Array.isArray(next))
      throw new Error('Datos no válidos')
    data = { ...next }
    dirty = true
    flushStore()
    return data
  })
  app.on('before-quit', flushStore)
  app.on('will-quit', flushStore)
}
