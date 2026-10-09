import { useCallback, useState } from 'react'

/** Como useState, pero recuerda el valor la próxima vez que se abra la app. */
export function usePersistentState<T>(key: string, initial: T): [T, (value: T) => void] {
  const [value, setValue] = useState<T>(() => {
    try {
      const saved = localStorage.getItem(`easy-tools:${key}`)
      return saved === null ? initial : (JSON.parse(saved) as T)
    } catch {
      return initial
    }
  })

  const update = useCallback(
    (next: T) => {
      setValue(next)
      try {
        localStorage.setItem(`easy-tools:${key}`, JSON.stringify(next))
      } catch {
        // Si no se puede guardar, la herramienta sigue funcionando igual.
      }
    },
    [key]
  )

  return [value, update]
}
