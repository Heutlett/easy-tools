import { useCallback, useEffect, useState } from 'react'

/** Pantalla completa de la ventana (para proyectar en el aula). Al salir de la herramienta se desactiva sola. */
export function useFullscreen(): { fullscreen: boolean; toggle: () => void } {
  const [fullscreen, setFullscreen] = useState(false)

  useEffect(() => {
    const onChange = (): void => setFullscreen(document.fullscreenElement !== null)
    document.addEventListener('fullscreenchange', onChange)
    return () => {
      document.removeEventListener('fullscreenchange', onChange)
      if (document.fullscreenElement) document.exitFullscreen()
    }
  }, [])

  const toggle = useCallback(() => {
    if (document.fullscreenElement) document.exitFullscreen()
    else document.documentElement.requestFullscreen()
  }, [])

  return { fullscreen, toggle }
}
