import type { Grade, SubjectId } from '../content/types'

/** Cómo se juega, para poder filtrar */
export type GameMode = 'clase' | 'equipos' | 'turnos' | 'individual'

export const GAME_MODES: { id: GameMode; title: string; icon: string }[] = [
  { id: 'clase', title: 'Toda la clase', icon: '🏫' },
  { id: 'equipos', title: 'Por equipos', icon: '👥' },
  { id: 'turnos', title: 'Por turnos', icon: '🔁' },
  { id: 'individual', title: 'Individual', icon: '🙋' }
]

export interface GameMeta {
  title: string
  /** Una frase corta: qué se hace */
  description: string
  /** Emoji que se muestra en la tarjeta */
  icon: string
  /** Color de acento (cualquier color CSS) */
  color: string
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
