/**
 * Notas musicales: nombres en español, posición en el pentagrama y frecuencia.
 * Una nota se guarda como «paso diatónico» (Do4 = 0, Re4 = 1 … Si4 = 6, Do5 = 7) más su alteración.
 */

export const NOTE_NAMES = ['Do', 'Re', 'Mi', 'Fa', 'Sol', 'La', 'Si'] as const
const SEMITONES = [0, 2, 4, 5, 7, 9, 11]
const LETTERS = ['C', 'D', 'E', 'F', 'G', 'A', 'B']

/** Alteración: -1 bemol, 0 natural, 1 sostenido */
export type Alter = -1 | 0 | 1

export interface Pitch {
  /** Pasos desde el Do central (Do4 = 0) */
  step: number
  alter: Alter
}

/** Nota MIDI (Do central = 60, La4 = 69) */
export function midiOf(p: Pitch): number {
  const octave = Math.floor(p.step / 7)
  const index = ((p.step % 7) + 7) % 7
  return 60 + octave * 12 + SEMITONES[index] + p.alter
}

export const freqOfMidi = (midi: number): number => 440 * Math.pow(2, (midi - 69) / 12)
export const freqOf = (p: Pitch): number => freqOfMidi(midiOf(p))

/** Nombre sin octava: «Do», «Fa♯», «Si♭» */
export function pitchName(p: Pitch): string {
  const index = ((p.step % 7) + 7) % 7
  return NOTE_NAMES[index] + (p.alter === 1 ? '♯' : p.alter === -1 ? '♭' : '')
}

/** Nota en el estilo científico: «C4», «F#5», «Bb3» → Pitch */
export function parsePitch(text: string): Pitch {
  const m = /^([A-G])([#b]?)(-?\d)$/.exec(text)
  if (!m) throw new Error(`Nota no válida: ${text}`)
  return {
    step: (Number(m[3]) - 4) * 7 + LETTERS.indexOf(m[1]),
    alter: m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0
  }
}

/** Nota MIDI → Pitch (usa sostenidos para las teclas negras) */
export function pitchOfMidi(midi: number): Pitch {
  const octave = Math.floor(midi / 12) - 5
  const semi = ((midi % 12) + 12) % 12
  const white = SEMITONES.indexOf(semi)
  if (white >= 0) return { step: octave * 7 + white, alter: 0 }
  return { step: octave * 7 + SEMITONES.indexOf(semi - 1), alter: 1 }
}
