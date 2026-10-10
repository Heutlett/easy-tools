import { shuffle } from '../../lib/games/shuffle'
import { randomInt } from '../../lib/random'
import { SONGS, songEvents, type Song, type SongMode } from '../_musica/songs'

export type Clues = 'many' | 'some' | 'few'
export type Repertoire = 'kids' | 'all'

export const CLUES: { id: Clues; label: string; hint: string }[] = [
  { id: 'many', label: 'Una frase', hint: 'más fácil' },
  { id: 'some', label: 'Unas cuantas notas', hint: '' },
  { id: 'few', label: 'Muy pocas notas', hint: 'reto' }
]

/** Cuántas notas suenan al principio (en «solo el ritmo» siempre al menos 6, para que haya ritmo que reconocer) */
export function clueCount(song: Song, clues: Clues, mode: SongMode): number {
  const total = songEvents(song).length
  const base =
    clues === 'many'
      ? song.phrase
      : clues === 'some'
        ? Math.max(4, Math.round(song.phrase * 0.6))
        : 3
  const min = mode === 'rhythm' ? 6 : 3
  return Math.min(total, Math.max(base, min))
}

export const poolOf = (repertoire: Repertoire): Song[] =>
  SONGS.filter((s) => s.quiz && (repertoire === 'all' || s.tier === 1))

/** Duraciones de las primeras notas: así se reconoce un ritmo */
const rhythmKey = (song: Song, n: number): string =>
  songEvents(song)
    .slice(0, n)
    .map((e) => e.beats)
    .join(',')

export interface Question {
  song: Song
  options: Song[]
  answer: number
  /** Cuántas notas suenan al empezar */
  count: number
}

export function makeQuestion(pool: Song[], clues: Clues, mode: SongMode, avoid?: string): Question {
  const choices = pool.filter((s) => s.id !== avoid)
  const song = choices[randomInt(0, choices.length - 1)]
  const count = clueCount(song, clues, mode)
  let others = shuffle(pool.filter((s) => s.id !== song.id))
  if (mode === 'rhythm') {
    // Que ningún otro título tenga el mismo ritmo al comienzo: si no, no habría forma justa de adivinar
    const used = new Set([rhythmKey(song, count)])
    const different: Song[] = []
    for (const s of others) {
      const key = rhythmKey(s, count)
      if (!used.has(key)) {
        used.add(key)
        different.push(s)
      }
    }
    others = [...different, ...others.filter((s) => !different.includes(s))]
  }
  const options = shuffle([song, ...others.slice(0, 3)])
  return { song, options, answer: options.findIndex((s) => s.id === song.id), count }
}
