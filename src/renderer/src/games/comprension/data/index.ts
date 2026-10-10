import type { ReadingText } from '../types'
import g1 from './g1'
import g2 from './g2'
import g3 from './g3'
import g4 from './g4'
import g5 from './g5'
import g6 from './g6'

/*
 * Textos de comprensión de lectura. Todos son originales de esta app (escritos para ella) o recuentos
 * con palabras propias de relatos de la tradición oral costarricense y de fábulas de dominio público.
 * La longitud y la complejidad crecen con el grado, siguiendo los tipos de texto del programa de
 * Español del MEP (cuento, fábula, leyenda, texto informativo, instructivo, noticia, carta y poema).
 */
export const readingTexts: ReadingText[] = [...g1, ...g2, ...g3, ...g4, ...g5, ...g6]
