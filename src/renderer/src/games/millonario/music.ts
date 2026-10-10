import { useCallback, useEffect } from 'react'
import { usePersistentState } from '../../lib/usePersistentState'

/**
 * Música del concurso. Es MÚSICA ORIGINAL de suspenso hecha con el audio del sistema (sin archivos): late un bajo
 * grave y suenan campanitas, y cambia según el momento (esperando, pensando la respuesta, suspenso de la respuesta final).
 * No es el tema del programa de televisión: ese tiene derechos de autor. Quien quiera puede poner su propia música
 * (un archivo MP3, por ejemplo) y se usa esa en lugar de la nuestra.
 */
export type Mood = 'menu' | 'question' | 'suspense' | 'off'

export interface MusicSettings {
  /** Con música o sin música */
  on: boolean
  /** Ruta de un archivo de audio propio, si se eligió */
  file: string | null
  /** Nombre del archivo, para mostrarlo */
  fileName: string | null
}

export const DEFAULT_MUSIC: MusicSettings = { on: true, file: null, fileName: null }

/* ---------- Partituras (en semitonos sobre La, para tocar en La menor) ---------- */

const A = (semis: number, octave = 0): number => 55 * Math.pow(2, octave + semis / 12)

interface Pattern {
  /** Duración de cada paso, en segundos */
  step: number
  /** Cada paso: nota del bajo (semitonos sobre La1, null = silencio) */
  bass: (number | null)[]
  /** Cada paso: nota de la campanita (semitonos sobre La3, null = silencio) */
  bell: (number | null)[]
  /** Acordes sostenidos (pad): semitonos sobre La2, uno por compás de 8 pasos */
  pad: number[][]
  /** Fuerza del bajo (0–1) */
  drive: number
}

const PATTERNS: Record<Exclude<Mood, 'off'>, Pattern> = {
  // Misterioso y tranquilo: mientras se prepara el concurso
  menu: {
    step: 0.42,
    bass: [0, null, null, null, 0, null, null, null, -4, null, null, null, -2, null, null, null],
    bell: [12, null, 15, null, 19, null, 15, null, 14, null, 17, null, 12, null, null, null],
    pad: [
      [0, 3, 7],
      [-4, 0, 3]
    ],
    drive: 0.35
  },
  // Tenso: se está pensando la respuesta
  question: {
    step: 0.25,
    bass: [0, 0, null, 0, 0, null, 0, null, -4, -4, null, -4, -4, null, -2, null],
    bell: [null, null, 24, null, null, null, 22, null, null, null, 20, null, null, 19, null, null],
    pad: [
      [0, 3, 6],
      [-4, 0, 3]
    ],
    drive: 0.6
  },
  // Muy tenso: se confirmó la respuesta final y todavía no se sabe
  suspense: {
    step: 0.16,
    bass: [0, null, 0, null, 0, null, 0, null, 0, 0, null, 0, 0, null, 0, 0],
    bell: [24, null, null, 25, null, null, 24, null, 27, null, null, 28, null, null, 31, null],
    pad: [
      [0, 3, 6],
      [1, 4, 7]
    ],
    drive: 0.85
  }
}

/**
 * Programa en `ctx` una vuelta de la partitura empezando en `start`, y deja todo conectado a `out`.
 * Devuelve cuándo termina. Se usa con el audio real y, para probar, con un contexto sin conexión.
 */
export function scheduleLoop(
  ctx: BaseAudioContext,
  out: AudioNode,
  mood: Exclude<Mood, 'off'>,
  start: number
): number {
  const p = PATTERNS[mood]
  const end = start + p.step * p.bass.length

  p.bass.forEach((n, i) => {
    if (n === null) return
    const t = start + i * p.step
    const osc = ctx.createOscillator()
    const filter = ctx.createBiquadFilter()
    const gain = ctx.createGain()
    osc.type = 'sawtooth'
    osc.frequency.value = A(n)
    filter.type = 'lowpass'
    filter.frequency.setValueAtTime(260 + 500 * p.drive, t)
    filter.frequency.exponentialRampToValueAtTime(140, t + p.step * 0.9)
    const peak = 0.22 * (0.6 + 0.4 * p.drive)
    gain.gain.setValueAtTime(0.0001, t)
    gain.gain.exponentialRampToValueAtTime(peak, t + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.0001, t + p.step * 0.95)
    osc.connect(filter).connect(gain).connect(out)
    osc.start(t)
    osc.stop(t + p.step)
  })

  p.bell.forEach((n, i) => {
    if (n === null) return
    const t = start + i * p.step
    const freq = A(n, 2)
    for (const [mult, vol] of [
      [1, 0.09],
      [2.01, 0.035]
    ] as const) {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.value = freq * mult
      gain.gain.setValueAtTime(0.0001, t)
      gain.gain.exponentialRampToValueAtTime(vol, t + 0.01)
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.9)
      osc.connect(gain).connect(out)
      osc.start(t)
      osc.stop(t + 0.95)
    }
  })

  // Acordes largos de fondo: uno por cada ocho pasos
  const barLen = p.step * 8
  p.pad.forEach((chord, bar) => {
    const t = start + bar * barLen
    chord.forEach((n) => {
      for (const detune of [-6, 6]) {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'triangle'
        osc.frequency.value = A(n, 1)
        osc.detune.value = detune
        gain.gain.setValueAtTime(0.0001, t)
        gain.gain.linearRampToValueAtTime(0.028, t + barLen * 0.35)
        gain.gain.linearRampToValueAtTime(0.0001, t + barLen)
        osc.connect(gain).connect(out)
        osc.start(t)
        osc.stop(t + barLen + 0.05)
      }
    })
  })
  return end
}

