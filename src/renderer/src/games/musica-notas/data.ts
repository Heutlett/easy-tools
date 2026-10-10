import { shuffle } from '../../lib/games/shuffle'
import { randomInt } from '../../lib/random'
import { midiOf, pitchName, type Alter, type Pitch } from '../_musica/notes'
import type { Clef } from '../_musica/staffMath'

/**
 * Niveles de «Lee las notas». Los pasos cuentan desde el Do central (Do4 = 0, Mi4 = 2 es la línea de abajo en clave de sol).
 * Según el programa de Educación Musical del MEP, en 3.º se leen pocas notas en clave de sol (Mi, Sol, La…),
 * en 4.º se completa la escala de Do y se conocen los sostenidos y bemoles, y 5.º y 6.º amplían el registro.
 */
export interface Level {
  id: number
  name: string
  /** Texto corto con las notas del nivel */
  range: string
  /** Grados para los que se recomienda */
  grades: string
  clef: Clef
  /** Pasos más grave y más agudo */
  from: number
  to: number
  accidentals?: boolean
}

export const LEVELS: Level[] = [
  { id: 1, name: 'Do a Sol', range: 'Do Re Mi Fa Sol', grades: '3.º', clef: 'sol', from: 0, to: 4 },
  {
    id: 2,
    name: 'Una octava',
    range: 'Do a Do agudo',
    grades: '3.º y 4.º',
    clef: 'sol',
    from: 0,
    to: 7
  },
  {
    id: 3,
    name: 'En el pentagrama',
    range: 'Mi a Fa agudo',
    grades: '4.º y 5.º',
    clef: 'sol',
    from: 2,
    to: 10
  },
  {
    id: 4,
    name: 'Líneas adicionales',
    range: 'La grave a Do agudo',
    grades: '5.º y 6.º',
    clef: 'sol',
    from: -2,
    to: 14
  },
  {
    id: 5,
    name: 'Sostenidos y bemoles',
    range: '♯ y ♭',
    grades: '5.º y 6.º',
    clef: 'sol',
    from: 0,
    to: 8,
    accidentals: true
  },
  {
    id: 6,
    name: 'Clave de fa',
    range: 'Mi grave a Do central',
    grades: 'Reto',
    clef: 'fa',
    from: -12,
    to: 0
  }
]

const SHARPABLE = [0, 1, 3, 4, 5] // Do Re Fa Sol La
const FLATTABLE = [1, 2, 4, 5, 6] // Re Mi Sol La Si

const index = (step: number): number => ((step % 7) + 7) % 7

/** Todas las notas que pueden salir en un nivel */
export function levelPitches(level: Level): Pitch[] {
  const out: Pitch[] = []
  for (let step = level.from; step <= level.to; step++) {
    out.push({ step, alter: 0 })
    if (level.accidentals) {
      if (SHARPABLE.includes(index(step))) out.push({ step, alter: 1 })
      if (FLATTABLE.includes(index(step))) out.push({ step, alter: -1 })
    }
  }
  return out
}

export function randomPitch(level: Level, avoid?: Pitch): Pitch {
  for (let tries = 0; tries < 20; tries++) {
    const step = randomInt(level.from, level.to)
    let alter: Alter = 0
    if (level.accidentals && randomInt(1, 10) <= 7) {
      const sharp = SHARPABLE.includes(index(step))
      const flat = FLATTABLE.includes(index(step))
      if (sharp && flat) alter = randomInt(0, 1) ? 1 : -1
      else if (sharp) alter = 1
      else if (flat) alter = -1
    }
    if (!avoid || avoid.step !== step || avoid.alter !== alter) return { step, alter }
  }
  return { step: level.from, alter: 0 }
}

export interface ReadQuestion {
  kind: 'read'
  pitch: Pitch
  options: string[]
  answer: number
}

export interface ListenQuestion {
  kind: 'listen'
  pitch: Pitch
  options: Pitch[]
  answer: number
}

export type Question = ReadQuestion | ListenQuestion

export const NAMES = ['Do', 'Re', 'Mi', 'Fa', 'Sol', 'La', 'Si']

/** Pregunta «¿cómo se llama esta nota?». Con `seven` las opciones son las siete notas en orden. */
export function readQuestion(level: Level, seven: boolean, avoid?: Pitch): ReadQuestion {
  const pitch = randomPitch(level, avoid)
  const correct = pitchName(pitch)
  if (seven && !level.accidentals) {
    return { kind: 'read', pitch, options: NAMES, answer: NAMES.indexOf(correct) }
  }
  const universe = [...new Set(levelPitches(level).map(pitchName))].filter((n) => n !== correct)
  const sameLetter = universe.filter((n) => n.startsWith(NAMES[index(pitch.step)]))
  const rest = shuffle(universe.filter((n) => !sameLetter.includes(n)))
  const wrong = [...shuffle(sameLetter).slice(0, 1), ...rest].slice(0, 3)
  const options = shuffle([correct, ...wrong])
  return { kind: 'read', pitch, options, answer: options.indexOf(correct) }
}

/** Pregunta «suena una nota: ¿cuál es en el pentagrama?» (cuatro notas distintas al oído) */
export function listenQuestion(level: Level, avoid?: Pitch): ListenQuestion {
  const pitch = randomPitch(level, avoid)
  const taken = new Set([midiOf(pitch)])
  const options: Pitch[] = [pitch]
  for (const p of shuffle(levelPitches(level))) {
    if (options.length === 4) break
    if (!taken.has(midiOf(p))) {
      taken.add(midiOf(p))
      options.push(p)
    }
  }
  const mixed = shuffle(options)
  return {
    kind: 'listen',
    pitch,
    options: mixed,
    answer: mixed.findIndex((p) => p.step === pitch.step && p.alter === pitch.alter)
  }
}
