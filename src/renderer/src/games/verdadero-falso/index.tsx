import { useEffect, useState } from 'react'
import './style.css'
import PlayerSetup from '../../components/games/PlayerSetup'
import { StatementPicker } from '../../components/games/Pickers'
import Scoreboard from '../../components/games/Scoreboard'
import { gradeLabel, subjectOf } from '../../content/subjects'
import type { Statement } from '../../content/types'
import { useScores, type Player } from '../../lib/games/players'
import { pick } from '../../lib/games/shuffle'
import { sfx } from '../../lib/games/sfx'

type Phase =
  | { name: 'content' }
  | { name: 'players'; statements: Statement[] }
  | { name: 'play'; statements: Statement[]; players: Player[] }

export default function TrueFalse(): React.JSX.Element {
  const [phase, setPhase] = useState<Phase>({ name: 'content' })

  if (phase.name === 'content')
    return (
      <StatementPicker
        counts={[10, 15, 20, 30]}
        defaultCount={15}
        startLabel="Siguiente →"
        onStart={(pool, count) => setPhase({ name: 'players', statements: pick(pool, count) })}
      />
    )

  if (phase.name === 'players')
    return (
      <PlayerSetup
        optional
        onStart={(players) => setPhase({ name: 'play', statements: phase.statements, players })}
      />
    )

  return (
    <Round
      statements={phase.statements}
      players={phase.players}
      onExit={() => setPhase({ name: 'content' })}
    />
  )
}

function Round({
  statements,
  players,
  onExit
}: {
  statements: Statement[]
  players: Player[]
  onExit: () => void
}): React.JSX.Element {
  const [index, setIndex] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const [finished, setFinished] = useState(false)
  const { scores, add, reset, ranking, leaders } = useScores(players)
  const current = statements[index]

  const advance = (): void => {
    if (!revealed) {
      setRevealed(true)
      current.answer ? sfx.correct() : sfx.wrong()
    } else if (index + 1 < statements.length) {
      setIndex(index + 1)
      setRevealed(false)
    } else {
      setFinished(true)
      sfx.win()
    }
  }

  // Con el teclado: la flecha derecha (o AvPág, como las de los controles de presentaciones) siempre avanza;
  // Espacio y Enter solo cuando no hay un botón seleccionado, para no pulsar otro botón por accidente
  useEffect(() => {
    if (finished) return
    const onKey = (e: KeyboardEvent): void => {
      const tag = e.target instanceof HTMLElement ? e.target.tagName : 'BODY'
      if (/^(INPUT|TEXTAREA|SELECT)$/.test(tag)) return
      const arrow = e.key === 'ArrowRight' || e.key === 'PageDown'
      if (arrow || ((e.key === ' ' || e.key === 'Enter') && tag === 'BODY')) {
        e.preventDefault()
        advance()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  if (finished) {
    return (
      <div className="g-stage g-center vf-end">
        <p className="g-win">🎉 ¡Terminamos!</p>
        {players.length > 0 ? (
          <>
            <p className="vf-winner">
              {leaders.length === 1
                ? `Ganó ${leaders[0].emoji} ${leaders[0].name}`
                : leaders.length > 1
                  ? `Empate: ${leaders.map((l) => l.name).join(' y ')}`
                  : 'Nadie sumó puntos'}
            </p>
            <Scoreboard players={ranking} scores={scores} />
          </>
        ) : (
          <p className="muted">{statements.length} afirmaciones</p>
        )}
        <div className="row start">
          <button
            className="btn big"
            onClick={() => (reset(), setIndex(0), setRevealed(false), setFinished(false))}
          >
            Jugar otra vez
          </button>
          <button className="btn secondary" onClick={onExit}>
            Cambiar de preguntas
          </button>
        </div>
      </div>
    )
  }

  const subject = subjectOf(current.subject)
  return (
    <div className="g-stage vf">
      <div className="row">
        <span className="g-badge">
          {index + 1} / {statements.length}
        </span>
        <span className="g-badge">
          {subject.icon} {subject.title} · {gradeLabel(current.grade)} · {current.topic}
        </span>
      </div>

      <div className="g-question vf-statement">{current.text}</div>

      <div className={`vf-answer ${revealed ? (current.answer ? 'true' : 'false') : ''}`}>
        {revealed ? (
          <>
            <p className="vf-verdict">{current.answer ? '✅ VERDADERO' : '❌ FALSO'}</p>
            {current.explanation && <p className="vf-explanation">{current.explanation}</p>}
          </>
        ) : (
          <p className="muted">¿Verdadero o falso? Piénsenlo y voten 🙋</p>
        )}
      </div>

      <div className="row">
        <button className="btn big" onClick={advance}>
          {!revealed
            ? 'Mostrar la respuesta'
            : index + 1 < statements.length
              ? 'Siguiente →'
              : 'Terminar'}
        </button>
        <button className="btn secondary" onClick={onExit}>
          Salir
        </button>
      </div>

      {players.length > 0 && (
        <div className="vf-scores">
          <p className="muted">Pulsa + en los equipos que acertaron:</p>
          <Scoreboard players={players} scores={scores} onAdd={add} compact />
        </div>
      )}
      <p className="muted vf-hint">Flecha → o Espacio: avanzar</p>
    </div>
  )
}
