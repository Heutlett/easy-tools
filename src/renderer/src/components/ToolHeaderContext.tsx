import { createContext, useContext, useEffect, useId, useRef } from 'react'

/** Cambia el encabezado de una herramienta mientras muestra algo dentro de ella (por ejemplo un juego abierto). */
export interface HeaderOverride {
  title: string
  icon?: string
  description?: string
  backLabel: string
  onBack: () => void
}

/**
 * Las pantallas anidadas se apilan: la de más adentro manda, y al salir de ella vuelve a mandar la anterior.
 * Cada una se identifica con una clave propia.
 */
export const ToolHeaderContext = createContext<
  (key: string, override: HeaderOverride | null) => void
>(() => undefined)

/** Mientras `override` no sea null, el encabezado de la herramienta muestra ese título y ese botón de volver. */
export function useToolHeader(override: HeaderOverride | null): void {
  const set = useContext(ToolHeaderContext)
  const key = useId()
  // Siempre se usa la última versión de lo que hay que hacer al volver, sin volver a pedir el encabezado
  const onBack = useRef(override?.onBack)
  useEffect(() => {
    onBack.current = override?.onBack
  })
  const signature = override
    ? `${override.title}|${override.icon ?? ''}|${override.description ?? ''}|${override.backLabel}`
    : ''
  useEffect(() => {
    if (!override) return
    set(key, { ...override, onBack: () => onBack.current?.() })
    return () => set(key, null)
    // El encabezado se vuelve a pedir solo cuando cambia lo que se ve
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signature, set, key])
}
