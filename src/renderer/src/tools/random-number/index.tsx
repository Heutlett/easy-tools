import { useEffect, useRef, useState } from 'react'
import { randomInt } from '../../lib/random'
import { fanfare, tick } from '../../lib/sound'
import { useFullscreen } from '../../lib/useFullscreen'
import { usePersistentState } from '../../lib/usePersistentState'

const MAX_RANGE = 100_000
/** Pausas (ms) entre un número y otro mientras "rueda": van más lentas hacia el final */
const ROLL_DELAYS = [50, 50, 50, 55, 60, 65, 75, 85, 100, 120, 145, 175, 210, 250, 300]

const toInt = (text: string): number | null =>
  /^-?\d+$/.test(text.trim()) ? parseInt(text, 10) : null

export default function RandomNumber(): React.JSX.Element {
  const [fromText, setFromText] = usePersistentState('number-from', '1')
  const [toText, setToText] = usePersistentState('number-to', '30')
  const [noRepeat, setNoRepeat] = usePersistentState('number-no-repeat', false)
  const [sound, setSound] = usePersistentState('number-sound', true)
  // Los números que ya salieron solo valen para el rango con el que se sacaron
  const [drawn, setDrawn] = useState<{ range: string; numbers: number[] }>({
    range: '',
    numbers: []
  })
  const [shown, setShown] = useState<number | null>(null)
  const [rolling, setRolling] = useState(false)
  const { fullscreen, toggle: toggleFullscreen } = useFullscreen()
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const from = toInt(fromText)
  const to = toInt(toText)
  const valid = from !== null && to !== null && from <= to && to - from + 1 <= MAX_RANGE
  const range = valid ? `${from}-${to}` : ''
  const history = drawn.range === range ? drawn.numbers : []
  const total = valid ? to - from + 1 : 0
  const left = noRepeat ? total - history.length : total
  const canDraw = valid && !rolling && left > 0

  const draw = (): void => {
    if (!canDraw) return
    let result: number
    if (noRepeat) {
      const used = new Set(history)
      const available: number[] = []
      for (let n = from!; n <= to!; n++) if (!used.has(n)) available.push(n)
      result = available[randomInt(0, available.length - 1)]
    } else {
      result = randomInt(from!, to!)
    }

    setRolling(true)
    let step = 0
    const roll = (): void => {
      if (step < ROLL_DELAYS.length) {
        setShown(randomInt(from!, to!))
        if (sound) tick()
        timer.current = setTimeout(roll, ROLL_DELAYS[step++])
        return
      }
      setShown(result)
      setRolling(false)
      setDrawn({ range, numbers: [...history, result] })
      if (sound) fanfare()
    }
    roll()
  }

  useEffect(() => () => clearTimeout(timer.current), [])

  // Barra espaciadora = sacar otro número
  useEffect(() => {
    const onKey = (e: KeyboardEvent): void => {
      const tag = (e.target as HTMLElement).tagName
      if (e.code !== 'Space' || tag === 'INPUT' || tag === 'BUTTON') return
      e.preventDefault()
      draw()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const reset = (): void => {
    setDrawn({ range: '', numbers: [] })
    setShown(null)
  }

  const invalid = !valid
    ? to !== null && from !== null && to - from + 1 > MAX_RANGE
      ? `El rango es demasiado grande (máximo ${MAX_RANGE.toLocaleString('es-CR')} números).`
      : 'Escribe dos números enteros, el menor en "Desde" y el mayor en "Hasta".'
    : ''
  const finished = valid && noRepeat && left === 0

  return (
    <div className={`stage ${fullscreen ? 'fullscreen' : ''}`}>
      <div className="number-stage">
        {!fullscreen && (
          <div className="panel number-range">
            <div className="custom-time">
              <label htmlFor="num-from">Desde</label>
              <input
                id="num-from"
                className="field"
                inputMode="numeric"
                value={fromText}
                disabled={rolling}
                onChange={(e) => setFromText(e.target.value)}
              />
              <label htmlFor="num-to">hasta</label>
              <input
                id="num-to"
                className="field"
                inputMode="numeric"
                value={toText}
                disabled={rolling}
                onChange={(e) => setToText(e.target.value)}
              />
            </div>
            <label className="check left">
              <input
                type="checkbox"
                checked={noRepeat}
                onChange={(e) => setNoRepeat(e.target.checked)}
              />
              No repetir números
              {noRepeat && valid && <span className="muted"> — quedan {left}</span>}
            </label>
            <label className="check left">
              <input type="checkbox" checked={sound} onChange={(e) => setSound(e.target.checked)} />
              Con sonido
            </label>
          </div>
        )}

        <div
          className={`number-display ${rolling ? 'rolling' : shown !== null ? 'done' : ''}`}
          role="status"
          aria-live="polite"
        >
          {shown ?? '?'}
        </div>
        {invalid && <p className="notice error">{invalid}</p>}
        {finished && (
          <p className="notice">¡Ya salieron todos los números! Presiona «Empezar de nuevo».</p>
        )}

        <div className="timer-actions">
          <button className="btn big" disabled={!canDraw} onClick={draw}>
            {rolling ? 'Sacando…' : shown === null ? '🎲 ¡Sacar un número!' : '🎲 Sacar otro'}
          </button>
          {history.length > 0 && (
            <button className="btn big secondary" disabled={rolling} onClick={reset}>
              Empezar de nuevo
            </button>
          )}
          <button className="btn big secondary" onClick={toggleFullscreen}>
            {fullscreen ? 'Salir de pantalla completa' : '⛶ Pantalla completa'}
          </button>
        </div>

        {history.length > 0 && (
          <div className="history">
            <span className="muted">Ya salieron:</span>
            {history.map((n, i) => (
              <span key={i} className="chip">
                {n}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
