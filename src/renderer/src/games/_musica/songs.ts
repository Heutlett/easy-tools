import { freqOf, midiOf, parsePitch, type Pitch } from './notes'
import { hit, playNote, type InstrumentId } from './synth'

/**
 * Canciones de dominio público o tradicionales, escritas nota por nota.
 * Cada nota es «Nota+octava:duración» (en tiempos de negra; Do central = C4) y `r` es un silencio.
 * Las notas se escriben con la letra inglesa (C D E F G A B; # sostenido, b bemol) solo para ahorrar espacio.
 */

export interface SongNote {
  /** null = silencio */
  pitch: Pitch | null
  /** Duración en tiempos de negra */
  beats: number
}

export interface Song {
  id: string
  title: string
  emoji: string
  /** 1 = canciones que conoce la mayoría de niñas y niños; 2 = además clásicas y más difíciles */
  tier: 1 | 2
  /** Entra en «Adivina la melodía» (las demás solo sirven para practicar en el piano) */
  quiz: boolean
  /** Autoría o procedencia, para mostrar al terminar */
  credit: string
  /** Pulsos (negras) por minuto */
  bpm: number
  meter: [number, number]
  notes: SongNote[]
  /** Cantidad de notas de la primera frase (la pista más larga de «Adivina la melodía») */
  phrase: number
}

function parse(text: string): SongNote[] {
  return text
    .trim()
    .split(/\s+/)
    .map((token) => {
      const [name, beats] = token.split(':')
      return { pitch: name === 'r' ? null : parsePitch(name), beats: Number(beats) }
    })
}

const song = (s: Omit<Song, 'notes'> & { notes: string }): Song => ({ ...s, notes: parse(s.notes) })

