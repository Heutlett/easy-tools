import { useEffect, useRef, useState } from 'react'
import { randomInt } from '../../lib/random'
import { useVoice } from '../../lib/games/useVoice'
import { bingoSpeech } from '../../../../shared/speech/bingo'
import { usePersistentState } from '../../lib/usePersistentState'

type Variant = 75 | 90

const LETTERS = 'BINGO'
const LETTER_COLORS = ['#2563eb', '#dc2626', '#6b7280', '#16a34a', '#ea580c']
/** Pausas (ms) entre un número y otro mientras "rueda" la bolita */
const ROLL_DELAYS = [45, 45, 45, 50, 55, 60, 70, 80, 95, 115, 140, 170, 210, 260]

const letterIndex = (n: number): number => Math.ceil(n / 15) - 1
const colorOf = (n: number, variant: Variant): string =>
  variant === 75 ? LETTER_COLORS[letterIndex(n)] : '#7c3aed'
const labelOf = (n: number, variant: Variant): string =>
  variant === 75 ? `${LETTERS[letterIndex(n)]} ${n}` : String(n)

function Ball({
  n,
  variant,
  size,
  rolling
}: {
  n: number | null
  variant: Variant
  size: 'big' | 'small'
  rolling?: boolean
}): React.JSX.Element {
  const color = n === null ? '#9ca3af' : colorOf(n, variant)
  return (
    <div
      className={`bingo-ball ${size} ${rolling ? 'rolling' : ''}`}
      style={{ '--ball': color } as React.CSSProperties}
    >
      {n === null ? (
        '?'
      ) : variant === 75 ? (
        <>
          <span className="ball-letter">{LETTERS[letterIndex(n)]}</span>
          <span className="ball-number">{n}</span>
        </>
      ) : (
        <span className="ball-number">{n}</span>
      )}
    </div>
  )
}

