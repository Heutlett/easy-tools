/**
 * Sintetizador de los juegos de música: instrumentos aproximados con la Web Audio API
 * (osciladores, ruido, filtros y envolventes). No usa archivos de sonido.
 * Todo falla en silencio si el equipo no tiene audio.
 */

export type InstrumentId =
  | 'piano'
  | 'marimba'
  | 'flauta'
  | 'guitarra'
  | 'violin'
  | 'trompeta'
  | 'ocarina'
  | 'tambor'
  | 'maracas'
  | 'pandereta'
  | 'triangulo'
  | 'claves'
  | 'metronomo'

export interface InstrumentInfo {
  name: string
  /** Suena a una altura (notas) o es de sonido sin altura definida */
  pitched: boolean
}

export const INSTRUMENT_INFO: Record<InstrumentId, InstrumentInfo> = {
  piano: { name: 'Piano', pitched: true },
  marimba: { name: 'Marimba', pitched: true },
  flauta: { name: 'Flauta', pitched: true },
  guitarra: { name: 'Guitarra', pitched: true },
  violin: { name: 'Violín', pitched: true },
  trompeta: { name: 'Trompeta', pitched: true },
  ocarina: { name: 'Ocarina', pitched: true },
  tambor: { name: 'Tambor', pitched: false },
  maracas: { name: 'Maracas', pitched: false },
  pandereta: { name: 'Pandereta', pitched: false },
  triangulo: { name: 'Triángulo', pitched: false },
  claves: { name: 'Claves', pitched: false },
  metronomo: { name: 'Metrónomo', pitched: false }
}

export interface Voice {
  /** Suelta la nota (a esa hora del reloj de audio; por defecto ahora) */
  release: (at?: number) => void
}

// ---------- Contexto de audio, compresor y «bus» que se puede silenciar de golpe ----------

let ctx: AudioContext | null = null
let failed = false
let comp: DynamicsCompressorNode | null = null
let bus: GainNode | null = null
let noiseBuf: AudioBuffer | null = null
const active = new Set<Voice>()

export function audio(): AudioContext | null {
  if (failed) return null
  try {
    if (!ctx) {
      ctx = new AudioContext()
      const master = ctx.createGain()
      master.gain.value = 0.85
      comp = ctx.createDynamicsCompressor()
      comp.threshold.value = -14
      comp.knee.value = 12
      comp.ratio.value = 8
      comp.attack.value = 0.003
      comp.release.value = 0.25
      comp.connect(master).connect(ctx.destination)
    }
    if (ctx.state === 'suspended') void ctx.resume()
    return ctx
  } catch {
    failed = true
    return null
  }
}

/** Si hay audio en este equipo (solo falla si el sistema no lo permite) */
export const audioAvailable = (): boolean => audio() !== null

function out(c: AudioContext): AudioNode {
  if (!bus) {
    bus = c.createGain()
    bus.connect(comp!)
  }
  return bus
}

function noise(c: AudioContext): AudioBuffer {
  if (!noiseBuf) {
    noiseBuf = c.createBuffer(1, c.sampleRate * 2, c.sampleRate)
    const d = noiseBuf.getChannelData(0)
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1
  }
  return noiseBuf
}

/** Silencia todo lo que suena o está programado (al salir de un juego o al pulsar «Detener») */
export function stopAll(): void {
  if (!ctx || !bus) return
  const old = bus
  bus = null
  try {
    old.gain.cancelScheduledValues(ctx.currentTime)
    old.gain.setValueAtTime(old.gain.value, ctx.currentTime)
    old.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.04)
    setTimeout(() => old.disconnect(), 120)
  } catch {
    // nada
  }
  for (const v of [...active]) v.release()
  active.clear()
}

// ---------- Utilidades de envolvente ----------

const FLOOR = 0.0001

function hold(p: AudioParam, t: number): void {
  if (typeof p.cancelAndHoldAtTime === 'function') p.cancelAndHoldAtTime(t)
  else p.cancelScheduledValues(t)
}

/** Ataque corto y caída exponencial (instrumentos que se golpean o se puntean) */
function pluck(p: AudioParam, t: number, peak: number, attack: number, tau: number): void {
  p.setValueAtTime(FLOOR, t)
  p.linearRampToValueAtTime(peak, t + attack)
  p.setTargetAtTime(FLOOR, t + attack, tau)
}

/** Ataque suave y nota sostenida (instrumentos de viento y arco) */
function sustain(p: AudioParam, t: number, peak: number, attack: number, level = 0.9): void {
  p.setValueAtTime(FLOOR, t)
  p.linearRampToValueAtTime(peak, t + attack)
  p.setTargetAtTime(peak * level, t + attack, 0.12)
}

