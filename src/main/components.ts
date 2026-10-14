import { app, BrowserWindow } from 'electron'
import {
  chmodSync,
  createWriteStream,
  existsSync,
  mkdirSync,
  readFileSync,
  renameSync,
  rmSync,
  writeFileSync
} from 'fs'
import { createHash } from 'crypto'
import { join } from 'path'
import { Readable } from 'stream'
import { pipeline } from 'stream/promises'
import { createGunzip } from 'zlib'
import type { ComponentId, ComponentProgress, ComponentStatus } from '../shared/components'
import { COMPONENTS, componentDef } from '../shared/components'
import { VOICES_PACK, type VoiceCatalog } from '../shared/voices'
import { unzipTo } from './unzip'
import { handle } from './ipc'
import { UserError } from './jobs'

const FFMPEG_TAG = 'b6.1.1'
const MODEL_VERSION = '1.4.5'
const MODEL_NAME = '/models/medium'
const exe = process.platform === 'win32' ? '.exe' : ''
const OS_DIR =
  { win32: 'win', darwin: 'mac', linux: 'linux' }[process.platform as string] ?? 'linux'

/**
 * Para probar la descarga sin internet: una carpeta (o servidor) que tenga `ffmpeg.gz`, `yt-dlp` y `model/` con los archivos del modelo.
 * Con `EASY_TOOLS_IGNORE_BUNDLED=1` el modo de desarrollo tampoco usa lo que haya en resources/.
 */
const OVERRIDE = process.env['EASY_TOOLS_COMPONENTS_URL']?.replace(/\/$/, '')
const IGNORE_BUNDLED = process.env['EASY_TOOLS_IGNORE_BUNDLED'] === '1'

const componentsRoot = (): string => join(app.getPath('userData'), 'components')
export const componentDir = (id: ComponentId): string => join(componentsRoot(), id)

/** Al desarrollar, lo que bajó `npm run setup` cuenta como instalado */
const devBin = (): string | null =>
  app.isPackaged || IGNORE_BUNDLED ? null : join(app.getAppPath(), 'resources', 'bin', OS_DIR)
const devModels = (): string | null =>
  app.isPackaged || IGNORE_BUNDLED
    ? null
    : join(app.getAppPath(), 'node_modules', '@imgly', 'background-removal-node', 'dist')

function binaryPath(id: 'ffmpeg' | 'ytdlp'): string | null {
  const name = id === 'ffmpeg' ? `ffmpeg${exe}` : `yt-dlp${exe}`
  const downloaded = join(componentDir(id), name)
  if (existsSync(downloaded)) return downloaded
  const dev = devBin()
  if (dev && existsSync(join(dev, name))) return join(dev, name)
  return null
}

/** Carpeta del modelo de IA (con resources.json y sus pedazos), o null si falta */
export function modelDir(): string | null {
  const dir = componentDir('model')
  if (existsSync(join(dir, '.completo'))) return dir
  const dev = devModels()
  return dev && existsSync(join(dev, 'resources.json')) ? dev : null
}

const MISSING = (id: ComponentId): UserError =>
  new UserError(
    `Falta descargar «${componentDef(id).label}». Vuelve a abrir esta herramienta y pulsa «Descargar».`
  )

/** Ruta de ffmpeg; si no se ha descargado, un mensaje claro */
export function requireFfmpeg(): string {
  const p = binaryPath('ffmpeg')
  if (!p) throw MISSING('ffmpeg')
  return p
}

export function requireYtDlp(): string {
  const p = binaryPath('ytdlp')
  if (!p) throw MISSING('ytdlp')
  return p
}

export function requireModelDir(): string {
  const p = modelDir()
  if (!p) throw MISSING('model')
  return p
}

/** Carpeta de las voces (con index.json y los audios), o null si falta o es de otra versión del paquete */
export function voicesDir(): string | null {
  const dir = join(componentDir('voices'), 'audio')
  try {
    // La marca dice qué paquete es: si cambió el paquete, hay que bajar el nuevo
    const marker = readFileSync(join(componentDir('voices'), '.completo'), 'utf8').trim()
    return marker === VOICES_PACK.sha256 && existsSync(join(dir, 'index.json')) ? dir : null
  } catch {
    return null
  }
}

