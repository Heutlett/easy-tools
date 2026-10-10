import { useEffect, useRef } from 'react'

interface Handlers {
  /** Se pulsó 1–9 o A–D (índice desde 0) */
  onOption?: (index: number) => void
  /** Avanzar: flecha derecha o AvPág siempre; Espacio y Enter solo si no hay un botón enfocado */
  onNext?: () => void
}

/**
 * Teclado de los juegos de lectura. Espacio y Enter no activan un botón distinto del enfocado:
 * solo avanzan cuando el foco está en la página.
 */
export function useGameKeys(handlers: Handlers, enabled = true): void {
  const ref = useRef(handlers)
  useEffect(() => {
    ref.current = handlers
  })
  useEffect(() => {
    if (!enabled) return
    const onKey = (e: KeyboardEvent): void => {
      if (e.ctrlKey || e.metaKey || e.altKey) return
      const tag = e.target instanceof HTMLElement ? e.target.tagName : 'BODY'
      if (/^(INPUT|TEXTAREA|SELECT)$/.test(tag)) return
      const { onOption, onNext } = ref.current
      if (onNext && (e.key === 'ArrowRight' || e.key === 'PageDown')) {
        e.preventDefault()
        onNext()
      } else if (onNext && (e.key === ' ' || e.key === 'Enter') && tag === 'BODY') {
        e.preventDefault()
        onNext()
      } else if (onOption) {
        const k = e.key.toLowerCase()
        const index = /^[1-9]$/.test(k)
          ? Number(k) - 1
          : /^[a-d]$/.test(k)
            ? k.charCodeAt(0) - 97
            : -1
        if (index >= 0) onOption(index)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [enabled])
}
