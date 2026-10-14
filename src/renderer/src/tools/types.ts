import type { ComponentId } from '../../../shared/components'
import type { CategoryId } from './categories'

export interface ToolMeta {
  title: string
  description: string
  /** Emoji que se muestra en la tarjeta */
  icon: string
  /** Logos (en vez del emoji). Si son dos, se muestran con una flecha: "A → B" */
  images?: string[]
  /** Color de acento (cualquier color CSS) */
  color: string
  /** Sección de la pantalla de inicio (ver categories.ts) */
  category: CategoryId
  /** Nombres de los tres pasos que se ven arriba (por omisión: Elige el archivo · Revisa · Guarda) */
  steps?: [string, string, string]
  /** Posición dentro de su sección (menor = primero) */
  order: number
  /** Piezas grandes que hay que descargar antes de usarla (ver shared/components.ts) */
  requires?: ComponentId[]
}
