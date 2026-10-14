import { app, utilityProcess, type UtilityProcess, type WebContents } from 'electron'
import { join } from 'path'
import { voiceDef, type SpeechAudio, type VoiceId, type VoiceLang } from '../shared/voices'
import { voicesDir } from './components'
import { handle } from './ipc'
import { UserError } from './jobs'

/* ---------- Voces ---------- */

const packDir = (): string | null => voicesDir()

/* ---------- Síntesis ---------- */

/** Si en este tiempo no llega nada del proceso de voz, se da por perdido */
const STALL_MS = 60_000
/**
 * Cada idioma tiene su propio proceso, que solo existe mientras hace falta: el modelo ocupa unos 400 MB de memoria. Se carga cuando una
 * pantalla que lee en ese idioma se abre (`acquire`) y se descarga poco después de que se cierre (`release`).
 */
const RELEASE_GRACE_MS = 20_000
/** Si alguien pide leer sin haber avisado (pruebas), el proceso se cierra solo pasado este tiempo */
const IDLE_MS = 60_000

interface Stream {
  lang: VoiceLang
  /** Quién pidió el audio (recibe los trozos); null si solo se junta todo (pruebas) */
  sender: WebContents | null
  parts: Float32Array[]
  sampleRate: number
  timer: ReturnType<typeof setTimeout>
  resolve?: (a: SpeechAudio) => void
  reject?: (e: Error) => void
}

const workers = new Map<VoiceLang, UtilityProcess>()
const killTimers = new Map<VoiceLang, ReturnType<typeof setTimeout>>()
const streams = new Map<number, Stream>()
/** Cuántas pantallas (por ventana) están usando cada idioma */
const holders = new Map<number, Map<VoiceLang, number>>()

const holdersOf = (lang: VoiceLang): number =>
  [...holders.values()].reduce((n, m) => n + (m.get(lang) ?? 0), 0)

function finish(id: number): Stream | undefined {
  const st = streams.get(id)
  if (st) {
    clearTimeout(st.timer)
    streams.delete(id)
  }
  return st
}

function failAll(lang: VoiceLang, message: string): void {
  for (const [id, st] of [...streams]) {
    if (st.lang !== lang) continue
    finish(id)
    if (st.sender && !st.sender.isDestroyed())
      st.sender.send('voices:chunk', { requestId: id, type: 'error', message })
    st.reject?.(new Error(message))
  }
}

function scheduleKill(lang: VoiceLang, ms: number): void {
  const old = killTimers.get(lang)
  if (old) clearTimeout(old)
  killTimers.set(
    lang,
    setTimeout(() => {
      killTimers.delete(lang)
      if (holdersOf(lang) === 0) stopWorker(lang)
    }, ms)
  )
}

/** Cierra el proceso de un idioma: la memoria del modelo se libera de verdad */
export function stopWorker(lang: VoiceLang): void {
  const t = killTimers.get(lang)
  if (t) clearTimeout(t)
  killTimers.delete(lang)
  const w = workers.get(lang)
  workers.delete(lang)
  if (w) {
    failAll(lang, 'La voz se detuvo')
    w.kill()
  }
}

export const stopAll = (): void => {
  for (const lang of ['es', 'en'] as const) stopWorker(lang)
}

interface WorkerMessage {
  id: number
  type: 'chunk' | 'done' | 'error'
  samples?: Float32Array
  sampleRate?: number
  index?: number
  error?: string
}

function ensureWorker(lang: VoiceLang): UtilityProcess {
  const existing = workers.get(lang)
  if (existing) return existing
  const child = utilityProcess.fork(join(__dirname, 'voiceWorker.js'), [], {
    serviceName: `Voz de Educando (${lang})`
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
    if (workers.get(lang) === child) workers.delete(lang)
    failAll(lang, 'La voz se detuvo')
  })
  workers.set(lang, child)
  return child
}

function timeout(id: number): void {
  const st = finish(id)
  if (!st) return
  workers.get(st.lang)?.postMessage({ type: 'cancel', id })
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
  stream: Omit<Stream, 'timer' | 'parts' | 'sampleRate' | 'lang'>
): void {
  const dir = packDir()
  if (!dir) throw new UserError('Las voces todavía no están descargadas.')
  if (!text.trim()) throw new UserError('No hay nada que leer.')
  const def = voiceDef(id)
  const safeSpeed = Math.min(2, Math.max(0.5, Number.isFinite(speed) ? speed : 1))
  const child = ensureWorker(def.lang)
  // Si ninguna pantalla lo está usando, no se queda cargado
  if (holdersOf(def.lang) === 0) scheduleKill(def.lang, IDLE_MS)
  streams.set(requestId, {
    ...stream,
    lang: def.lang,
    parts: [],
    sampleRate: 24000,
    timer: setTimeout(() => timeout(requestId), STALL_MS)
  })
  child.postMessage({
    type: 'speak',
    id: requestId,
    dir,
    lang: def.lang,
    sid: def.sid,
    espeakLang: def.espeakLang,
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
  const st = finish(requestId)
  if (st) workers.get(st.lang)?.postMessage({ type: 'cancel', id: requestId })
}

const watched = new WeakSet<WebContents>()

/** Una pantalla que lee en este idioma se abrió: se carga el modelo (si no estaba) */
export function acquire(sender: WebContents, lang: VoiceLang): void {
  const dir = packDir()
  const mine = holders.get(sender.id) ?? new Map<VoiceLang, number>()
  holders.set(sender.id, mine)
  mine.set(lang, (mine.get(lang) ?? 0) + 1)
  // Si la ventana se recarga o se cierra, lo que tenía pedido se suelta
  if (!watched.has(sender)) {
    watched.add(sender)
    const drop = (): void => {
      const m = holders.get(sender.id)
      holders.delete(sender.id)
      for (const l of m?.keys() ?? []) if (holdersOf(l) === 0) scheduleKill(l, RELEASE_GRACE_MS)
    }
    sender.on('did-start-navigation', (_e, _url, isInPlace, isMainFrame) => {
      if (isMainFrame && !isInPlace) drop()
    })
    sender.once('destroyed', drop)
  }
  const t = killTimers.get(lang)
  if (t) clearTimeout(t)
  killTimers.delete(lang)
  if (!dir) return
  const def = voiceDef(lang)
  ensureWorker(lang).postMessage({
    type: 'warmup',
    dir,
    lang,
    sid: def.sid,
    espeakLang: def.espeakLang
  })
}

/** La pantalla se cerró: si nadie más usa ese idioma, el modelo se descarga poco después (por si se vuelve enseguida) */
export function release(sender: WebContents, lang: VoiceLang): void {
  const mine = holders.get(sender.id)
  if (!mine) return
  mine.set(lang, Math.max(0, (mine.get(lang) ?? 0) - 1))
  if (holdersOf(lang) === 0) scheduleKill(lang, RELEASE_GRACE_MS)
}

/** Cuántos idiomas tienen el modelo cargado (para pruebas) */
export const loadedLanguages = (): VoiceLang[] => [...workers.keys()]

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
  handle('voices:acquire', (e, lang: VoiceLang) => acquire(e.sender, lang))
  handle('voices:release', (e, lang: VoiceLang) => release(e.sender, lang))
  app.on('before-quit', stopAll)
}
