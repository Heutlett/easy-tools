export type FileKind = 'video' | 'pdf' | 'image' | 'word'

export interface MediaInfo {
  /** Duración en segundos */
  duration: number
  width?: number
  height?: number
  hasVideo: boolean
  hasAudio: boolean
}

/** En el texto de una tirada, esta marca se reemplaza por el número de página */
export const PAGE_NUMBER_TOKEN = '{PAGE}'

/** Un PDF convertido a una estructura simple que luego se escribe como documento de Word. */
export interface WordRun {
  text: string
  font: string
  /** Tamaño en puntos */
  size: number
  bold?: boolean
  italic?: boolean
}

export interface WordParagraph {
  runs: WordRun[]
  align: 'left' | 'center' | 'right'
  /** Sangría izquierda en puntos */
  indentLeft: number
  /** Espacio debajo del párrafo en puntos */
  spacingAfter: number
  /** Posiciones (en puntos, desde el margen izquierdo) de las columnas, para líneas con "tabulaciones" */
  tabStops: number[]
  pageBreakBefore: boolean
}

export interface WordModel {
  /** Medidas en puntos */
  page: {
    width: number
    height: number
    margin: {
      top: number
      right: number
      bottom: number
      left: number
      /** Distancia del borde de la hoja al encabezado / al pie */
      header: number
      footer: number
    }
  }
  /** Texto que se repite arriba y abajo de cada página */
  header: WordParagraph[]
  footer: WordParagraph[]
  paragraphs: WordParagraph[]
}
