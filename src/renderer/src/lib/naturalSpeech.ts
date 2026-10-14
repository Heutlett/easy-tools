import { useSyncExternalStore } from 'react'
import type { SpeechAudio, VoiceId } from '../../../shared/voices'

/**
 * Lee en voz alta con una voz natural (ver src/main/voices.ts). El audio llega por trozos y se va reproduciendo sin cortes mientras
 * se generan los siguientes, así la voz empieza a sonar enseguida aunque el texto sea largo. Una frase a la vez: la nueva corta
 * la anterior. Lo ya generado se guarda un rato para repetirlo al instante.
 */
export type SpeechState = 'idle' | 'preparing' | 'playing' | 'error'

let state: SpeechState = 'idle'
const listeners = new Set<() => void>()
let errorTimer: ReturnType<typeof setTimeout> | null = null
const setState = (s: SpeechState): void => {
  if (errorTimer) clearTimeout(errorTimer)
  errorTimer = null
  if (s === state) return
  state = s
  listeners.forEach((l) => l())
  // El aviso de error se quita solo
  if (s === 'error') errorTimer = setTimeout(() => setState('idle'), 5000)
}

/** Si ahora se está generando o leyendo (para mostrar un aviso de carga) */
export function useSpeechState(): SpeechState {
  return useSyncExternalStore(
    (l) => (listeners.add(l), () => listeners.delete(l)),
    () => state
  )
}

let context: AudioContext | null = null
let sources: AudioBufferSourceNode[] = []
let nextStart = 0
let currentRequest = 0
let requestCounter = 0
let collected: SpeechAudio[] = []
let currentKey: string | null = null

/* ---------- Lo ya generado ---------- */

const MAX_CACHED_SAMPLES = 6_000_000
const cache = new Map<string, SpeechAudio[]>()
const size = (chunks: SpeechAudio[]): number => chunks.reduce((n, c) => n + c.samples.length, 0)

function remember(key: string, chunks: SpeechAudio[]): void {
  cache.delete(key)
  cache.set(key, chunks)
  let total = [...cache.values()].reduce((n, c) => n + size(c), 0)
  for (const k of cache.keys()) {
    if (total <= MAX_CACHED_SAMPLES) break
    total -= size(cache.get(k) ?? [])
    cache.delete(k)
  }
}

/* ---------- Reproducción ---------- */

function schedule(chunk: SpeechAudio): void {
  context ??= new AudioContext()
  const buffer = context.createBuffer(1, chunk.samples.length, chunk.sampleRate)
  buffer.copyToChannel(new Float32Array(chunk.samples), 0)
  const source = context.createBufferSource()
  source.buffer = buffer
  source.connect(context.destination)
  const at = Math.max(context.currentTime + 0.03, nextStart)
  source.start(at)
  nextStart = at + buffer.duration
  sources.push(source)
  const request = currentRequest
  source.onended = () => {
    sources = sources.filter((s) => s !== source)
    // Cuando termina el último trozo y ya no vienen más, queda en reposo
    if (request === currentRequest && sources.length === 0 && finished) setState('idle')
  }
  setState('playing')
}

let finished = false
let off: (() => void) | null = null

function listen(): void {
  if (off) return
  off = window.api.voices.onChunk((m) => {
    if (m.requestId !== currentRequest) return
    if (m.type === 'chunk') {
      const chunk = { samples: m.samples, sampleRate: m.sampleRate }
      collected.push(chunk)
      schedule(chunk)
    } else if (m.type === 'done') {
      finished = true
      if (currentKey) remember(currentKey, collected)
      if (sources.length === 0) setState('idle')
    } else {
      console.error('[voz]', m.message)
      finished = true
      if (sources.length === 0) setState('error')
    }
  })
}

/** Corta lo que esté sonando o generándose */
export function stopNatural(): void {
  const request = currentRequest
  currentRequest = ++requestCounter
  finished = true
  for (const s of sources) {
    s.onended = null
    try {
      s.stop()
    } catch {
      // Ya había terminado
    }
  }
  sources = []
  if (!finished || state !== 'idle')
    void window.api.voices.cancelSpeak(request).catch(() => undefined)
  setState('idle')
}

/** Lee el texto en voz alta con la voz indicada */
export async function speakNatural(id: VoiceId, text: string, rate: number): Promise<void> {
  stopNatural()
  listen()
  const request = currentRequest
  collected = []
  finished = false
  currentKey = `${id}|${rate}|${text}`
  nextStart = 0
  const cached = cache.get(currentKey)
  if (cached) {
    finished = true
    cache.delete(currentKey)
    cache.set(currentKey, cached)
    for (const chunk of cached) schedule(chunk)
    return
  }
  setState('preparing')
  try {
    context ??= new AudioContext()
    if (context.state === 'suspended') await context.resume()
    await window.api.voices.speakStream({ requestId: request, id, text, speed: rate })
  } catch (err) {
    console.error('[voz]', err)
    if (request === currentRequest) {
      finished = true
      setState('error')
    }
  }
}

/** Carga el motor con anticipación para que la primera frase no tarde */
export function warmUpVoices(): void {
  void window.api.voices.warmup().catch(() => undefined)
}
