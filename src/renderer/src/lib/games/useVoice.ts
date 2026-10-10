import { useCallback, useEffect, useMemo, useState } from 'react'

export type VoiceLang = 'es' | 'en'

/** Orden de preferencia: primero el español de Costa Rica y de América, después el de España; en inglés, el de Estados Unidos */
const PREFERRED: Record<VoiceLang, string[]> = {
  es: ['es-CR', 'es-MX', 'es-US', 'es-419', 'es-CO', 'es-AR', 'es-ES'],
  en: ['en-US', 'en-GB', 'en-AU', 'en-CA']
}

function pickVoice(lang: VoiceLang): SpeechSynthesisVoice | null {
  if (typeof speechSynthesis === 'undefined') return null
  const voices = speechSynthesis.getVoices().filter((v) => v.lang.toLowerCase().startsWith(lang))
  for (const wanted of PREFERRED[lang]) {
    const found = voices.find(
      (v) => v.lang.replace('_', '-').toLowerCase() === wanted.toLowerCase()
    )
    if (found) return found
  }
  return voices[0] ?? null
}

/**
 * Voz del equipo para leer en voz alta en español o en inglés (usa las voces que ya trae el sistema, sin internet).
 * `available` es falso si el equipo no tiene ninguna voz de ese idioma: los juegos deben funcionar igual sin ella.
 */
export function useVoice(lang: VoiceLang): {
  available: boolean
  speak: (text: string, rate?: number) => void
  stop: () => void
} {
  const [voice, setVoice] = useState<SpeechSynthesisVoice | null>(null)

  useEffect(() => {
    if (typeof speechSynthesis === 'undefined') return
    // Las voces pueden tardar un momento en cargarse
    const update = (): void => setVoice(pickVoice(lang))
    update()
    speechSynthesis.addEventListener('voiceschanged', update)
    return () => {
      speechSynthesis.removeEventListener('voiceschanged', update)
      speechSynthesis.cancel()
    }
  }, [lang])

  const speak = useCallback(
    (text: string, rate = 0.9) => {
      if (!voice) return
      try {
        speechSynthesis.cancel()
        const utterance = new SpeechSynthesisUtterance(text)
        utterance.voice = voice
        utterance.lang = voice.lang
        utterance.rate = rate
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