type Source = AudioScheduledSourceNode

function makeVoice(
  c: AudioContext,
  g: GainNode,
  sources: Source[],
  naturalEnd: number | null,
  relTau: number
): Voice {
  let released = false
  const voice: Voice = {
    release(at) {
      if (released) return
      released = true
      active.delete(voice)
      const t = Math.max(at ?? 0, c.currentTime)
      if (naturalEnd !== null && t >= naturalEnd) return
      try {
        hold(g.gain, t)
        g.gain.setTargetAtTime(FLOOR, t, relTau)
        for (const s of sources) s.stop(t + relTau * 7)
      } catch {
        // la nota ya había terminado
      }
    }
  }
  if (naturalEnd === null) active.add(voice)
  return voice
}

function osc(c: AudioContext, type: OscillatorType, freq: number, t: number): OscillatorNode {
  const o = c.createOscillator()
  o.type = type
  o.frequency.value = freq
  o.start(t)
  return o
}

function noiseSource(c: AudioContext, t: number, loop = false): AudioBufferSourceNode {
  const s = c.createBufferSource()
  s.buffer = noise(c)
  s.loop = loop
  s.start(t, Math.random() * 1.5)
  return s
}

function filter(
  c: AudioContext,
  type: BiquadFilterType,
  freq: number,
  q = 1,
  gain = 0
): BiquadFilterNode {
  const f = c.createBiquadFilter()
  f.type = type
  f.frequency.value = freq
  f.Q.value = q
  f.gain.value = gain
  return f
}

function gainNode(c: AudioContext, value = 1): GainNode {
  const g = c.createGain()
  g.gain.value = value
  return g
}

function stopAt(sources: Source[], t: number): void {
  for (const s of sources) s.stop(t)
}

/** Vibrato: una onda lenta que mueve la afinación (en centésimas de semitono) */
function vibrato(
  c: AudioContext,
  t: number,
  rate: number,
  cents: number,
  delay: number,
  targets: OscillatorNode[]
): OscillatorNode {
  const lfo = osc(c, 'sine', rate, t)
  const depth = gainNode(c, 0)
  depth.gain.setValueAtTime(0, t)
  depth.gain.setValueAtTime(0, t + delay)
  depth.gain.linearRampToValueAtTime(cents, t + delay + 0.3)
  lfo.connect(depth)
  for (const o of targets) depth.connect(o.detune)
  return lfo
}

// ---------- Cuerda pulsada (Karplus–Strong, calculada en un buffer) ----------

const stringCache = new Map<number, { buffer: AudioBuffer; base: number }>()

function stringBuffer(c: AudioContext, freq: number): { buffer: AudioBuffer; base: number } {
  const key = Math.round(freq * 10)
  const hit = stringCache.get(key)
  if (hit) return hit
  const sr = c.sampleRate
  const n = Math.max(2, Math.round(sr / freq - 0.5))
  const base = sr / (n + 0.5)
  const length = Math.floor(sr * 2.4)
  const buffer = c.createBuffer(1, length, sr)
  const d = buffer.getChannelData(0)
  // Excitación: ruido suavizado, con una muesca (posición de la púa)
  const seed = new Float32Array(n)
  for (let i = 0; i < n; i++) seed[i] = Math.random() * 2 - 1
  const comb = Math.max(1, Math.round(n / 5))
  for (let i = 0; i < n; i++) d[i] = seed[i] - 0.6 * seed[(i + comb) % n]
  for (let i = 1; i < n; i++) d[i] = 0.5 * d[i] + 0.5 * d[i - 1]
  for (let i = n; i < length; i++)
    d[i] = 0.9965 * 0.5 * (d[i - n] + (i > n ? d[i - n - 1] : d[i - n]))
  let peak = 0
  for (let i = 0; i < length; i++) peak = Math.max(peak, Math.abs(d[i]))
  for (let i = 0; i < length; i++) d[i] /= peak || 1
  if (stringCache.size > 90) stringCache.clear()
  const entry = { buffer, base }
  stringCache.set(key, entry)
  return entry
}

// ---------- Instrumentos ----------

type Maker = (c: AudioContext, dest: AudioNode, f: number, t: number, v: number) => Voice

const PIANO_PARTIALS: [number, number, number][] = [
  [1, 1, 1],
  [2, 0.5, 0.6],
  [3, 0.3, 0.45],
  [4, 0.16, 0.35],
  [5, 0.1, 0.3],
  [6, 0.06, 0.25]
]

