import { useCallback, useEffect, useRef, useState } from 'react'
import { COMPONENTS, type ComponentId, type ComponentProgress } from '../../../shared/components'

export interface ComponentsState {
  /** null mientras se consulta */
  installed: Record<ComponentId, boolean> | null
  progress: Partial<Record<ComponentId, ComponentProgress>>
  /** Descarga estos componentes, uno tras otro */
  install: (ids: ComponentId[]) => Promise<void>
  cancel: (ids: ComponentId[]) => void
  busy: boolean
}

/** Qué piezas grandes ya están descargadas, y cómo bajar las que faltan */
export function useComponents(): ComponentsState {
  const [installed, setInstalled] = useState<Record<ComponentId, boolean> | null>(null)
  const [progress, setProgress] = useState<Partial<Record<ComponentId, ComponentProgress>>>({})
  const [busy, setBusy] = useState(false)
  const mounted = useRef(true)

  const refresh = useCallback(async () => {
    const list = await window.api.components.status()
    if (!mounted.current) return
    setInstalled(
      Object.fromEntries(list.map((c) => [c.id, c.installed])) as Record<ComponentId, boolean>
    )
  }, [])

  useEffect(() => {
    mounted.current = true
    // El estado se pide al abrir; los avisos de avance llegan solos
    void refresh()
    const off = window.api.components.onProgress((p) => {
      setProgress((prev) => ({ ...prev, [p.id]: p }))
      if (p.state === 'done') void refresh()
    })
    return () => {
      mounted.current = false
      off()
    }
  }, [refresh])

  const install = useCallback(
    async (ids: ComponentId[]) => {
      setBusy(true)
      try {
        for (const id of ids) {
          try {
            await window.api.components.install(id)
          } catch {
            // El mensaje ya llegó como aviso de avance; se sigue con los demás
          }
        }
      } finally {
        if (mounted.current) setBusy(false)
        await refresh()
      }
    },
    [refresh]
  )

  const cancel = useCallback((ids: ComponentId[]) => {
    for (const id of ids) void window.api.components.cancel(id).catch(() => undefined)
  }, [])

  return { installed, progress, install, cancel, busy }
}

export const totalMB = (ids: ComponentId[]): number =>
  COMPONENTS.filter((c) => ids.includes(c.id)).reduce((n, c) => n + c.sizeMB, 0)

/** Avance total (0 a 100) de varias piezas, ponderado por su tamaño; las que ya quedaron cuentan como completas */
export function overallPercent(c: ComponentsState, ids: ComponentId[]): number {
  const defs = COMPONENTS.filter((d) => ids.includes(d.id))
  const total = defs.reduce((n, d) => n + d.sizeMB, 0)
  if (total === 0) return 0
  const done = defs.reduce(
    (n, d) => n + d.sizeMB * (c.installed?.[d.id] ? 100 : (c.progress[d.id]?.percent ?? 0)),
    0
  )
  return Math.round(done / total)
}
