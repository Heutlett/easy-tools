import { lazy, type ComponentType, type LazyExoticComponent } from 'react'
import type { GameMeta } from './types'

export interface Game extends GameMeta {
  id: string
  Component: LazyExoticComponent<ComponentType>
}

// Para agregar un juego: crear la carpeta src/renderer/src/games/<id>/ con meta.ts (export default {...} satisfies GameMeta)
// e index.tsx (export default function del juego). No hay que registrar nada más.
const metas = import.meta.glob<{ default: GameMeta }>('./*/meta.ts', { eager: true })
const components = import.meta.glob<{ default: ComponentType }>('./*/index.tsx')

export const games: Game[] = Object.entries(metas)
  .filter(([path]) => components[`./${path.split('/')[1]}/index.tsx`])
  .map(([path, mod]) => {
    const id = path.split('/')[1]
    return { id, ...mod.default, Component: lazy(components[`./${id}/index.tsx`]) }
  })
  .sort((a, b) => (a.order ?? 50) - (b.order ?? 50) || a.title.localeCompare(b.title, 'es'))
