import { shuffle } from '../../lib/games/shuffle'
import { randomInt } from '../../lib/random'
import type { IconId } from '../_musica/icons'
import { freqOfMidi } from '../_musica/notes'
import { hit, playNote, type InstrumentId } from '../_musica/synth'

export type Family = 'cuerdas' | 'madera' | 'metal' | 'percusion'

export const FAMILIES: { id: Family; name: string; icon: IconId; color: string }[] = [
  { id: 'cuerdas', name: 'Cuerdas', icon: 'violin', color: '#b45309' },
  { id: 'madera', name: 'Viento madera', icon: 'flauta', color: '#15803d' },
  { id: 'metal', name: 'Viento metal', icon: 'trompeta', color: '#ca8a04' },
  { id: 'percusion', name: 'Percusión', icon: 'tambor', color: '#be123c' }
]

export interface Instrument {
  id: IconId
  name: string
  /** null: no se clasifica en una familia (el piano) */
  family: Family | null
  /** Con qué sonido de la síntesis se escucha; null si el timbre no se puede imitar con honestidad */
  sound: InstrumentId | null
  /** Dificultad al adivinarlo: 1 muy distinto a los demás … 3 más parecido a otros */
  level: 1 | 2 | 3
  /** Instrumento tradicional de Costa Rica */
  cr?: boolean
  /** Para no ponerlos juntos en una misma pregunta (suenan parecido) */
  likeness?: string
}

/**
 * Instrumentos y su familia (cuerdas, viento madera, viento metal y percusión), como en el programa de Educación Musical del MEP.
 * Solo se pueden adivinar los que la síntesis del sonido imita de forma reconocible; el quijongo, la chirimía, el arpa,
 * el saxofón, el clarinete, el trombón y la tuba aparecen únicamente en la clasificación (imagen y nombre).
 */
export const INSTRUMENTS: Instrument[] = [
  { id: 'piano', name: 'Piano', family: null, sound: 'piano', level: 1 },
  { id: 'guitarra', name: 'Guitarra', family: 'cuerdas', sound: 'guitarra', level: 1, cr: true },
  { id: 'violin', name: 'Violín', family: 'cuerdas', sound: 'violin', level: 2 },
  { id: 'arpa', name: 'Arpa', family: 'cuerdas', sound: null, level: 3 },
  { id: 'quijongo', name: 'Quijongo', family: 'cuerdas', sound: null, level: 3, cr: true },
  { id: 'flauta', name: 'Flauta', family: 'madera', sound: 'flauta', level: 1, likeness: 'soplo' },
  {
    id: 'ocarina',
    name: 'Ocarina',
    family: 'madera',
    sound: 'ocarina',
    level: 3,
    cr: true,
    likeness: 'soplo'
  },
  { id: 'chirimia', name: 'Chirimía', family: 'madera', sound: null, level: 3, cr: true },
  { id: 'clarinete', name: 'Clarinete', family: 'madera', sound: null, level: 3 },
  { id: 'saxofon', name: 'Saxofón', family: 'madera', sound: null, level: 3 },
  { id: 'trompeta', name: 'Trompeta', family: 'metal', sound: 'trompeta', level: 1 },
  { id: 'trombon', name: 'Trombón', family: 'metal', sound: null, level: 3 },
  { id: 'tuba', name: 'Tuba', family: 'metal', sound: null, level: 3 },
  { id: 'tambor', name: 'Tambor', family: 'percusion', sound: 'tambor', level: 1, cr: true },
  { id: 'maracas', name: 'Maracas', family: 'percusion', sound: 'maracas', level: 1 },
  { id: 'pandereta', name: 'Pandereta', family: 'percusion', sound: 'pandereta', level: 1 },
  { id: 'triangulo', name: 'Triángulo', family: 'percusion', sound: 'triangulo', level: 2 },
  { id: 'claves', name: 'Claves', family: 'percusion', sound: 'claves', level: 2 },
  { id: 'marimba', name: 'Marimba', family: 'percusion', sound: 'marimba', level: 2, cr: true }
]

export const familyOf = (id: Family): (typeof FAMILIES)[number] =>
  FAMILIES.find((f) => f.id === id)!

// ---------------------------------------------------------------- Adivinar

