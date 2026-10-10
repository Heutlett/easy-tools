import { Fragment, useCallback, useEffect, useRef, useState } from 'react'
import './manip.css'
import Scoreboard from '../../components/games/Scoreboard'
import { useScores, type Player } from '../../lib/games/players'
import { playTones, sfx } from '../../lib/games/sfx'

export interface Resolution {
  ok: boolean
  message?: string
}

/** Lo que recibe cada pregunta de una actividad */
export interface Ctx {
  index: number
  total: number
  player: Player | undefined
  resolved: Resolution | null
  /** La actividad avisa aquí cuando la pregunta terminó (acierto, o fallo definitivo) */
  resolve: (ok: boolean, message?: string) => void
}

interface Props {
  players: Player[]
  total: number
  /** Dibuja la pregunta actual (se vuelve a crear en cada turno) */
  renderQuestion: (ctx: Ctx) => React.ReactNode
  onExit: () => void
  /** Palabra para contar al final («aciertos», «montos»…) */
  unit?: string
}

/**
 * Ronda de preguntas con turnos, marcador, racha y pantalla final. Cada pregunta es un componente
 * que se vuelve a crear en cada turno (así genera su propio problema al azar).
 */
export default function Runner({
  players,
  total,
  renderQuestion,
  onExit,
  unit = 'aciertos'
}: Props): React.JSX.Element {
  const [round, setRound] = useState(0)
  const [index, setIndex] = useState(0)
  const [resolved, setResolved] = useState<Resolution | null>(null)
  const [finished, setFinished] = useState(false)
  const [streaks, setStreaks] = useState<Record<string, number>>({})
  const [best, setBest] = useState(0)
  const [hits, setHits] = useState(0)
  const { scores, add, reset, ranking, leaders } = useScores(players)
  const nextRef = useRef<HTMLButtonElement>(null)

  const player = players.length ? players[index % players.length] : undefined
  const key = player?.id ?? '_'
  const streak = streaks[key] ?? 0

  const resolve = useCallback(
    (ok: boolean, message?: string): void => {
      if (resolved) return
      setResolved({ ok, message })
      if (ok) {
        sfx.correct()
        if (player) add(player.id, 1)
        setHits((h) => h + 1)
        const n = (streaks[key] ?? 0) + 1
        setStreaks({ ...streaks, [key]: n })
        setBest((b) => Math.max(b, n))
        if ([3, 5, 10].includes(n))
          playTones(
            [784, 988, 1175, 1568].map((freq, i) => ({ freq, at: 0.3 + i * 0.09, length: 0.2 }))
          )
      } else {
        sfx.wrong()
        setStreaks({ ...streaks, [key]: 0 })
      }
    },
    [add, key, player, streaks, resolved]
  )

  const next = (): void => {
    if (!resolved) return
    if (index + 1 < total) {
      setIndex(index + 1)
      setResolved(null)
    } else {
      setFinished(true)
      sfx.win()
    }
  }

  const restart = (): void => {
    reset()
    setStreaks({})
    setBest(0)
    setHits(0)
    setIndex(0)
    setResolved(null)
    setFinished(false)
    setRound((r) => r + 1)
  }

  useEffect(() => {
    if (resolved) nextRef.current?.focus()
  }, [resolved])

  useEffect(() => {
    if (finished || !resolved) return
    const onKey = (e: KeyboardEvent): void => {
      if (e.repeat) return
      const tag = e.target instanceof HTMLElement ? e.target.tagName : 'BODY'
      if (/^(INPUT|TEXTAREA|SELECT)$/.test(tag)) return
      const arrow = e.key === 'ArrowRight' || e.key === 'PageDown'
      if (arrow || ((e.key === ' ' || e.key === 'Enter') && tag === 'BODY')) {
        e.preventDefault()
        next()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  if (finished) {
    return (
      <div className="g-stage g-center mp-end">
        <p className="g-win">🎉 ¡Terminamos!</p>
        {players.length > 0 ? (
          <>
            <p className="mp-winner">
              {leaders.length === 1
                ? `Ganó ${leaders[0].emoji} ${leaders[0].name}`
                : leaders.length > 1
                  ? `Empate: ${leaders.map((l) => l.name).join(' y ')}`
                  : 'Nadie sumó puntos'}
            </p>
            <Scoreboard players={ranking} scores={scores} />
          </>
        ) : (
          <p className="mp-winner">
            {hits} de {total} {unit}
          </p>
        )}
        {best >= 2 && <p className="muted">🔥 Mejor racha: {best}</p>}
        <div className="row start">
          <button className="btn big" onClick={restart}>
            Jugar otra vez
          </button>
          <button className="btn secondary" onClick={onExit}>
            Cambiar de actividad
          </button>
        </div>
      </div>
    )
  }

  const ctx: Ctx = { index, total, player, resolved, resolve }
  return (
    <div className="g-stage mp-run">
      <div className="mp-top">
        <span className="g-badge">
          {index + 1} / {total}
        </span>
        {player && (
          <span className="mp-turn" style={{ borderColor: player.color }}>
            <span aria-hidden>{player.emoji}</span> Le toca a <b>{player.name}</b>
          </span>
        )}
        {streak >= 2 && <span className="mp-streak">🔥 Racha {streak}</span>}
        <button className="btn secondary small mp-exit" onClick={onExit}>
          Salir
        </button>
      </div>
      {players.length > 0 && (
        <Scoreboard players={players} scores={scores} currentId={player?.id} compact />
      )}
      <div className="mp-body">
        <Fragment key={`${round}-${index}`}>{renderQuestion(ctx)}</Fragment>
      </div>
      <div className={`mp-bar ${resolved ? (resolved.ok ? 'ok' : 'bad') : ''}`} aria-live="polite">
        {resolved ? (
          <>
            <span className="mp-verdict">
              {resolved.ok ? '✅ ¡Muy bien!' : '❌ Todavía no'}
              {resolved.message && <span className="mp-verdict-note"> {resolved.message}</span>}
            </span>
            <button ref={nextRef} className="btn big" onClick={next}>
              {index + 1 < total ? 'Siguiente →' : 'Terminar'}
            </button>
          </>
        ) : null}
      </div>
    </div>
  )
}
