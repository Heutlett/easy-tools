import { useCallback, useEffect, useMemo, useState } from 'react'

/** Orden de preferencia: primero el español de Costa Rica y de América, después el de España */
const PREFERRED = ['es-CR', 'es-MX', 'es-US', 'es-419', 'es-CO', 'es-AR', 'es-ES']

function pickVoice(): SpeechSynthesisVoice | null {
  if (typeof speechSynthesis === 'undefined') return null
  const spanish = speechSynthesis.getVoices().filter((v) => v.lang.toLowerCase().startsWith('es'))
  for (const lang of PREFERRED) {
    const found = spanish.find((v) => v.lang.replace('_', '-').toLowerCase() === lang.toLowerCase())
    if (found) return found
  }
  return spanish[0] ?? null
}

/**
 * Voz en español del equipo para narrar (usa las voces que ya trae el sistema, sin internet).
 * `available` es falso si el equipo no tiene ninguna voz en español.
 */
export function useSpanishVoice(): {
  available: boolean
  speak: (text: string) => void
  stop: () => void
} {
  const [voice, setVoice] = useState<SpeechSynthesisVoice | null>(null)

  useEffect(() => {
    if (typeof speechSynthesis === 'undefined') return
    // Las voces pueden tardar un momento en cargarse
    const update = (): void => setVoice(pickVoice())
    update()
    speechSynthesis.addEventListener('voiceschanged', update)
    return () => speechSynthesis.removeEventListener('voiceschanged', update)
  }, [])

  const speak = useCallback(
    (text: string) => {
      if (!voice) return
      // Si la voz falla por cualquier motivo, el juego sigue funcionando sin narración
      try {
        speechSynthesis.cancel()
        const utterance = new SpeechSynthesisUtterance(text)
        utterance.voice = voice
        utterance.lang = voice.lang
        utterance.rate = 0.9
        speechSynthesis.speak(utterance)
      } catch (err) {
        console.error('[voz]', err)
      }
    },
    [voice]
  )

  const stop = useCallback(() => {
    if (typeof speechSynthesis !== 'undefined') speechSynthesis.cancel()
  }, [])

  return useMemo(() => ({ available: voice !== null, speak, stop }), [voice, speak, stop])
}
