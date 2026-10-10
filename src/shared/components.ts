/**
 * Piezas grandes que NO viajan dentro del instalador: se descargan la primera vez (o desde el aviso de la pantalla de inicio)
 * y se guardan en la carpeta de datos de la app, así las actualizaciones no las vuelven a bajar.
 */
export type ComponentId = 'ffmpeg' | 'ytdlp' | 'model'

export interface ComponentDef {
  id: ComponentId
  /** Cómo se llama para la persona */
  label: string
  /** Para qué sirve, en una frase corta */
  forWhat: string
  /** Lo que se descarga, en MB (aproximado) */
  sizeMB: number
}

export const COMPONENTS: ComponentDef[] = [
  {
    id: 'ffmpeg',
    label: 'Procesador de video',
    forWhat: 'recortar y unir videos, sacar el audio',
    sizeMB: 30
  },
  { id: 'ytdlp', label: 'Descargador de YouTube', forWhat: 'bajar videos de YouTube', sizeMB: 18 },
  {
    id: 'model',
    label: 'Inteligencia artificial para quitar fondos',
    forWhat: 'quitar el fondo de una imagen',
    sizeMB: 88
  }
]

export const componentDef = (id: ComponentId): ComponentDef =>
  COMPONENTS.find((c) => c.id === id) ?? COMPONENTS[0]

export interface ComponentStatus {
  id: ComponentId
  installed: boolean
}

export interface ComponentProgress {
  id: ComponentId
  state: 'downloading' | 'done' | 'error'
  /** De 0 a 100 */
  percent: number
  message?: string
}
