/** Grados de la escuela primaria: 1.º a 6.º */
export type Grade = 1 | 2 | 3 | 4 | 5 | 6
export const GRADES: Grade[] = [1, 2, 3, 4, 5, 6]

/** Asignaturas con contenido propio (ver subjects.ts) */
export type SubjectId =
  'matematica' | 'ciencias' | 'sociales' | 'espanol' | 'ingles' | 'musica' | 'cultura'

/** Dificultad dentro de su grado: 1 fácil, 2 media, 3 difícil */
export type Difficulty = 1 | 2 | 3

/** Pregunta de selección única con 4 opciones. Sirve para «¿Quién quiere ser millonario?», el concurso, etc. */
export interface Question {
  id: string
  subject: SubjectId
  grade: Grade
  /** Tema o unidad del programa (por ejemplo «Fracciones» o «Los seres vivos») */
  topic: string
  difficulty: Difficulty
  text: string
  /** Las 4 opciones; la correcta es `options[answer]`. Al jugar hay que mezclarlas (ver shuffleOptions en lib/games/shuffle.ts) */
  options: string[]
  answer: number
  /** Una frase que explica la respuesta (se muestra al revelarla) */
  explanation?: string
  /** Creada por la persona usuaria (no viene con la app) */
  custom?: boolean
}

/** Afirmación para «Verdadero o falso» */
export interface Statement {
  id: string
  subject: SubjectId
  grade: Grade
  topic: string
  text: string
  answer: boolean
  explanation?: string
  custom?: boolean
}

/** Una palabra o frase, con una pista opcional (ahorcado, palabras desordenadas, mímica…) */
export interface WordItem {
  text: string
  clue?: string
}

/** Lista de palabras para los juegos de adivinar */
export interface WordList {
  id: string
  title: string
  subject: SubjectId
  grades: Grade[]
  topic?: string
  items: WordItem[]
  custom?: boolean
}

/** Lista de parejas para «Memoria» (palabra–dibujo en emoji, inglés–español, país–capital…) */
export interface PairList {
  id: string
  title: string
  subject: SubjectId
  grades: Grade[]
  topic?: string
  pairs: [string, string][]
  custom?: boolean
}