const piano: Maker = (c, dest, f, t, v) => {
  const g = gainNode(c, v * 0.32)
  const lp = filter(c, 'lowpass', Math.min(9000, 1800 + f * 5), 0.5)
  g.connect(lp).connect(dest)
  const tau = Math.max(0.3, 0.9 * Math.pow(262 / f, 0.45))
  const sources: Source[] = []
  for (const [n, amp, k] of PIANO_PARTIALS) {
    if (f * n > 12000) break
    const freq = f * n * (1 + 0.0003 * n * n)
    for (const [detune, share] of n === 1
      ? [
          [-1, 0.8],
          [1.5, 0.25]
        ]
      : [[0, 1]]) {
      const o = osc(c, 'sine', freq, t)
      o.detune.value = detune
      const pg = gainNode(c, 0)
      pluck(pg.gain, t, amp * share, 0.004, tau * k)
      o.connect(pg).connect(g)
      sources.push(o)
    }
  }
  const hammer = noiseSource(c, t)
  const hf = filter(c, 'bandpass', Math.min(5000, f * 3), 0.8)
  const hg = gainNode(c, 0)
  pluck(hg.gain, t, 0.12, 0.002, 0.012)
  hammer.connect(hf).connect(hg).connect(g)
  sources.push(hammer)
  const end = t + 0.004 + tau * 6.5
  g.gain.setTargetAtTime(0, end - 0.5, 0.12)
  stopAt(sources, end)
  return makeVoice(c, g, sources, end, 0.22)
}

const marimba: Maker = (c, dest, f, t, v) => {
  const g = gainNode(c, v * 0.7)
  g.connect(dest)
  const tau = Math.max(0.12, 0.2 * Math.pow(262 / f, 0.5))
  const sources: Source[] = []
  for (const [ratio, amp, k] of [
    [1, 1, 1],
    [4, 0.32, 0.4],
    [9.9, 0.07, 0.18]
  ]) {
    const o = osc(c, 'sine', f * ratio, t)
    const pg = gainNode(c, 0)
    pluck(pg.gain, t, amp, 0.003, tau * k)
    o.connect(pg).connect(g)
    sources.push(o)
  }
  const thump = noiseSource(c, t)
  const tf = filter(c, 'lowpass', 900)
  const tg = gainNode(c, 0)
  pluck(tg.gain, t, 0.25, 0.002, 0.012)
  thump.connect(tf).connect(tg).connect(g)
  sources.push(thump)
  const end = t + tau * 7
  stopAt(sources, end)
  return makeVoice(c, g, sources, end, 0.1)
}

const flauta: Maker = (c, dest, f, t, v) => {
  const g = gainNode(c, 0)
  sustain(g.gain, t, v * 0.42, 0.07)
  g.connect(dest)
  const sources: Source[] = []
  const main: OscillatorNode[] = []
  for (const [n, amp] of [
    [1, 1],
    [2, 0.14],
    [3, 0.05]
  ]) {
    const o = osc(c, 'sine', f * n, t)
    o.connect(gainNode(c, amp)).connect(g)
    sources.push(o)
    main.push(o)
  }
  const breath = noiseSource(c, t, true)
  const bf = filter(c, 'bandpass', Math.min(f * 2, 6000), 1.3)
  breath.connect(bf).connect(gainNode(c, 0.1)).connect(g)
  sources.push(breath, vibrato(c, t, 5, 9, 0.25, main))
  return makeVoice(c, g, sources, null, 0.07)
}

const ocarina: Maker = (c, dest, f, t, v) => {
  const g = gainNode(c, 0)
  sustain(g.gain, t, v * 0.42, 0.05, 0.95)
  g.connect(dest)
  const sources: Source[] = []
  const main: OscillatorNode[] = []
  for (const [n, amp] of [
    [1, 1],
    [2, 0.04]
  ]) {
    const o = osc(c, 'sine', f * n, t)
    o.connect(gainNode(c, amp)).connect(g)
    sources.push(o)
    main.push(o)
  }
  const breath = noiseSource(c, t, true)
  breath
    .connect(filter(c, 'bandpass', f, 9))
    .connect(gainNode(c, 0.05))
    .connect(g)
  sources.push(breath, vibrato(c, t, 4.5, 4, 0.5, main))
  return makeVoice(c, g, sources, null, 0.08)
}

