import { lazy, type ComponentType, type LazyExoticComponent } from 'react'
import type { ToolMeta } from './types'

export interface Tool extends ToolMeta {
  id: string
  Component: LazyExoticComponent<ComponentType>
}

// Para agregar una herramienta: crear la carpeta src/renderer/src/tools/<id>/ con meta.ts e index.tsx. No hay que registrar nada más.
const metas = import.meta.glob<{ default: ToolMeta }>('./*/meta.ts', { eager: true })
const components = import.meta.glob<{ default: ComponentType }>('./*/index.tsx')

export const tools: Tool[] = Object.entries(metas)
  .map(([path, mod]) => {
    const id = path.split('/')[1]
    return { id, ...mod.default, Component: lazy(components[`./${id}/index.tsx`]) }
  })
  .sort((a, b) => a.order - b.order)