export default function Bingo(): React.JSX.Element {
  const [game, setGame] = usePersistentState<{ variant: Variant; called: number[] }>('bingo-game', {
    variant: 75,
    called: []
  })
  const [voiceOn, setVoiceOn] = usePersistentState('bingo-voice', true)
  const [rolling, setRolling] = useState(false)
  const [shown, setShown] = useState<number | null>(null)
  const [confirmReset, setConfirmReset] = useState(false)
  const [card, setCard] = useState('')
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const voice = useVoice('es')

  const { variant, called } = game
  const last = called.length ? called[called.length - 1] : null
  const current = rolling ? shown : last
  const left = variant - called.length
  const canDraw = !rolling && left > 0

  const draw = (): void => {
    if (!canDraw) return
    const taken = new Set(called)
    const available: number[] = []
    for (let n = 1; n <= variant; n++) if (!taken.has(n)) available.push(n)
    const result = available[randomInt(0, available.length - 1)]

    voice.stop()
    setRolling(true)
    let step = 0
    const roll = (): void => {
      if (step < ROLL_DELAYS.length) {
        setShown(randomInt(1, variant))
        timer.current = setTimeout(roll, ROLL_DELAYS[step++])
        return
      }
      setShown(result)
      setRolling(false)
      setGame({ variant, called: [...called, result] })
      if (voiceOn) voice.speak(bingoSpeech(result, variant))
    }
    roll()
  }

  // Al salir de la herramienta se detiene la animación y la voz
  const { stop } = voice
  useEffect(
    () => () => {
      clearTimeout(timer.current)
      stop()
    },
    [stop]
  )

  // Barra espaciadora = sacar otra bolita
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

  const newGame = (nextVariant: Variant = variant): void => {
    voice.stop()
    clearTimeout(timer.current)
    setRolling(false)
    setShown(null)
    setConfirmReset(false)
    setGame({ variant: nextVariant, called: [] })
  }

  const changeVariant = (next: Variant): void => {
    if (next !== variant) newGame(next)
  }

  const cardNumbers = [...new Set((card.match(/\d+/g) ?? []).map(Number))]
  const calledSet = new Set(called)
  const missing = cardNumbers.filter((n) => !calledSet.has(n))
  const invalid = cardNumbers.filter((n) => n < 1 || n > variant)

  const rows = variant === 75 ? 5 : 9
  const perRow = variant === 75 ? 15 : 10

  return (
    <div className="bingo">
      <div className="bingo-left">
        <Ball n={current} variant={variant} size="big" rolling={rolling} />
        <p className="bingo-count">
          {called.length === 0
            ? 'Todavía no sale ninguna'
            : `Han salido ${called.length} de ${variant}`}
          {left === 0 && ' — ¡ya salieron todas!'}
        </p>

        <button className="btn big" disabled={!canDraw} onClick={draw}>
          {rolling ? 'Sacando…' : '🎱 Sacar bolita'}
        </button>
        <div className="row start">
          <button
            className="btn secondary small"
            disabled={rolling || last === null || !voice.available}
            onClick={() => last !== null && voice.speak(bingoSpeech(last, variant))}
          >
            🔊 Repetir
          </button>
          {confirmReset ? (
            <button className="btn small danger" onClick={() => newGame()}>
              Sí, empezar de nuevo
            </button>
          ) : (
            <button
              className="btn secondary small"
              disabled={rolling || called.length === 0}
              onClick={() => (
                setConfirmReset(true),
                setTimeout(() => setConfirmReset(false), 3500)
              )}
            >
              Juego nuevo
            </button>
          )}
        </div>

        <label className="check left">
          <input
            type="checkbox"
            checked={voiceOn}
            disabled={!voice.available}
            onChange={(e) => setVoiceOn(e.target.checked)}
          />
          Cantar con voz
        </label>
        {!voice.available && (
          <p className="muted">
            Las voces todavía no se han descargado. Se bajan solas con internet desde la pantalla de
            inicio.
          </p>
        )}

        <div className="pills" role="group" aria-label="Cantidad de bolitas">
          {([75, 90] as Variant[]).map((v) => (
            <button
              key={v}
              className={`pill ${variant === v ? 'selected' : ''}`}
              aria-pressed={variant === v}
              disabled={rolling}
              onClick={() => changeVariant(v)}
            >
              {v === 75 ? '75 bolitas (B-I-N-G-O)' : '90 bolitas'}
            </button>
          ))}
        </div>

        {called.length > 1 && (
          <div className="bingo-previous">
            <span className="muted">Anteriores:</span>
            {called
              .slice(-7, -1)
              .reverse()
              .map((n) => (
                <Ball key={n} n={n} variant={variant} size="small" />
              ))}
          </div>
        )}
      </div>

      <div className="bingo-right">
        <div className="bingo-board" style={{ '--cols': perRow } as React.CSSProperties}>
          {Array.from({ length: rows }, (_, r) => (
            <div key={r} className="bingo-row">
              {variant === 75 && (
                <span className="bingo-rowletter" style={{ background: LETTER_COLORS[r] }}>
                  {LETTERS[r]}
                </span>
              )}
              {Array.from({ length: perRow }, (_, c) => {
                const n = r * perRow + c + 1
                const isCalled = calledSet.has(n)
                return (
                  <span
                    key={n}
                    className={`bingo-cell ${isCalled ? 'called' : ''} ${n === last && !rolling ? 'last' : ''}`}
                    style={
                      isCalled
                        ? ({ '--ball': colorOf(n, variant) } as React.CSSProperties)
                        : undefined
                    }
                  >
                    {n}
                  </span>
                )
              })}
            </div>
          ))}
        </div>

        <div className="panel bingo-check">
          <label className="panel-title" htmlFor="bingo-card">
            Revisar un cartón
          </label>
          <input
            id="bingo-card"
            className="field"
            placeholder="Escribe los números del cartón, por ejemplo: 5 18 33 52 70"
            value={card}
            onChange={(e) => setCard(e.target.value)}
          />
          {cardNumbers.length > 0 && (
            <p className={missing.length === 0 && invalid.length === 0 ? 'bingo-ok' : 'bingo-bad'}>
              {invalid.length > 0
                ? `Hay números fuera de 1 a ${variant}: ${invalid.join(', ')}`
                : missing.length === 0
                  ? `✅ ¡Todos salieron! (${cardNumbers.length} ${cardNumbers.length === 1 ? 'número' : 'números'})`
                  : `Todavía no han salido: ${missing.map((n) => labelOf(n, variant)).join(', ')}`}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
