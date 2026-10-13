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
  /** Posición dentro de su sección (menor = primero) */
  order: number
  /** Se muestra destacada en la pantalla de inicio */
  featured?: boolean
  /** Piezas grandes que hay que descargar antes de usarla (ver shared/components.ts) */
  requires?: ComponentId[]
}
