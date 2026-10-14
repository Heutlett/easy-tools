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
import { ESPEAK, VOICES } from '../shared/voices'
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

/** Carpeta de las voces (con el modelo), o null si faltan */
const VOICE_FILES = [
  ...VOICES.flatMap((v) => [join(v.id, 'model.onnx'), join(v.id, 'tokens.txt')]),
  join('espeak-ng-data', '.completo')
]
/** Archivos de versiones anteriores de las voces (otro modelo) que ya no sirven */
const OLD_VOICE_FILES = [
  'duration_predictor.int8.onnx',
  'text_encoder.int8.onnx',
  'vector_estimator.int8.onnx',
  'vocoder.int8.onnx',
  'tts.json',
  'unicode_indexer.bin',
  'voice.bin'
]

/** Cambia cuando cambia alguna voz: así una instalación con otra voz se vuelve a bajar */
const VOICES_VERSION = createHash('sha256')
  .update(VOICES.map((v) => v.modelSha256 + v.tokensSha256).join() + ESPEAK.sha256)
  .digest('hex')
  .slice(0, 16)

export function voicesDir(): string | null {
  const dir = componentDir('voices')
  // No basta la marca de «completo»: tiene que ser de estas voces y estar los archivos de las dos
  try {
    if (readFileSync(join(dir, '.completo'), 'utf8').trim() !== VOICES_VERSION) return null
  } catch {
    return null
  }
  return VOICE_FILES.every((f) => existsSync(join(dir, f))) ? dir : null
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

export interface FileJob {
  url: string
  dest: string
  gunzip?: boolean
  /** Si se da, el contenido descargado tiene que tener este SHA-256 */
  sha256?: string
  /** Peso para calcular el avance (relativo a los demás archivos del componente) */
  weight: number
  executable?: boolean
}

export async function fetchTo(
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
  if (id === 'voices') {
    // Voces: dos modelos de Piper (español e inglés) en una revisión fija de Hugging Face y los datos de pronunciación; todo con SHA-256
    const jobs: FileJob[] = []
    for (const v of VOICES) {
      const base = OVERRIDE
        ? `${OVERRIDE}/voices/${v.id}`
        : `https://huggingface.co/${v.repo}/resolve/${v.revision}`
      jobs.push(
        {
          url: `${base}/${v.model}`,
          dest: join(dir, v.id, 'model.onnx'),
          sha256: v.modelSha256,
          weight: v.sizeMB
        },
        {
          url: `${base}/tokens.txt`,
          dest: join(dir, v.id, 'tokens.txt'),
          sha256: v.tokensSha256,
          weight: 0.1
        }
      )
    }
    if (!existsSync(join(dir, 'espeak-ng-data', '.completo')))
      jobs.push({
        url: OVERRIDE ? `${OVERRIDE}/voices/espeak-ng-data.zip` : ESPEAK.url,
        dest: join(dir, 'espeak-ng-data.zip'),
        sha256: ESPEAK.sha256,
        weight: ESPEAK.sizeMB
      })
    return jobs
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
  if (id === 'voices') {
    // Si había una versión anterior de las voces (otro modelo), se borra: la marca de «completo» ya no es cierta
    const dir = componentDir(id)
    rmSync(join(dir, '.completo'), { force: true })
    for (const f of OLD_VOICE_FILES) rmSync(join(dir, f), { force: true })
    // Un modelo que ya no es el de ahora (por ejemplo, se cambió la voz en inglés) se borra para bajar el nuevo
    for (const v of VOICES) {
      const model = join(dir, v.id, 'model.onnx')
      if (existsSync(model) && sha256Of(model) !== v.modelSha256) rmSync(model, { force: true })
    }
  }
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
  // Voces: los datos de pronunciación vienen en un .zip
  if (id === 'voices' && existsSync(join(componentDir(id), 'espeak-ng-data.zip'))) {
    const dir = componentDir(id)
    const tmp = join(dir, 'espeak-extract')
    rmSync(tmp, { recursive: true, force: true })
    unzipTo(join(dir, 'espeak-ng-data.zip'), tmp)
    if (!existsSync(join(tmp, 'espeak-ng-data')))
      throw new Error('Faltan los datos de pronunciación')
    rmSync(join(dir, 'espeak-ng-data'), { recursive: true, force: true })
    renameSync(join(tmp, 'espeak-ng-data'), join(dir, 'espeak-ng-data'))
    writeFileSync(join(dir, 'espeak-ng-data', '.completo'), String(Date.now()))
    rmSync(tmp, { recursive: true, force: true })
    rmSync(join(dir, 'espeak-ng-data.zip'), { force: true })
  }
  // Marca de que quedó completo (el modelo son muchos archivos)
  if (id === 'model') writeFileSync(join(componentDir(id), '.completo'), String(Date.now()))
  if (id === 'voices') writeFileSync(join(componentDir(id), '.completo'), VOICES_VERSION)
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

export function registerComponentHandlers(): void {
  handle('components:status', () => status())
  handle('components:options', () => ({ autoDownload: AUTO_DOWNLOAD }))
  handle('components:install', (_e, id: ComponentId) => installComponent(id))
  handle('components:cancel', (_e, id: ComponentId) => {
    active.get(id)?.abort.abort()
  })
}

/** Lee el SHA-256 de un archivo (para pruebas) */
export const sha256Of = (file: string): string =>
  createHash('sha256').update(readFileSync(file)).digest('hex')
