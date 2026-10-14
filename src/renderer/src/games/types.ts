import type { Grade, SubjectId } from '../content/types'

/** Cómo se juega, para poder filtrar */
export type GameMode = 'clase' | 'equipos' | 'turnos' | 'individual'

export const GAME_MODES: { id: GameMode; title: string; icon: string }[] = [
  { id: 'clase', title: 'Toda la clase', icon: '🏫' },
  { id: 'equipos', title: 'Por equipos', icon: '👥' },
  { id: 'turnos', title: 'Por turnos', icon: '🔁' },
  { id: 'individual', title: 'Individual', icon: '🙋' }
]

/** Grupos del catálogo de juegos (cada uno con su color) */
export type GameType = 'preguntas' | 'palabras' | 'lectura' | 'mate' | 'ingles' | 'musica' | 'azar'

export const GAME_TYPES: { id: GameType; title: string; color: string }[] = [
  { id: 'preguntas', title: 'Preguntas y concursos', color: '#8a63d2' },
  { id: 'palabras', title: 'Palabras y adivinanzas', color: '#e8644a' },
  { id: 'lectura', title: 'Lectura y lengua', color: '#2aa3a0' },
  { id: 'mate', title: 'Matemática', color: '#3b8fd9' },
  { id: 'ingles', title: 'Inglés', color: '#e0a020' },
  { id: 'musica', title: 'Música', color: '#e46aa8' },
  { id: 'azar', title: 'Azar', color: '#4fae6a' }
]

export const gameTypeOf = (id: GameType): (typeof GAME_TYPES)[number] =>
  GAME_TYPES.find((t) => t.id === id) ?? GAME_TYPES[0]

export interface GameMeta {
  title: string
  /** Una frase corta: qué se hace */
  description: string
  /** Emoji que se muestra en la tarjeta */
  icon: string
  /** Grupo del catálogo; de él sale el color de acento del juego */
  type: GameType
  /** Asignaturas con las que se usa; vacío si sirve para cualquiera (bingo, dados…) */
  subjects: SubjectId[]
  /** Grados para los que sirve; todos ([1,2,3,4,5,6]) si es general */
  grades: Grade[]
  /** Modos de juego que admite */
  modes: GameMode[]
  /** Palabras extra para el buscador («memoria», «sumas», «reloj»…): sin tildes y en minúsculas da igual */
  keywords?: string[]
  /** Posición entre juegos de igual importancia (menor = primero) */
  order?: number
}
