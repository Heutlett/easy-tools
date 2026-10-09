import { useEffect, useRef, useState } from 'react'
import Wheel from '../../components/Wheel'
import { randomFloat, randomInt } from '../../lib/random'
import { fanfare } from '../../lib/sound'
import { useFullscreen } from '../../lib/useFullscreen'
import { usePersistentState } from '../../lib/usePersistentState'

const SPIN_SECONDS = 6
const EXAMPLE = ['Ana', 'Luis', 'María', 'Carlos', 'Sofía', 'Diego'].join('\n')

/** Una opción por línea; se ignoran las líneas vacías. */
const parseItems = (text: string): string[] =>
  text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)

const MAX_ITEMS = 100

export default function WheelTool(): React.JSX.Element {
  const [text, setText] = usePersistentState('wheel-items', EXAMPLE)
  const [sound, setSound] = usePersistentState('wheel-sound', true)
  const [removeWinner, setRemoveWinner] = usePersistentState('wheel-remove-winner', false)
  const [removed, setRemoved] = useState<string[]>([])
  const [angle, setAngle] = useState(0)
  const [spinning, setSpinning] = useState(false)
  const [winner, setWinner] = useState<string | null>(null)
  const { fullscreen, toggle: toggleFullscreen } = useFullscreen()
  const pending = useRef<{ index: number; item: string } | null>(null)
  const fallback = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const items = parseItems(text).slice(0, MAX_ITEMS)
  const canSpin = items.length >= 2 && !spinning

  const spin = (): void => {
    if (!canSpin) return
    const index = randomInt(0, items.length - 1)
    const slice = 360 / items.length
    // Aterriza en un punto cualquiera del gajo ganador (sin pegarse a los bordes)
    const target = -(index * slice + slice * (0.12 + randomFloat() * 0.76))
    const current = ((angle % 360) + 360) % 360
    const delta = (((target - current) % 360) + 360) % 360
    pending.current = { index, item: items[index] }
    setWinner(null)
    setSpinning(true)
    setAngle(angle + (5 + randomInt(0, 2)) * 360 + delta)
    // Por si el navegador no avisa que terminó la animación
    fallback.current = setTimeout(finish, (SPIN_SECONDS + 0.5) * 1000)
  }

  function finish(): void {
    clearTimeout(fallback.current)
    const result = pending.current
    if (!result) return
    pending.current = null
    setSpinning(false)
    setAngle((a) => ((a % 360) + 360) % 360) // deja el mismo aspecto con un número chico
    setWinner(result.item)
    if (sound) fanfare()
    if (removeWinner) {
      const remaining = parseItems(text)
      remaining.splice(result.index, 1)
      setRemoved((r) => [...r, result.item])
      setText(remaining.join('\n'))
    }
  }

  useEffect(() => () => clearTimeout(fallback.current), [])

  // Barra espaciadora = girar
  useEffect(() => {
    const onKey = (e: KeyboardEvent): void => {
      const tag = (e.target as HTMLElement).tagName
      if (e.code !== 'Space' || tag === 'TEXTAREA' || tag === 'INPUT' || tag === 'BUTTON') return
      e.preventDefault()
      spin()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const restore = (): void => {
    setText([...parseItems(text), ...removed].join('\n'))
    setRemoved([])
    setWinner(null)
  }

  return (
    <div className={`stage ${fullscreen ? 'fullscreen' : ''}`}>
      <div className="wheel-layout">
        <div className="wheel-main">
          <Wheel
            items={items}
            angle={angle}
            spinSeconds={spinning ? SPIN_SECONDS : 0}
            onSpinEnd={finish}
          />
          <div className="wheel-result" aria-live="polite">
            {winner ? (
              <>
                <span className="wheel-result-label">🎉 ¡Salió!</span>
                <strong className="wheel-result-name">{winner}</strong>
              </>
            ) : (
              <span className="muted">
                {items.length < 2
                  ? 'Escribe al menos 2 opciones para poder girar.'
                  : 'Presiona el botón para girar.'}
              </span>
            )}
          </div>
          <div className="timer-actions">
            <button className="btn big" disabled={!canSpin} onClick={spin}>
              {spinning ? 'Girando…' : '🎡 ¡Girar!'}
            </button>
            <button className="btn big secondary" onClick={toggleFullscreen}>
              {fullscreen ? 'Salir de pantalla completa' : '⛶ Pantalla completa'}
            </button>
          </div>
        </div>

        {!fullscreen && (
          <aside className="panel wheel-side">
            <label className="panel-title" htmlFor="wheel-text">
              Opciones de la ruleta
            </label>
            <p className="muted">
              Escribe una por línea (por ejemplo, los nombres de tu grupo). Puedes pegar una lista
              completa desde Word o Excel. Se guarda para la próxima vez.
            </p>
            <textarea
              id="wheel-text"
              className="field wheel-text"
              value={text}
              disabled={spinning}
              spellCheck={false}
              onChange={(e) => setText(e.target.value)}
            />
            <p className="muted">
              {items.length} {items.length === 1 ? 'opción' : 'opciones'}
              {parseItems(text).length > MAX_ITEMS && ` (se usan las primeras ${MAX_ITEMS})`}
            </p>
            <label className="check left">
              <input
                type="checkbox"
                checked={removeWinner}
                onChange={(e) => setRemoveWinner(e.target.checked)}
              />
              Quitar de la ruleta a quien salga (para que no se repita)
            </label>
            <label className="check left">
              <input type="checkbox" checked={sound} onChange={(e) => setSound(e.target.checked)} />
              Con sonido
            </label>
            <div className="row start">
              {removed.length > 0 && (
                <button className="btn secondary small" disabled={spinning} onClick={restore}>
                  Volver a poner a los {removed.length} que salieron
                </button>
              )}
              <button
                className="btn secondary small"
                disabled={spinning}
                onClick={() => (setText(''), setRemoved([]), setWinner(null))}
              >
                Borrar todo
              </button>
            </div>
          </aside>
        )}
      </div>
    </div>
  )
}
