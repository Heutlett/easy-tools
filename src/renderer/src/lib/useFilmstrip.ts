import { useEffect, useState } from 'react'

const WORKERS = 3

/**
 * Pide al proceso principal `count` fotogramas repartidos a lo largo del video.
 * Van apareciendo de a poco (null = todavía no llega). Cambiar de archivo reinicia todo.
 */
export function useFilmstrip(
  file: string | null,
  duration: number,
  count: number,
  height = 120
): (string | null)[] {
  const empty = (): (string | null)[] => Array.from({ length: count }, () => null)
  const [state, setState] = useState<{ key: string; frames: (string | null)[] }>({
    key: '',
    frames: empty()
  })
  const key = file && duration > 0 ? `${file}|${duration}` : ''

  useEffect(() => {
    if (!file || duration <= 0) return
    let stale = false
    let next = 0

    const worker = async (): Promise<void> => {
      while (!stale && next < count) {
        const i = next++
        try {
          const frame = await window.api.video.frame({
            input: file,
            time: ((i + 0.5) * duration) / count,
            height
          })
          if (stale) return
          setState((s) => {
            const frames = s.key === key ? [...s.frames] : empty()
            frames[i] = frame
            return { key, frames }
          })
        } catch {
          // Si un fotograma falla, ese cuadro queda gris; el recorte sigue funcionando.
        }
      }
    }
    for (let w = 0; w < WORKERS; w++) worker()

    return () => {
      stale = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file, duration, count, height, key])

  return state.key === key ? state.frames : empty()
}
