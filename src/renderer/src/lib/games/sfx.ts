/**
 * Sonidos de los juegos, hechos con el audio del sistema (no hay archivos de sonido).
 * Todo falla en silencio si el equipo no tiene audio: el juego sigue funcionando.
 */

let context: AudioContext | null = null

function audio(): AudioContext | null {
  try {
    context ??= new AudioContext()
    if (context.state === 'suspended') void context.resume()
    return context
  } catch {
    return null
  }
}

export interface Tone {
  /** Frecuencia en Hz */
  freq: number
  /** Cuándo empieza, en segundos desde ahora */
  at: number
  /** Cuánto dura, en segundos */
  length: number
  type?: OscillatorType
  /** Volumen de 0 a 1 (por defecto 0.25) */
  volume?: number
}

/** Toca varias notas (pueden sonar a la vez). Con una envolvente suave para que no suenen «a clic». */
export function playTones(tones: Tone[]): void {
  const ctx = audio()
  if (!ctx) return
  try {
    for (const { freq, at, length, type = 'sine', volume = 0.25 } of tones) {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      const start = ctx.currentTime + at
      osc.type = type
      osc.frequency.value = freq
      gain.gain.setValueAtTime(0.0001, start)
      gain.gain.exponentialRampToValueAtTime(volume, start + 0.015)
      gain.gain.exponentialRampToValueAtTime(0.0001, start + length)
      osc.connect(gain).connect(ctx.destination)
      osc.start(start)
      osc.stop(start + length + 0.02)
    }
  } catch {
    // Sin sonido disponible
  }
}

export const sfx = {
  /** Respuesta correcta */
  correct: () =>
    playTones([
      { freq: 659, at: 0, length: 0.14 },
      { freq: 880, at: 0.12, length: 0.3 }
    ]),
  /** Respuesta incorrecta */
  wrong: () =>
    playTones([
      { freq: 220, at: 0, length: 0.22, type: 'sawtooth', volume: 0.18 },
      { freq: 165, at: 0.18, length: 0.35, type: 'sawtooth', volume: 0.18 }
    ]),
  /** Un clic suave (elegir, voltear una carta) */
  pop: () => playTones([{ freq: 520, at: 0, length: 0.08, type: 'triangle' }]),
  /** Segundo que corre en una cuenta regresiva */
  tick: () => playTones([{ freq: 1100, at: 0, length: 0.04, volume: 0.15 }]),
  /** Se acabó el tiempo */
  timeUp: () => playTones([0, 0.45, 0.9].map((at) => ({ freq: 880, at, length: 0.3 }))),
  /** Ganó alguien o se terminó el juego */
  win: () =>
    playTones(
      [523, 659, 784, 1047, 784, 1047].map((freq, i) => ({ freq, at: i * 0.14, length: 0.26 }))
    )
}
