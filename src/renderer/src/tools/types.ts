import type { CategoryId } from './categories'

export interface ToolMeta {
  title: string
  description: string
  /** Emoji que se muestra en la tarjeta */
  icon: string
  /** Color de acento (cualquier color CSS) */
  color: string
  /** Sección de la pantalla de inicio (ver categories.ts) */
  category: CategoryId
  /** Posición dentro de su sección (menor = primero) */
  order: number
}
