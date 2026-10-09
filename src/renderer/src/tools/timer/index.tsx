import { useCallback, useEffect, useRef, useState } from 'react'
import { formatTime } from '../../lib/format'
import { beepThree } from '../../lib/sound'
import { useFullscreen } from '../../lib/useFullscreen'

const PRESETS = [1, 2, 3, 5, 10, 15, 20, 30, 45, 60]

type Phase = 'setup' | 'running' | 'paused' | 'finished'

export default function Timer(): React.JSX.Element {
  const [minutes, setMinutes] = useState(5)
  const [seconds, setSeconds] = useState(0)
  const [phase, setPhase] = useState<Phase>('setup')
  const [remaining, setRemaining] = useState(0)
  const { fullscreen, toggle: toggleFullscreen } = useFullscreen()
  const endsAt = useRef(0)

  const total = minutes * 60 + seconds

  const start = useCallback((from: number) => {
    endsAt.current = Date.now() + from * 1000
    setRemaining(from)
    setPhase('running')
  }, [])

  // Reloj basado en la hora real para no atrasarse aunque la ventana esté en segundo plano.
  useEffect(() => {
    if (phase !== 'running') return
    const id = setInterval(() => {
      const left = Math.max(0, (endsAt.current - Date.now()) / 1000)
      setRemaining(left)
      if (left <= 0) {
        setPhase('finished')
        beepThree()
      }
    }, 200)
    return () => clearInterval(id)
  }, [phase])

  const reset = (): void => {
    setPhase('setup')
    setRemaining(0)
  }

  const playPause = (): void => {
    if (phase === 'setup') start(total)
    else if (phase === 'running') setPhase('paused')
    else if (phase === 'paused') start(remaining)
    else start(total)
  }

  // Espacio = iniciar / pausar
  useEffect(() => {
    const onKey = (e: KeyboardEvent): void => {
      if (e.code !== 'Space' || (e.target as HTMLElement).tagName === 'INPUT') return
      e.preventDefault()
      if (phase === 'setup' && total === 0) return
      playPause()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const shown = phase === 'setup' ? total : Math.ceil(remaining)
  const fraction = phase === 'setup' || total === 0 ? 1 : remaining / total
  const color =
    phase === 'finished' || (phase !== 'setup' && remaining <= 10)
      ? '#dc2626'
      : phase !== 'setup' && fraction <= 0.2
        ? '#d97706'
        : '#059669'

  const clampInput = (v: string, max: number): number =>
    Math.min(max, Math.max(0, parseInt(v, 10) || 0))

  return (
    <div
      className={`timer ${phase === 'finished' ? 'finished' : ''} ${fullscreen ? 'fullscreen' : ''}`}
      style={{ '--timer-color': color } as React.CSSProperties}
    >
      {phase === 'setup' && (
        <>
          <div className="presets" role="group" aria-label="Tiempos rápidos">
            {PRESETS.map((m) => (
              <button
                key={m}
                className={`preset ${total === m * 60 ? 'selected' : ''}`}
                onClick={() => (setMinutes(m), setSeconds(0))}
              >
                {m} min
              </button>
            ))}
          </div>
          <div className="custom-time">
            <span>O escribe el tiempo:</span>
            <input
              className="field"
              aria-label="Minutos"
              inputMode="numeric"
              value={minutes}
              onChange={(e) => setMinutes(clampInput(e.target.value, 999))}
            />
            <span>min</span>
            <input
              className="field"
              aria-label="Segundos"
              inputMode="numeric"
              value={seconds}
              onChange={(e) => setSeconds(clampInput(e.target.value, 59))}
            />
            <span>seg</span>
          </div>
        </>
      )}

      <div className="timer-display" role="timer" aria-live="off">
        {formatTime(shown)}
      </div>

      <div className="timer-bar">
        <div style={{ width: `${fraction * 100}%` }} />
      </div>

      {phase === 'finished' && <p className="timer-message">¡Se acabó el tiempo!</p>}

      <div className="timer-actions">
        <button className="btn big" disabled={phase === 'setup' && total === 0} onClick={playPause}>
          {phase === 'running'
            ? '⏸ Pausar'
            : phase === 'paused'
              ? '▶ Continuar'
              : phase === 'finished'
                ? '↻ Repetir'
                : '▶ Iniciar'}
        </button>
        {phase !== 'setup' && (
          <button className="btn big secondary" onClick={reset}>
            Cambiar tiempo
          </button>
        )}
        <button className="btn big secondary" onClick={toggleFullscreen}>
          {fullscreen ? 'Salir de pantalla completa' : '⛶ Pantalla completa'}
        </button>
      </div>
      {phase === 'setup' && <p className="muted">Tip: la barra espaciadora inicia y pausa.</p>}
    </div>
  )
}
