import type { InstrumentId } from '../_musica/synth'

export interface KeyboardSize {
  octaves: 1 | 2
  from: number
  to: number
}

export const SIZES: Record<1 | 2, KeyboardSize> = {
  1: { octaves: 1, from: 60, to: 72 },
  2: { octaves: 2, from: 60, to: 84 }
}

/** Teclas de la computadora → nota MIDI. Se usa `event.code`, así funciona con cualquier distribución del teclado. */
const ONE_OCTAVE: Record<string, number> = {
  KeyA: 60,
  KeyW: 61,
  KeyS: 62,
  KeyE: 63,
  KeyD: 64,
  KeyF: 65,
  KeyT: 66,
  KeyG: 67,
  KeyY: 68,
  KeyH: 69,
  KeyU: 70,
  KeyJ: 71,
  KeyK: 72
}

/** Dos octavas, como en los programas de música: fila de abajo (Z…) y fila de arriba (Q…) */
const TWO_OCTAVES: Record<string, number> = {
  KeyZ: 60,
  KeyS: 61,
  KeyX: 62,
  KeyD: 63,
  KeyC: 64,
  KeyV: 65,
  KeyG: 66,
  KeyB: 67,
  KeyH: 68,
  KeyN: 69,
  KeyJ: 70,
  KeyM: 71,
  KeyQ: 72,
  Digit2: 73,
  KeyW: 74,
  Digit3: 75,
  KeyE: 76,
  KeyR: 77,
  Digit5: 78,
  KeyT: 79,
  Digit6: 80,
  KeyY: 81,
  Digit7: 82,
  KeyU: 83,
  KeyI: 84
}

export const keyMap = (octaves: 1 | 2): Record<string, number> =>
  octaves === 1 ? ONE_OCTAVE : TWO_OCTAVES

/** Letra que se muestra en cada tecla del piano para la tecla de la computadora que la toca */
export function keyLabels(octaves: 1 | 2): Record<number, string> {
  const out: Record<number, string> = {}
  for (const [code, midi] of Object.entries(keyMap(octaves))) {
    out[midi] ??= code.replace('Key', '').replace('Digit', '')
  }
  return out
}

export const TIMBRES: InstrumentId[] = [
  'piano',
  'marimba',
  'flauta',
  'guitarra',
  'violin',
  'trompeta'
]

export type Labels = 'notes' | 'keys' | 'none'