export const SONGS: Song[] = [
  song({
    id: 'estrellita',
    title: 'Estrellita',
    emoji: '⭐',
    tier: 1,
    quiz: true,
    credit: 'Tradicional',
    bpm: 100,
    meter: [4, 4],
    phrase: 7,
    notes: `C4:1 C4:1 G4:1 G4:1 A4:1 A4:1 G4:2 F4:1 F4:1 E4:1 E4:1 D4:1 D4:1 C4:2
            G4:1 G4:1 F4:1 F4:1 E4:1 E4:1 D4:2 G4:1 G4:1 F4:1 F4:1 E4:1 E4:1 D4:2
            C4:1 C4:1 G4:1 G4:1 A4:1 A4:1 G4:2 F4:1 F4:1 E4:1 E4:1 D4:1 D4:1 C4:2`
  }),
  song({
    id: 'cumple',
    title: 'Cumpleaños feliz',
    emoji: '🎂',
    tier: 1,
    quiz: true,
    credit: 'Tradicional',
    bpm: 100,
    meter: [3, 4],
    phrase: 6,
    notes: `G4:0.75 G4:0.25 A4:1 G4:1 C5:1 B4:2 G4:0.75 G4:0.25
            A4:1 G4:1 D5:1 C5:2 G4:0.75 G4:0.25 G5:1 E5:1 C5:1
            B4:1 A4:1 F5:0.75 F5:0.25 E5:1 C5:1 D5:1 C5:3`
  }),
  song({
    id: 'alegria',
    title: 'Himno a la Alegría',
    emoji: '🎼',
    tier: 1,
    quiz: true,
    credit: 'Ludwig van Beethoven, 9.ª sinfonía',
    bpm: 108,
    meter: [4, 4],
    phrase: 8,
    notes: `E4:1 E4:1 F4:1 G4:1 G4:1 F4:1 E4:1 D4:1 C4:1 C4:1 D4:1 E4:1 E4:1.5 D4:0.5 D4:2
            E4:1 E4:1 F4:1 G4:1 G4:1 F4:1 E4:1 D4:1 C4:1 C4:1 D4:1 E4:1 D4:1.5 C4:0.5 C4:2`
  }),
  song({
    id: 'juan',
    title: 'Hermano Juan',
    emoji: '🔔',
    tier: 1,
    quiz: true,
    credit: 'Tradicional (Frère Jacques)',
    bpm: 104,
    meter: [4, 4],
    phrase: 8,
    notes: `C4:1 D4:1 E4:1 C4:1 C4:1 D4:1 E4:1 C4:1 E4:1 F4:1 G4:2 E4:1 F4:1 G4:2
            G4:0.5 A4:0.5 G4:0.5 F4:0.5 E4:1 C4:1 G4:0.5 A4:0.5 G4:0.5 F4:0.5 E4:1 C4:1
            C4:1 G3:1 C4:2 C4:1 G3:1 C4:2`
  }),
  song({
    id: 'noche',
    title: 'Noche de paz',
    emoji: '🎄',
    tier: 1,
    quiz: true,
    credit: 'Franz X. Gruber, 1818',
    bpm: 84,
    meter: [6, 8],
    phrase: 7,
    notes: `G4:0.75 A4:0.25 G4:0.5 E4:1.5 G4:0.75 A4:0.25 G4:0.5 E4:1.5 D5:1 D5:0.5 B4:1.5 C5:1 C5:0.5 G4:1.5
            A4:1 A4:0.5 C5:0.75 B4:0.25 A4:0.5 G4:0.75 A4:0.25 G4:0.5 E4:1.5
            A4:1 A4:0.5 C5:0.75 B4:0.25 A4:0.5 G4:0.75 A4:0.25 G4:0.5 E4:1.5
            D5:1 D5:0.5 F5:0.75 D5:0.25 B4:0.5 C5:1.5 E5:1.5 C5:0.75 G4:0.25 E4:0.5 G4:0.75 F4:0.25 D4:0.5 C4:3`
  }),
  song({
    id: 'cucaracha',
    title: 'La cucaracha',
    emoji: '🪲',
    tier: 1,
    quiz: true,
    credit: 'Tradicional (estribillo, versión sencilla)',
    bpm: 112,
    meter: [3, 4],
    phrase: 5,
    notes: `C4:0.5 C4:0.5 C4:0.5 F4:1 A4:0.5 C4:0.5 C4:0.5 C4:0.5 F4:1 A4:2
            F4:0.5 F4:0.5 E4:0.5 E4:0.5 D4:0.5 D4:0.5 C4:1.5`
  }),
  song({
    id: 'jingle',
    title: 'Jingle Bells',
    emoji: '🛎️',
    tier: 1,
    quiz: true,
    credit: 'James L. Pierpont, 1857 (estribillo)',
    bpm: 120,
    meter: [4, 4],
    phrase: 6,
    notes: `E4:1 E4:1 E4:2 E4:1 E4:1 E4:2 E4:1 G4:1 C4:1.5 D4:0.5 E4:4`
  }),
  song({
    id: 'mary',
    title: 'Mary tenía un corderito',
    emoji: '🐑',
    tier: 1,
    quiz: true,
    credit: 'Tradicional (Mary had a little lamb)',
    bpm: 108,
    meter: [4, 4],
    phrase: 7,
    notes: `E4:1 D4:1 C4:1 D4:1 E4:1 E4:1 E4:2 D4:1 D4:1 D4:2 E4:1 G4:1 G4:2
            E4:1 D4:1 C4:1 D4:1 E4:1 E4:1 E4:1 E4:1 D4:1 D4:1 E4:1 D4:1 C4:4`
  }),
  song({
    id: 'elisa',
    title: 'Para Elisa',
    emoji: '🎹',
    tier: 2,
    quiz: true,
    credit: 'Ludwig van Beethoven (inicio)',
    bpm: 90,
    meter: [3, 8],
    phrase: 9,
    notes: `E5:0.25 D#5:0.25 E5:0.25 D#5:0.25 E5:0.25 B4:0.25 D5:0.25 C5:0.25 A4:0.5 r:0.25 C4:0.25 E4:0.25 A4:0.25
            B4:0.5 r:0.25 E4:0.25 G#4:0.25 B4:0.25 C5:0.5 r:0.25 E4:0.25 E5:0.25 D#5:0.25
            E5:0.25 D#5:0.25 E5:0.25 B4:0.25 D5:0.25 C5:0.25 A4:0.5 r:0.25 C4:0.25 E4:0.25 A4:0.25
            B4:0.5 r:0.25 E4:0.25 C5:0.25 B4:0.25 A4:0.75`
  }),
  song({
    id: 'quinta',
    title: '5.ª Sinfonía de Beethoven',
    emoji: '🎻',
    tier: 2,
    quiz: true,
    credit: 'Ludwig van Beethoven (motivo inicial)',
    bpm: 110,
    meter: [2, 4],
    phrase: 4,
    notes: `r:0.5 G4:0.5 G4:0.5 G4:0.5 Eb4:3 r:0.5 F4:0.5 F4:0.5 F4:0.5 D4:3`
  }),
  song({
    id: 'serenata',
    title: 'Pequeña serenata nocturna',
    emoji: '🌙',
    tier: 2,
    quiz: true,
    credit: 'Wolfgang A. Mozart (inicio)',
    bpm: 120,
    meter: [4, 4],
    phrase: 6,
    notes: `G4:1 r:0.5 D4:0.5 G4:1 r:0.5 D4:0.5 G4:0.5 D4:0.5 G4:0.5 B4:0.5 D5:1`
  }),
  // Solo para practicar en el piano
  song({
    id: 'bollos',
    title: 'Mi, Re, Do (bollos calientes)',
    emoji: '🥐',
    tier: 1,
    quiz: false,
    credit: 'Tradicional (Hot cross buns)',
    bpm: 100,
    meter: [4, 4],
    phrase: 6,
    notes: `E4:1 D4:1 C4:2 E4:1 D4:1 C4:2 C4:0.5 C4:0.5 C4:0.5 C4:0.5 D4:0.5 D4:0.5 D4:0.5 D4:0.5 E4:1 D4:1 C4:2`
  }),
  song({
    id: 'escala',
    title: 'Escala de Do',
    emoji: '🪜',
    tier: 1,
    quiz: false,
    credit: 'Do, Re, Mi, Fa, Sol, La, Si, Do',
    bpm: 96,
    meter: [4, 4],
    phrase: 8,
    notes: `C4:1 D4:1 E4:1 F4:1 G4:1 A4:1 B4:1 C5:2 B4:1 A4:1 G4:1 F4:1 E4:1 D4:1 C4:2`
  })
]