const violin: Maker = (c, dest, f, t, v) => {
  const g = gainNode(c, 0)
  sustain(g.gain, t, v * 0.42, 0.11, 0.95)
  const lp = filter(c, 'lowpass', Math.min(f * 4.5, 5000), 1.5)
  g.connect(dest)
  lp.connect(g)
  const sources: Source[] = []
  const saws: OscillatorNode[] = []
  const saw = osc(c, 'sawtooth', f, t)
  saw.connect(lp)
  sources.push(saw)
  saws.push(saw)
  const bow = noiseSource(c, t, true)
  bow
    .connect(filter(c, 'bandpass', Math.min(f * 3, 4000), 0.8))
    .connect(gainNode(c, 0.03))
    .connect(g)
  sources.push(bow, vibrato(c, t, 5.5, 16, 0.18, saws))
  return makeVoice(c, g, sources, null, 0.09)
}

const trompeta: Maker = (c, dest, f, t, v) => {
  const g = gainNode(c, 0)
  sustain(g.gain, t, v * 0.34, 0.035, 0.9)
  const lp = filter(c, 'lowpass', f * 2, 1)
  lp.frequency.setValueAtTime(f * 2, t)
  lp.frequency.linearRampToValueAtTime(Math.min(f * 7, 7500), t + 0.08)
  const body = filter(c, 'peaking', 1300, 1, 5)
  lp.connect(body).connect(g)
  g.connect(dest)
  const sources: Source[] = []
  const saws: OscillatorNode[] = []
  const saw = osc(c, 'sawtooth', f, t)
  saw.connect(lp)
  sources.push(saw)
  saws.push(saw)
  sources.push(vibrato(c, t, 5, 7, 0.45, saws))
  return makeVoice(c, g, sources, null, 0.05)
}

const guitarra: Maker = (c, dest, f, t, v) => {
  const { buffer, base } = stringBuffer(c, f)
  const src = c.createBufferSource()
  src.buffer = buffer
  src.playbackRate.value = f / base
  const g = gainNode(c, 0)
  g.gain.setValueAtTime(FLOOR, t)
  g.gain.linearRampToValueAtTime(v * 0.7, t + 0.003)
  const lp = filter(c, 'lowpass', 2600, 0.6)
  const body = filter(c, 'peaking', 220, 1.2, 4)
  src.connect(lp).connect(body).connect(g).connect(dest)
  src.start(t)
  const end = t + buffer.duration / (f / base)
  return makeVoice(c, g, [src], end, 0.12)
}

/** Golpe de ruido filtrado */
function burst(
  c: AudioContext,
  dest: AudioNode,
  t: number,
  opts: {
    type: BiquadFilterType
    freq: number
    q?: number
    peak: number
    attack: number
    tau: number
  }
): Source {
  const s = noiseSource(c, t)
  const g = gainNode(c, 0)
  pluck(g.gain, t, opts.peak, opts.attack, opts.tau)
  s.connect(filter(c, opts.type, opts.freq, opts.q ?? 0.8))
    .connect(g)
    .connect(dest)
  s.stop(t + opts.attack + opts.tau * 7)
  return s
}

const tambor: Maker = (c, dest, _f, t, v) => {
  const g = gainNode(c, v * 0.9)
  g.connect(dest)
  const o = osc(c, 'sine', 200, t)
  o.frequency.setValueAtTime(200, t)
  o.frequency.exponentialRampToValueAtTime(85, t + 0.12)
  const og = gainNode(c, 0)
  pluck(og.gain, t, 0.9, 0.002, 0.09)
  o.connect(og).connect(g)
  o.stop(t + 0.8)
  burst(c, g, t, { type: 'bandpass', freq: 1800, q: 0.7, peak: 0.3, attack: 0.002, tau: 0.05 })
  return makeVoice(c, g, [o], t + 0.9, 0.05)
}

const maracas: Maker = (c, dest, _f, t, v) => {
  const g = gainNode(c, v * 1.1)
  g.connect(dest)
  burst(c, g, t, { type: 'highpass', freq: 5200, q: 0.7, peak: 0.5, attack: 0.012, tau: 0.03 })
  burst(c, g, t + 0.065, {
    type: 'highpass',
    freq: 5600,
    q: 0.7,
    peak: 0.4,
    attack: 0.012,
    tau: 0.045
  })
  return makeVoice(c, g, [], t + 0.6, 0.05)
}

