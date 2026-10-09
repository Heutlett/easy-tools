export type FileKind = 'video' | 'pdf' | 'image' | 'word'

export interface MediaInfo {
  /** Duración en segundos */
  duration: number
  width?: number
  height?: number
  hasVideo: boolean
  hasAudio: boolean
}

export interface WordRun {
  text: string
  /** Color en hexadecimal ("#rrggbb"); si no tiene, es negro */
  color?: string
  /** Espacio extra entre letras en puntos (positivo o negativo), para que el texto mida lo mismo que en el PDF */
  spacing?: number
  /** Escala horizontal de las letras en porcentaje (100 = normal), cuando el PDF las comprime o estira */
  scale?: number
  font: string
  /** Tamaño en puntos */
  size: number
  bold?: boolean
  italic?: boolean
}

/** Una imagen del PDF, lista para ponerla en el documento de Word */
export interface WordImage {
  /** Contenido de la imagen en base64 */
  data: string
  format: 'png' | 'jpg'
  /** Tamaño en puntos */
  width: number
  height: number
}

export interface WordModel {
  /** Medidas de la hoja, en puntos */
  page: { width: number; height: number }
  /** Cada página del PDF, con todo en su posición exacta */
  exact: ExactPage[]
}

// ---------- Cada elemento va en su posición exacta ----------

export interface ExactCell {
  /** Cuántas columnas de la tabla ocupa */
  span: number
  /** Líneas de texto de la celda (normalmente una) */
  lines: WordRun[][]
  align: 'left' | 'center' | 'right'
  /** Alto de una línea y espacio arriba, en puntos */
  lineHeight: number
  spaceBefore: number
  /** Bordes de la celda (solo los que existen en el PDF) */
  borders?: Partial<Record<'top' | 'right' | 'bottom' | 'left', { width: number; color: string }>>
  /** Espacio entre el borde de la celda y su texto, en puntos */
  marginLeft?: number
  marginRight?: number
  shade?: string
}

export interface ExactRow {
  /** Alto exacto de la fila en puntos */
  height: number
  cells: ExactCell[]
}

export type ExactBlock =
  | {
      kind: 'paragraph'
      lines: WordRun[][]
      align: 'left' | 'center'
      indentLeft: number
      lineHeight: number
      spaceBefore: number
    }
  | {
      kind: 'rule'
      indentLeft: number
      indentRight: number
      spaceBefore: number
      thickness: number
      color: string
    }
  | {
      kind: 'table'
      spaceBefore: number
      /** Posición del borde izquierdo de la tabla */
      x: number
      /** Ancho de cada columna, en puntos */
      columns: number[]
      rows: ExactRow[]
    }

export interface ExactImage extends WordImage {
  /** Posición de la esquina superior izquierda, en puntos desde el borde de la hoja */
  x: number
  y: number
}

export interface ExactPage {
  images: ExactImage[]
  blocks: ExactBlock[]
}
