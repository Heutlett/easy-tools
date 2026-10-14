import { useCallback, useEffect, useMemo } from 'react'
import type { VoiceLang } from '../../../../shared/voices'
import { speakNatural, stopNatural } from '../naturalSpeech'
import { useActiveVoice } from '../voiceResources'

export type { VoiceLang }

/**
 * Voz para leer en voz alta en español o en inglés, sin internet: la voz natural de ese idioma
 * (un modelo de Piper por idioma). `available` es falso mientras las voces no estén descargadas:
 * los juegos deben funcionar igual sin ella.
 */
export function useVoice(lang: VoiceLang): {
  available: boolean
  speak: (text: string, rate?: number) => void
  stop: () => void
} {
  const voiceId = useActiveVoice(lang)

  // Al salir de la pantalla se corta lo que esté sonando
  useEffect(() => () => stopNatural(), [])

  const speak = useCallback(
    (text: string, rate = 0.9) => {
      if (voiceId) void speakNatural(voiceId, text, rate)
    },
    [voiceId]
  )

  return useMemo(
    () => ({ available: voiceId !== null, speak, stop: stopNatural }),
    [voiceId, speak]
  )
}