export const isInstalled = (id: ComponentId): boolean =>
  id === 'model'
    ? modelDir() !== null
    : id === 'voices'
      ? voicesDir() !== null
      : binaryPath(id) !== null

export function status(): ComponentStatus[] {
  return COMPONENTS.map((c) => ({ id: c.id, installed: isInstalled(c.id) }))
}

/* ---------- Descarga ---------- */

const active = new Map<ComponentId, { promise: Promise<void>; abort: AbortController }>()

function emit(p: ComponentProgress): void {
  for (const win of BrowserWindow.getAllWindows())
    if (!win.isDestroyed()) win.webContents.send('components:progress', p)
}

interface FileJob {
  url: string
  dest: string
  gunzip?: boolean
  /** Si se da, el contenido descargado tiene que tener este SHA-256 */
  sha256?: string
  /** Peso para calcular el avance (relativo a los demás archivos del componente) */
  weight: number
  executable?: boolean
}

async function fetchTo(
  job: FileJob,
  signal: AbortSignal,
  onFraction: (f: number) => void
): Promise<void> {
  mkdirSync(join(job.dest, '..'), { recursive: true })
  const res = await fetch(job.url, { redirect: 'follow', signal })
  if (!res.ok || !res.body) throw new Error(`HTTP ${res.status} en ${job.url}`)
  const total = Number(res.headers.get('content-length')) || 0
  const tmp = `${job.dest}.part`
  const hash = createHash('sha256')
  let received = 0
  const body = Readable.fromWeb(res.body as never)
  body.on('data', (chunk: Buffer) => {
    received += chunk.length
    hash.update(chunk)
    if (total) onFraction(Math.min(1, received / total))
  })
  try {
    const sink = createWriteStream(tmp)
    if (job.gunzip) await pipeline(body, createGunzip(), sink, { signal })
    else await pipeline(body, sink, { signal })
    if (job.sha256 && hash.digest('hex') !== job.sha256)
      throw new Error(`El archivo bajado está dañado (${job.url})`)
    renameSync(tmp, job.dest)
    if (job.executable && process.platform !== 'win32') chmodSync(job.dest, 0o755)
  } catch (err) {
    rmSync(tmp, { force: true })
    throw err
  }
}

async function jobsFor(id: ComponentId, signal: AbortSignal): Promise<FileJob[]> {
  const dir = componentDir(id)
  if (id === 'voices') {
    // Un solo .zip con todos los audios y su catálogo (se descomprime al terminar de bajar)
    const url = OVERRIDE ? `${OVERRIDE}/voices.zip` : VOICES_PACK.url
    return [{ url, dest: join(dir, 'voces.zip'), sha256: VOICES_PACK.sha256, weight: 1 }]
  }
  if (id === 'ffmpeg') {
    const url = OVERRIDE
      ? `${OVERRIDE}/ffmpeg.gz`
      : `https://github.com/eugeneware/ffmpeg-static/releases/download/${FFMPEG_TAG}/ffmpeg-${process.platform}-${process.arch}.gz`
    return [{ url, dest: join(dir, `ffmpeg${exe}`), gunzip: true, weight: 1, executable: true }]
  }
  if (id === 'ytdlp') {
    const asset = { win32: 'yt-dlp.exe', linux: 'yt-dlp_linux', darwin: 'yt-dlp_macos' }[
      process.platform as string
    ]
    const url = OVERRIDE
      ? `${OVERRIDE}/yt-dlp`
      : `https://github.com/yt-dlp/yt-dlp/releases/latest/download/${asset}`
    return [{ url, dest: join(dir, `yt-dlp${exe}`), weight: 1, executable: true }]
  }
  // Modelo de IA: la lista de pedazos viene en resources.json; cada pedazo se llama como su SHA-256
  const base = OVERRIDE
    ? `${OVERRIDE}/model`
    : `https://staticimgly.com/@imgly/background-removal-data/${MODEL_VERSION}/dist`
  const manifestRes = await fetch(`${base}/resources.json`, { redirect: 'follow', signal })
  if (!manifestRes.ok) throw new Error(`HTTP ${manifestRes.status} en resources.json`)
  const manifestText = await manifestRes.text()
  const manifest = JSON.parse(manifestText) as Record<string, { chunks: { hash: string }[] }>
  const chunks = manifest[MODEL_NAME]?.chunks
  if (!chunks?.length) throw new Error('resources.json no trae el modelo esperado')
  mkdirSync(dir, { recursive: true })
  writeFileSync(join(dir, 'resources.json'), manifestText)
  return chunks.map((c) => ({
    url: `${base}/${c.hash}`,
    dest: join(dir, c.hash),
    sha256: c.hash,
    weight: 1
  }))
}

