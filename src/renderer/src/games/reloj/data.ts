/*
 * Aprende la hora — alineado con los Programas de Estudio de Matemáticas del MEP (2012), área de Medidas, tema «Tiempo»:
 *  - 1.º: solo nociones (día, noche, antes, después; «horas, minutos» sin reloj).
 *  - 2.º: «Medir intervalos de tiempo utilizando horas, minutos y lapsos de 15, 30 o 45 minutos» y «Leer el reloj analógico»
 *         (habilidades 12–14): niveles 1 a 3 de este juego.
 *  - 3.º y 4.º: medir y estimar el tiempo con horas, minutos y segundos y hacer conversiones: niveles 4 y 5 (cada 5 y cada minuto).
 * El programa usa «a. m. / p. m.» (ejemplo del examen de las 9:00 a. m.); el formato de 24 horas se ofrece como opción para los grados altos.
 * Fuente: MEP, «Programas de Estudio de Matemáticas. I y II ciclos de la Educación General Básica y Ciclo Diversificado», 2012.
 */

export type Format = '12' | '24'

export interface TimeLevel {
  id: 1 | 2 | 3 | 4 | 5
  title: string
  grade: string
  /** Cada cuántos minutos se mueve la manecilla grande */
  snap: number
  /** Minutos que pueden aparecer en las preguntas */
  allowed: (m: number) => boolean
}

export const TIME_LEVELS: TimeLevel[] = [
  { id: 1, title: 'En punto', grade: '2.º', snap: 30, allowed: (m) => m === 0 },
  { id: 2, title: 'Y media', grade: '2.º', snap: 30, allowed: (m) => m === 0 || m === 30 },
  { id: 3, title: 'Cuartos', grade: '2.º', snap: 15, allowed: (m) => m % 15 === 0 },
  { id: 4, title: 'De 5 en 5', grade: '3.º', snap: 5, allowed: (m) => m % 5 === 0 },
  { id: 5, title: 'Cada minuto', grade: '4.º', snap: 1, allowed: () => true }
]

export const levelOf = (id: number): TimeLevel =>
  TIME_LEVELS.find((l) => l.id === id) ?? TIME_LEVELS[0]
