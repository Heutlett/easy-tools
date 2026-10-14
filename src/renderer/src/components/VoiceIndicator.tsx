import { useEffect, useState } from 'react'
import { stopNatural, useSpeechState } from '../lib/naturalSpeech'

/** Muestra un aviso de carga mientras la voz se prepara (para que no se sienta como un silencio) y, si lee un rato, un botón para detenerla. */
function useAfter(active: boolean, ms: number): boolean {
  const [fired, setFired] = useState(false)
  useEffect(() => {
    if (!active) return
    const t = setTimeout(() => setFired(true), ms)
    return () => {
      clearTimeout(t)
      setFired(false)
    }
  }, [active, ms])
  return active && fired
}

export default function VoiceIndicator(): React.JSX.Element | null {
  const state = useSpeechState()
  // Con las frases cortas o ya generadas no aparece nada: solo si se tarda un momento
  const preparing = useAfter(state === 'preparing', 250)
  const reading = useAfter(state === 'playing', 1500)

  if (state === 'error')
    return (
      <div className="voice-indicator error" role="alert">
        <span aria-hidden>⚠️</span>
        <span>No se pudo leer en voz alta. Revisa que las voces estén descargadas.</span>
      </div>
    )
  if (preparing)
    return (
      <div className="voice-indicator" role="status" aria-live="polite">
        <span className="voice-spinner" aria-hidden />
        <span>Preparando la voz…</span>
      </div>
    )
  if (reading)
    return (
      <div className="voice-indicator reading" role="status">
        <span aria-hidden>🔊</span>
        <span>Leyendo…</span>
        <button className="btn secondary small" onClick={stopNatural}>
          ⏹ Detener
        </button>
      </div>
    )
  return null
}