async function install(id: ComponentId, signal: AbortSignal): Promise<void> {
  emit({ id, state: 'downloading', percent: 0 })
  const jobs = await jobsFor(id, signal)
  const totalWeight = jobs.reduce((n, j) => n + j.weight, 0)
  let done = 0
  for (const job of jobs) {
    if (!existsSync(job.dest) || !job.sha256) {
      await fetchTo(job, signal, (f) =>
        emit({
          id,
          state: 'downloading',
          percent: Math.round(((done + f * job.weight) / totalWeight) * 100)
        })
      )
    }
    done += job.weight
    emit({ id, state: 'downloading', percent: Math.round((done / totalWeight) * 100) })
  }
  if (id === 'voices') {
    // Se descomprime en una carpeta aparte y se cambia de una vez, así nunca queda a medias
    const dir = componentDir(id)
    const tmp = join(dir, 'audio.tmp')
    rmSync(tmp, { recursive: true, force: true })
    unzipTo(join(dir, 'voces.zip'), tmp)
    if (!existsSync(join(tmp, 'index.json')))
      throw new Error('El paquete de voces no trae su catálogo')
    rmSync(join(dir, 'audio'), { recursive: true, force: true })
    renameSync(tmp, join(dir, 'audio'))
    rmSync(join(dir, 'voces.zip'), { force: true })
    writeFileSync(join(dir, '.completo'), VOICES_PACK.sha256)
  }
  // Marca de que quedó completo (el modelo son muchos archivos)
  if (id === 'model') writeFileSync(join(componentDir(id), '.completo'), String(Date.now()))
  emit({ id, state: 'done', percent: 100 })
}

/** Descarga un componente (si ya se está bajando, se espera a ese mismo trabajo) */
export function installComponent(id: ComponentId): Promise<void> {
  const current = active.get(id)
  if (current) return current.promise
  if (isInstalled(id)) return Promise.resolve()
  const abort = new AbortController()
  const promise = install(id, abort.signal)
    .catch((err: unknown) => {
      const cancelled = abort.signal.aborted
      const message = cancelled
        ? 'Descarga cancelada.'
        : 'No se pudo descargar. Revisa tu conexión a internet e intenta de nuevo.'
      if (!cancelled) console.error('[componentes]', id, err)
      emit({ id, state: 'error', percent: 0, message })
      throw new UserError(message)
    })
    .finally(() => active.delete(id))
  active.set(id, { promise, abort })
  return promise
}

/** Las pruebas automáticas apagan la descarga automática del arranque con EASY_TOOLS_NO_AUTO_DOWNLOAD=1 */
const AUTO_DOWNLOAD = process.env['EASY_TOOLS_NO_AUTO_DOWNLOAD'] !== '1'

/** Catálogo de voces instalado (null si todavía no se descargó); se lee una vez por versión del paquete */
let catalogCache: VoiceCatalog | null = null
function voiceCatalog(): VoiceCatalog | null {
  const dir = voicesDir()
  if (!dir) return (catalogCache = null)
  if (catalogCache?.dir === dir) return catalogCache
  try {
    catalogCache = { dir, entries: JSON.parse(readFileSync(join(dir, 'index.json'), 'utf8')) }
  } catch {
    catalogCache = null
  }
  return catalogCache
}

export function registerComponentHandlers(): void {
  handle('components:status', () => status())
  handle('components:options', () => ({ autoDownload: AUTO_DOWNLOAD }))
  handle('voices:catalog', () => voiceCatalog())
  handle('components:install', (_e, id: ComponentId) => installComponent(id))
  handle('components:cancel', (_e, id: ComponentId) => {
    active.get(id)?.abort.abort()
  })
}

/** Lee el SHA-256 de un archivo (para pruebas) */
export const sha256Of = (file: string): string =>
  createHash('sha256').update(readFileSync(file)).digest('hex')
