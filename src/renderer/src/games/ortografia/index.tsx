import { useMemo, useState } from 'react'
import './style.css'
import '../_lengua/lengua.css'
import PlayerSetup from '../../components/games/PlayerSetup'
import { gradeLabel } from '../../content/subjects'
import { GRADES, type Grade } from '../../content/types'
import type { Player } from '../../lib/games/players'
import { usePersistentState } from '../../lib/usePersistentState'
import { bankFor, buildRound, rulesIn } from './engine'
import Round from './Round'
import { RULES, type RuleId } from './rules'

export type Mode = 'rapido' | 'equipos' | 'practica'

const MODES: { id: Mode; icon: string; title: string; desc: string }[] = [
  { id: 'rapido', icon: '⚡', title: 'Rápido', desc: 'Cuenta regresiva en cada pregunta' },
  {
    id: 'equipos',
    icon: '👥',
    title: 'Equipos por turnos',
    desc: 'Cada equipo responde a su turno'
  },
  { id: 'practica', icon: '📝', title: 'Práctica', desc: 'Sin tiempo, para pensar con calma' }
]

type Phase =
  { name: 'setup' } | { name: 'players' } | { name: 'play'; players: Player[]; round: number }

export default function Ortografia(): React.JSX.Element {
  const [grade, setGrade] = usePersistentState<Grade>('game:ortografia:grade', 3)
  const [mode, setMode] = usePersistentState<Mode>('game:ortografia:mode', 'practica')
  const [count, setCount] = usePersistentState('game:ortografia:count', 15)
  const [seconds, setSeconds] = usePersistentState('game:ortografia:seconds', 12)
  const [off, setOff] = useState<RuleId[]>([])
  const [phase, setPhase] = useState<Phase>({ name: 'setup' })

  const available = useMemo(() => rulesIn(grade), [grade])
  const ruleIds = RULES.filter((r) => available.some((a) => a.rule === r.id))
  const chosen = ruleIds.filter((r) => !off.includes(r.id)).map((r) => r.id)
  const total = bankFor(grade).filter((e) => chosen.includes(e.rule)).length

  const toggle = (id: RuleId): void =>
    setOff(off.includes(id) ? off.filter((x) => x !== id) : [...off, id])

  if (phase.name === 'players')
    return (
      <PlayerSetup
        startLabel="Empezar"
        onStart={(players) => setPhase({ name: 'play', players, round: 0 })}
      />
    )

  if (phase.name === 'play')
    return (
      <PlayRound
        key={phase.round}
        grade={grade}
        rules={chosen}
        count={count}
        mode={mode}
        seconds={seconds}
        players={phase.players}
        onAgain={() => setPhase({ ...phase, round: phase.round + 1 })}
        onExit={() => setPhase({ name: 'setup' })}
      />
    )

  const start = (): void =>
    setPhase(mode === 'equipos' ? { name: 'players' } : { name: 'play', players: [], round: 0 })

  return (
    <section className="panel or-setup">
      <div className="row start">
        <span className="ln-field-title">Grado</span>
        <div className="pills" role="group" aria-label="Grado">
          {GRADES.map((g) => (
            <button
              key={g}
              className={`pill ${grade === g ? 'selected' : ''}`}
              aria-pressed={grade === g}
              onClick={() => (setGrade(g), setOff([]))}
            >
              {gradeLabel(g)}
            </button>
          ))}
        </div>
      </div>

      <div className="row start">
        <span className="ln-field-title">Reglas</span>
        <div className="pills" role="group" aria-label="Reglas">
          {ruleIds.map((r) => (
            <button
              key={r.id}
              className={`pill small ${off.includes(r.id) ? '' : 'selected'}`}
              aria-pressed={!off.includes(r.id)}
              onClick={() => toggle(r.id)}
            >
              {off.includes(r.id) ? '' : '✓ '}
              {r.title}
            </button>
          ))}
        </div>
      </div>

      <div className="ln-menu-cards" role="group" aria-label="Modo de juego">
        {MODES.map((m) => (
          <button
            key={m.id}
            className={`ln-card ${mode === m.id ? 'selected' : ''}`}
            aria-pressed={mode === m.id}
            onClick={() => setMode(m.id)}
          >
            <span className="ln-card-icon">{m.icon}</span>
            <span className="ln-card-title">{m.title}</span>
            <span className="ln-card-desc">{m.desc}</span>
          </button>
        ))}
      </div>

      <div className="row start or-options">
        <span className="ln-field-title">Preguntas</span>
        <div className="pills" role="group" aria-label="Cantidad de preguntas">
          {[10, 15, 20, 30].map((n) => (
            <button
              key={n}
              className={`pill ${count === n ? 'selected' : ''}`}
              aria-pressed={count === n}
              onClick={() => setCount(n)}
            >
              {n}
            </button>
          ))}
        </div>
        {mode === 'rapido' && (
          <>
            <span className="ln-field-title">Tiempo</span>
            <div className="pills" role="group" aria-label="Segundos por pregunta">
              {[8, 12, 20].map((n) => (
                <button
                  key={n}
                  className={`pill ${seconds === n ? 'selected' : ''}`}
                  aria-pressed={seconds === n}
                  onClick={() => setSeconds(n)}
                >
                  {n} s
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="row start">
        <button className="btn big" disabled={total === 0} onClick={start}>
          {mode === 'equipos' ? 'Siguiente →' : 'Empezar'}
        </button>
        {total > 0 && total < count && (
          <span className="muted">Con estas reglas hay {total} preguntas.</span>
        )}
      </div>
    </section>
  )
}

function PlayRound({
  grade,
  rules,
  count,
  mode,
  seconds,
  players,
  onAgain,
  onExit
}: {
  grade: Grade
  rules: RuleId[]
  count: number
  mode: Mode
  seconds: number
  players: Player[]
  onAgain: () => void
  onExit: () => void
}): React.JSX.Element {
  const items = useMemo(() => buildRound(grade, rules, count), [grade, rules, count])
  return (
    <Round
      items={items}
      players={players}
      seconds={mode === 'rapido' ? seconds : 0}
      onAgain={onAgain}
      onExit={onExit}
    />
  )
}