const pandereta: Maker = (c, dest, _f, t, v) => {
  const g = gainNode(c, v * 1.0)
  g.connect(dest)
  const sources: Source[] = []
  const skin = osc(c, 'sine', 230, t)
  skin.frequency.exponentialRampToValueAtTime(150, t + 0.06)
  const sg = gainNode(c, 0)
  pluck(sg.gain, t, 0.55, 0.002, 0.04)
  skin.connect(sg).connect(g)
  skin.stop(t + 0.5)
  sources.push(skin)
  burst(c, g, t, { type: 'highpass', freq: 6500, q: 0.7, peak: 0.28, attack: 0.002, tau: 0.06 })
  for (const jf of [5200, 6300, 7400, 8700, 9800]) {
    const o = osc(c, 'square', jf, t)
    const jg = gainNode(c, 0)
    pluck(jg.gain, t, 0.035, 0.002, 0.1)
    o.connect(filter(c, 'bandpass', jf, 6))
      .connect(jg)
      .connect(g)
    o.stop(t + 1)
    sources.push(o)
  }
  return makeVoice(c, g, sources, t + 1, 0.05)
}

const triangulo: Maker = (c, dest, _f, t, v) => {
  const g = gainNode(c, v * 0.3)
  g.connect(dest)
  const sources: Source[] = []
  for (const [r, amp] of [
    [1, 1],
    [2.76, 0.55],
    [5.4, 0.3],
    [8.93, 0.18]
  ]) {
    const o = osc(c, 'sine', 1650 * r, t)
    const pg = gainNode(c, 0)
    pluck(pg.gain, t, amp, 0.002, 0.7 / Math.sqrt(r))
    o.connect(pg).connect(g)
    o.stop(t + 5)
    sources.push(o)
  }
  return makeVoice(c, g, sources, t + 5, 0.2)
}

const claves: Maker = (c, dest, _f, t, v) => {
  const g = gainNode(c, v * 0.8)
  g.connect(dest)
  const sources: Source[] = []
  for (const [freq, peak, tau] of [
    [2300, 0.8, 0.045],
    [3500, 0.3, 0.022]
  ]) {
    const o = osc(c, 'sine', freq, t)
    const pg = gainNode(c, 0)
    pluck(pg.gain, t, peak, 0.001, tau)
    o.connect(pg).connect(g)
    o.stop(t + 0.5)
    sources.push(o)
  }
  burst(c, g, t, { type: 'bandpass', freq: 3000, q: 1, peak: 0.18, attack: 0.001, tau: 0.01 })
  return makeVoice(c, g, sources, t + 0.5, 0.03)
}

/** Clic suave de metrónomo; con `f` > 1 es el tiempo fuerte (más agudo) */
const metronomo: Maker = (c, dest, f, t, v) => {
  const accent = f > 1
  const g = gainNode(c, v * (accent ? 1.3 : 0.95))
  g.connect(dest)
  const o = osc(c, 'sine', accent ? 1500 : 1000, t)
  const pg = gainNode(c, 0)
  pluck(pg.gain, t, 1, 0.003, 0.018)
  o.connect(pg).connect(g)
  o.stop(t + 0.25)
  return makeVoice(c, g, [o], t + 0.25, 0.02)
}

const MAKERS: Record<InstrumentId, Maker> = {
  piano,
  marimba,
  flauta,
  guitarra,
  violin,
  trompeta,
  ocarina,
  tambor,
  maracas,
  pandereta,
  triangulo,
  claves,
  metronomo
}

/**
 * Empieza una nota (a la hora `at` del reloj de audio; por defecto ahora) y devuelve su `release`.
 * Los instrumentos de viento y arco suenan hasta que se suelta; los percusivos se apagan solos.
 */
export function startVoice(inst: InstrumentId, freq: number, at?: number, vol = 0.7): Voice | null {
  const c = audio()
  if (!c) return null
  try {
    return MAKERS[inst](c, out(c), freq, Math.max(at ?? 0, c.currentTime + 0.005), vol)
  } catch {
    return null
  }
}

/** Toca una nota: empieza dentro de `after` segundos y dura `dur` */
export function playNote(
  inst: InstrumentId,
  freq: number,
  opts: { after?: number; dur?: number; vol?: number } = {}
): void {
  const c = audio()
  if (!c) return
  const at = c.currentTime + (opts.after ?? 0)
  const voice = startVoice(inst, freq, at, opts.vol)
  voice?.release(at + (opts.dur ?? 0.5))
}

/** Un golpe de instrumento sin altura (o un clic) dentro de `after` segundos */
export const hit = (inst: InstrumentId, after = 0, vol = 0.7, accent = false): void =>
  playNote(inst, accent ? 2 : 1, { after, vol, dur: 0.3 })

/** Segundos del reloj de audio hasta una hora del reloj de la página (`performance.now()` en ms) */
export const secondsUntil = (perfMs: number): number => (perfMs - performance.now()) / 1000