/* ---------- Reproductor ---------- */

const VOLUME = 1.4
const FADE = 0.35
const LOOKAHEAD = 0.4

class MusicEngine {
  private ctx: AudioContext | null = null
  private master: GainNode | null = null
  private timer: ReturnType<typeof setInterval> | null = null
  private nextAt = 0
  private mood: Mood = 'off'
  private settings: MusicSettings = DEFAULT_MUSIC
  private audio: HTMLAudioElement | null = null
  /** Cada partitura se vuelve a programar desde cero al cambiar de ambiente */
  private bus: GainNode | null = null

  configure(settings: MusicSettings): void {
    const fileChanged = settings.file !== this.settings.file
    this.settings = settings
    if (fileChanged) this.disposeFile()
    this.apply()
  }

  setMood(mood: Mood): void {
    if (mood === this.mood) return
    this.mood = mood
    this.apply()
  }

  /** Detiene todo (al salir del juego) */
  stop(): void {
    this.mood = 'off'
    this.apply()
  }

  private apply(): void {
    const playing = this.settings.on && this.mood !== 'off'
    if (!playing) {
      this.stopSynth()
      this.pauseFile()
      return
    }
    if (this.settings.file) {
      this.stopSynth()
      this.playFile()
    } else {
      this.pauseFile()
      this.startSynth()
    }
  }

  private context(): AudioContext | null {
    try {
      this.ctx ??= new AudioContext()
      if (this.ctx.state === 'suspended') void this.ctx.resume()
      return this.ctx
    } catch {
      return null
    }
  }

  private startSynth(): void {
    const ctx = this.context()
    if (!ctx || this.mood === 'off') return
    this.stopSynth()
    this.master ??= (() => {
      const g = ctx.createGain()
      g.gain.value = VOLUME
      g.connect(ctx.destination)
      return g
    })()
    const bus = ctx.createGain()
    bus.gain.setValueAtTime(0.0001, ctx.currentTime)
    bus.gain.exponentialRampToValueAtTime(1, ctx.currentTime + FADE)
    bus.connect(this.master)
    this.bus = bus
    this.nextAt = ctx.currentTime + 0.05
    const mood = this.mood
    const tick = (): void => {
      while (this.nextAt < ctx.currentTime + LOOKAHEAD) {
        this.nextAt = scheduleLoop(ctx, bus, mood, this.nextAt)
      }
    }
    tick()
    this.timer = setInterval(tick, 100)
  }

  private stopSynth(): void {
    if (this.timer) clearInterval(this.timer)
    this.timer = null
    const ctx = this.ctx
    const bus = this.bus
    this.bus = null
    if (!ctx || !bus) return
    // Se apaga poco a poco y se corta lo que ya estaba programado
    try {
      bus.gain.cancelScheduledValues(ctx.currentTime)
      bus.gain.setValueAtTime(Math.max(bus.gain.value, 0.0001), ctx.currentTime)
      bus.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + FADE)
    } catch {
      // Sin audio disponible
    }
    setTimeout(() => bus.disconnect(), (FADE + 0.1) * 1000)
  }

  private playFile(): void {
    const path = this.settings.file
    if (!path) return
    try {
      if (!this.audio) {
        this.audio = new Audio(window.api.mediaUrl(path))
        this.audio.loop = true
      }
      // Un poco más bajo mientras se espera la respuesta, para que se oiga la voz y los sonidos
      this.audio.volume = this.mood === 'menu' ? 0.7 : 0.5
      void this.audio.play().catch(() => undefined)
    } catch {
      // Si el archivo no se puede reproducir, el juego sigue sin música
    }
  }

  private pauseFile(): void {
    this.audio?.pause()
  }

  private disposeFile(): void {
    this.audio?.pause()
    this.audio = null
  }
}

/** Un solo reproductor para todo el juego */
export const music = new MusicEngine()

/** Los ajustes de música (con música o sin ella, y el archivo propio) que se recuerdan al volver a abrir la app */
export interface MusicControls {
  settings: MusicSettings
  /** Con música ↔ sin música */
  toggle: () => void
  /** Elige un archivo de audio propio (abre el selector del sistema) */
  chooseFile: () => void
  /** Con la música de siempre (la original del juego) */
  useOurs: () => void
  /** Sin música */
  turnOff: () => void
}

/** Se llama una sola vez en todo el juego y se pasa a donde haga falta (si no, cada copia tendría su propio estado) */
export function useMusicSettings(): MusicControls {
  const [settings, setSettings] = usePersistentState<MusicSettings>(
    'game:millonario:music',
    DEFAULT_MUSIC
  )
  useEffect(() => {
    music.configure(settings)
  }, [settings])

  const toggle = useCallback(
    () => setSettings({ ...settings, on: !settings.on }),
    [settings, setSettings]
  )

  const useOurs = useCallback(
    () => setSettings({ on: true, file: null, fileName: null }),
    [setSettings]
  )
  const turnOff = useCallback(
    () => setSettings({ ...settings, on: false }),
    [settings, setSettings]
  )

  const chooseFile = useCallback(() => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'audio/*,.mp3,.wav,.ogg,.m4a'
    input.onchange = () => {
      const file = input.files?.[0]
      if (!file) return
      const path = window.api.pathForFile(file)
      if (path) setSettings({ on: true, file: path, fileName: file.name })
    }
    input.click()
  }, [setSettings])

  return { settings, toggle, chooseFile, useOurs, turnOff }
}

/** Pone un ambiente mientras el componente esté en pantalla */
export function useMood(mood: Mood): void {
  useEffect(() => {
    music.setMood(mood)
  }, [mood])
}