export const GUESS_LEVELS = [
  { id: 1, name: 'Muy distintos', grades: '1.º y 2.º' },
  { id: 2, name: 'Más instrumentos', grades: '3.º y 4.º' },
  { id: 3, name: 'Reto', grades: '5.º y 6.º' }
]

export const guessPool = (level: number): Instrument[] =>
  INSTRUMENTS.filter((i) => i.sound && i.level <= level)

export interface GuessQuestion {
  instrument: Instrument
  options: Instrument[]
  answer: number
  /** Cuál de las melodías o ritmos cortos suena */
  motif: number
}

export function makeGuess(level: number, avoid?: string): GuessQuestion {
  const pool = guessPool(level)
  const choices = pool.filter((i) => i.id !== avoid)
  const instrument = choices[randomInt(0, choices.length - 1)]
  const others = shuffle(
    pool.filter(
      (i) => i.id !== instrument.id && !(i.likeness && i.likeness === instrument.likeness)
    )
  ).slice(0, 3)
  const options = shuffle([instrument, ...others])
  return {
    instrument,
    options,
    answer: options.findIndex((i) => i.id === instrument.id),
    motif: randomInt(0, 2)
  }
}

/** Notas (semitonos sobre la nota base) de las tres melodías cortas */
const MELODIES = [
  [0, 4, 7, 12, 7, 4, 0],
  [0, 2, 4, 5, 7, 5, 4, 2],
  [7, 7, 9, 9, 7, 4, 4, 2]
]
/** Golpes (en segundos) de los tres ritmos cortos */
const RHYTHMS = [
  [0, 0.5, 1, 1.5, 2],
  [0, 0.5, 0.75, 1, 1.5, 2],
  [0, 0.34, 0.68, 1, 1.5, 2]
]
/** Nota base (MIDI) cómoda para cada instrumento */
const BASE: Partial<Record<InstrumentId, number>> = {
  piano: 60,
  guitarra: 52,
  flauta: 72,
  ocarina: 69,
  violin: 67,
  trompeta: 62,
  marimba: 60
}
const SUSTAINED: InstrumentId[] = ['flauta', 'ocarina', 'violin', 'trompeta']

/** Hace sonar un instrumento con una melodía o un ritmo corto. Devuelve cuánto dura (en segundos). */
export function playInstrument(sound: InstrumentId, motif: number): number {
  const rhythm = RHYTHMS[motif]
  const melody = MELODIES[motif]
  if (!(sound in BASE)) {
    rhythm.forEach((at, i) => hit(sound, 0.08 + at * 0.95, 0.85, i === 0))
    return rhythm[rhythm.length - 1] * 0.95 + 0.9
  }
  const sustained = SUSTAINED.includes(sound)
  const step = sustained ? 0.5 : 0.36
  melody.forEach((semi, i) => {
    const last = i === melody.length - 1
    playNote(sound, freqOfMidi(BASE[sound]! + semi), {
      after: 0.08 + i * step,
      dur: last ? 1.4 : sustained ? step * 0.92 : 0.5,
      vol: 0.8
    })
  })
  return melody.length * step + 1.3
}

// ---------------------------------------------------------------- Clasificar

export const CLASSIFY_SETS = [
  { id: 'known', name: 'Los más conocidos', grades: '1.º a 3.º' },
  { id: 'all', name: 'Todos', grades: '4.º a 6.º' },
  { id: 'cr', name: '🇨🇷 De Costa Rica', grades: 'Todos los grados' }
] as const

export type ClassifySet = (typeof CLASSIFY_SETS)[number]['id']

const KNOWN: IconId[] = [
  'guitarra',
  'violin',
  'flauta',
  'trompeta',
  'tambor',
  'maracas',
  'pandereta',
  'triangulo',
  'marimba',
  'saxofon'
]

export function classifyPool(set: ClassifySet, count: number): Instrument[] {
  const all = INSTRUMENTS.filter((i) => i.family)
  const pool =
    set === 'known'
      ? all.filter((i) => KNOWN.includes(i.id))
      : set === 'cr'
        ? all.filter((i) => i.cr)
        : all
  // Que haya de todas las familias posibles: se reparte al azar sin pasar del tope
  return shuffle(pool).slice(0, count)
}
