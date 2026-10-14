import { useMemo } from 'react'
import { useVoice } from './games/useVoice'

/**
 * Voz en español para narrar, sin internet.
 * `available` es falso si no hay ninguna voz en español.
 */
export function useSpanishVoice(): {
  available: boolean
  speak: (text: string) => void
  stop: () => void
} {
  const voice = useVoice('es')
  return useMemo(
    () => ({ available: voice.available, speak: (text) => voice.speak(text), stop: voice.stop }),
    [voice]
  )
}
