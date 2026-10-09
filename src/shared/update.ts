export type UpdateState =
  | 'idle' // todavía no se ha buscado
  | 'checking'
  | 'none' // ya tiene la última versión
  | 'available' // hay una versión nueva, sin descargar
  | 'downloading'
  | 'ready' // descargada, falta reiniciar
  | 'unavailable' // esta copia no se puede actualizar (por ejemplo, al desarrollar)
  | 'error'

export interface UpdateStatus {
  state: UpdateState
  /** Versión nueva, cuando hay */
  version?: string
  /** Avance de la descarga, de 0 a 100 */
  percent?: number
  message?: string
}