/** Notas más grave y más aguda (MIDI) de una canción */
export function songRange(s: Song): [number, number] {
  const midis = s.notes.filter((n) => n.pitch).map((n) => midiOf(n.pitch!))
  return [Math.min(...midis), Math.max(...midis)]
}

/** Las notas que suenan (sin silencios), con su posición en el tiempo */
export function songEvents(s: Song): { pitch: Pitch; at: number; beats: number }[] {
  const out: { pitch: Pitch; at: number; beats: number }[] = []
  let at = 0
  for (const n of s.notes) {
    if (n.pitch) out.push({ pitch: n.pitch, at, beats: n.beats })
    at += n.beats
  }
  return out
}

export type SongMode = 'melody' | 'rhythm' | 'even'

/**
 * Hace sonar una canción (o sus primeras `count` notas). `rhythm` toca solo el ritmo con claves;
 * `even` toca las notas todas con la misma duración (sin ritmo).
 * Devuelve cuánto dura y cuándo empieza cada nota (en segundos desde ahora).
 */
export function playSong(
  s: Song,
  opts: {
    inst?: InstrumentId
    count?: number
    mode?: SongMode
    bpm?: number
    after?: number
    vol?: number
  } = {}
): { duration: number; starts: number[] } {
  const { inst = 'piano', mode = 'melody', after = 0.08, vol = 0.7 } = opts
  const spb = 60 / (opts.bpm ?? s.bpm)
  const events = songEvents(s).slice(0, opts.count ?? Infinity)
  const starts: number[] = []
  let end = 0
  events.forEach((e, i) => {
    const at = mode === 'even' ? i * spb : e.at * spb
    const len = mode === 'even' ? spb : e.beats * spb
    starts.push(at)
    end = at + len
    if (mode === 'rhythm') hit('claves', after + at, vol)
    else playNote(inst, freqOf(e.pitch), { after: after + at, dur: len * 0.92, vol })
  })
  return { duration: end, starts }
}
