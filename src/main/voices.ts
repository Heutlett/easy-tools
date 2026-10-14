import { app, utilityProcess, type UtilityProcess, type WebContents } from 'electron'
import { join } from 'path'
import { voiceDef, type SpeechAudio, type VoiceId } from '../shared/voices'
import { voicesDir } from './components'
import { handle } from './ipc'
import { UserError } from './jobs'

/* ---------- Voces ---------- */

const packDir = (): string | null => voicesDir()

/* ---------- Síntesis ---------- */

/** Si en este tiempo no llega nada del proceso de voz, se da por perdido */
const STALL_MS = 60_000
/** El motor ocupa memoria mientras está cargado: si nadie lo usa un rato, se cierra */
const IDLE_MS = 10 * 60_000

interface Stream {
  /** Quién pidió el audio (recibe los trozos); null si solo se junta todo (pruebas) */
  sender: WebContents | null
  parts: Float32Array[]
  sampleRate: number
  timer: ReturnType<typeof setTimeout>
  resolve?: (a: SpeechAudio) => void
  reject?: (e: Error) => void
}

let worker: UtilityProcess | null = null
let idleTimer: ReturnType<typeof setTimeout> | null = null
const streams = new Map<number, Stream>()

function finish(id: number): Stream | undefined {
  const st = streams.get(id)
  if (st) {
    clearTimeout(st.timer)
    streams.delete(id)
  }
  return st
}

function failAll(message: string): void {
  for (const id of [...streams.keys()]) {
    const st = finish(id)
    if (st?.sender && !st.sender.isDestroyed())
      st.sender.send('voices:chunk', { requestId: id, type: 'error', message })
    st?.reject?.(new Error(message))
  }
}

export function stopWorker(): void {
  if (idleTimer) clearTimeout(idleTimer)
  idleTimer = null
  const w = worker
  worker = null
  if (w) {
    failAll('La voz se detuvo')
    w.kill()
  }
}

interface WorkerMessage {
  id: number
  type: 'chunk' | 'done' | 'error'
  samples?: Float32Array
  sampleRate?: number
  index?: number
  error?: string
}

function ensureWorker(): UtilityProcess {
  if (worker) return worker
  const child = utilityProcess.fork(join(__dirname, 'voiceWorker.js'), [], {
    serviceName: 'Voz de Educando'
  })
  child.on('message', (m: WorkerMessage) => {
    const st = streams.get(m.id)
    if (!st) return
    clearTimeout(st.timer)
    st.timer = setTimeout(() => timeout(m.id), STALL_MS)
    if (m.type === 'chunk' && m.samples && m.sampleRate) {
      st.sampleRate = m.sampleRate
      if (st.sender) {
        if (!st.sender.isDestroyed())
          st.sender.send('voices:chunk', {
            requestId: m.id,
            type: 'chunk',
            index: m.index,
            samples: m.samples,
            sampleRate: m.sampleRate
          })
      } else st.parts.push(m.samples)
    } else if (m.type === 'done') {
      finish(m.id)
      if (st.sender) {
        if (!st.sender.isDestroyed())
          st.sender.send('voices:chunk', { requestId: m.id, type: 'done' })
      } else {
        const total = st.parts.reduce((n, p) => n + p.length, 0)
        const all = new Float32Array(total)
        let at = 0
        for (const p of st.parts) {
          all.set(p, at)
          at += p.length
        }
        st.resolve?.({ samples: all, sampleRate: st.sampleRate })
      }
    } else if (m.type === 'error') {
      console.error('[voces]', m.error)
      finish(m.id)
      const message = 'No se pudo generar la voz.'
      if (st.sender && !st.sender.isDestroyed())
        st.sender.send('voices:chunk', { requestId: m.id, type: 'error', message })
      st.reject?.(new UserError(message))
    }
  })
  child.on('exit', () => {
    if (worker === child) worker = null
    failAll('La voz se detuvo')
  })
  worker = child
  return child
}

function timeout(id: number): void {
  const st = finish(id)
  if (!st) return
  worker?.postMessage({ type: 'cancel', id })
  const message = 'La voz tardó demasiado'
  if (st.sender && !st.sender.isDestroyed())
    st.sender.send('voices:chunk', { requestId: id, type: 'error', message })
  st.reject?.(new UserError(message))
}

function start(
  requestId: number,
  id: VoiceId,
  text: string,
  speed: number,
  stream: Omit<Stream, 'timer' | 'parts' | 'sampleRate'>
): void {
  const dir = packDir()
  if (!dir) throw new UserError('Las voces todavía no están descargadas.')
  if (!text.trim()) throw new UserError('No hay nada que leer.')
  const safeSpeed = Math.min(2, Math.max(0.5, Number.isFinite(speed) ? speed : 1))
  const child = ensureWorker()
  if (idleTimer) clearTimeout(idleTimer)
  idleTimer = setTimeout(stopWorker, IDLE_MS)
  streams.set(requestId, {
    ...stream,
    parts: [],
    sampleRate: 44100,
    timer: setTimeout(() => timeout(requestId), STALL_MS)
  })
  const def = voiceDef(id)
  child.postMessage({
    type: 'speak',
    id: requestId,
    dir,
    lang: def.lang,
    text,
    speed: safeSpeed
  })
}

let internalId = -1

/** Genera todo el audio de un texto y lo devuelve junto (para pruebas) */
export function speak(id: VoiceId, text: string, speed: number): Promise<SpeechAudio> {
  return new Promise<SpeechAudio>((resolve, reject) => {
    start(internalId--, id, text, speed, { sender: null, resolve, reject })
  })
}

/** Genera el audio por trozos y los va mandando a la ventana que lo pidió (con el mismo `requestId`) */
export function speakStream(
  sender: WebContents,
  requestId: number,
  id: VoiceId,
  text: string,
  speed: number
): void {
  start(requestId, id, text, speed, { sender })
}

export function cancelSpeak(requestId: number): void {
  if (finish(requestId)) worker?.postMessage({ type: 'cancel', id: requestId })
}

/** Carga el motor con anticipación, para que la primera frase no tarde */
export function warmup(): void {
  const dir = packDir()
  if (!dir) return
  const child = ensureWorker()
  for (const lang of ['es', 'en']) child.postMessage({ type: 'warmup', dir, lang })
  if (idleTimer) clearTimeout(idleTimer)
  idleTimer = setTimeout(stopWorker, IDLE_MS)
}

export function registerVoiceHandlers(): void {
  handle('voices:speak', (_e, p: { id: VoiceId; text: string; speed: number }) =>
    speak(p.id, p.text, p.speed)
  )
  handle(
    'voices:speakStream',
    (e, p: { requestId: number; id: VoiceId; text: string; speed: number }) =>
      speakStream(e.sender, p.requestId, p.id, p.text, p.speed)
  )
  handle('voices:cancelSpeak', (_e, requestId: number) => cancelSpeak(requestId))
  handle('voices:warmup', () => warmup())
  app.on('before-quit', stopWorker)
}
