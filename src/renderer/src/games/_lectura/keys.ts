import { useEffect, useRef } from 'react'

/** Escucha las teclas de la ventana (no al escribir en un campo ni con Ctrl, Alt o Meta). */
export function useKeys(handler: (e: KeyboardEvent) => void, active = true): void {
  const ref = useRef(handler)
  useEffect(() => {
    ref.current = handler
  })
  useEffect(() => {
    if (!active) return
    const onKey = (e: KeyboardEvent): void => {
      if (e.ctrlKey || e.metaKey || e.altKey) return
      if (e.target instanceof HTMLElement && /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName))
        return
      ref.current(e)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [active])
}

/** ¿No hay ningún botón seleccionado? Espacio y Enter solo avanzan en ese caso, para no pulsar otro botón por accidente. */
export const noFocusedButton = (e: KeyboardEvent): boolean =>
  !(e.target instanceof HTMLElement) || e.target.tagName === 'BODY'
