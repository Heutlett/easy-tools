import { useState } from 'react'
import './style.css'
import PlayerSetup from '../../components/games/PlayerSetup'
import { GRADES, type Grade } from '../../content/types'
import { gradeLabel } from '../../content/subjects'
import { usePersistentState } from '../../lib/usePersistentState'
import type { Player } from '../../lib/games/players'
import Duel from './Duel'
import Lightning from './Lightning'
import Solo from './Solo'
import {
  ALL_TABLES,
  COUNTS,
  DEFAULT_KINDS,
  DEFAULT_TABLES,
  KINDS,
  LEVELS,
  SECONDS,
  SOLO_SECONDS,
  kindAvailable,
  type Config,
  type Kind,
  type Level
} from './data'

type Mode = 'relampago' | 'duelo' | 'solo'

interface Settings {
  mode: Mode
  grade: Grade
  level: Level
  kinds: Kind[]
  tables: number[]
  seconds: number
  soloSeconds: number
  count: number
}

const DEFAULTS: Settings = {
  mode: 'relampago',
  grade: 3,
  level: 2,
  kinds: DEFAULT_KINDS[3],
  tables: DEFAULT_TABLES[3],
  seconds: 10,
  soloSeconds: 0,
  count: 10
}

const MODES: { id: Mode; icon: string; title: string; text: string }[] = [
  {
    id: 'relampago',
    icon: '⚡',
    title: 'Relámpago',
    text: 'Toda la clase responde antes de que acabe el tiempo'
  },
  { id: 'duelo', icon: '🥊', title: 'Duelo', text: 'Equipos: gana el turno quien pulse primero' },
  { id: 'solo', icon: '🧠', title: 'Solo yo', text: 'Escribe la respuesta con el teclado' }
]

type Phase =
  { name: 'setup' } | { name: 'players' } | { name: 'play'; players: Player[]; key: number }

export default function MentalMath(): React.JSX.Element {
  const [saved, setSaved] = usePersistentState<Settings>('game:calculo-mental:settings', DEFAULTS)
  // Por si se guardó algo de una versión anterior
  const s: Settings = { ...DEFAULTS, ...saved }
  const [phase, setPhase] = useState<Phase>({ name: 'setup' })
  const set = (patch: Partial<Settings>): void => setSaved({ ...s, ...patch })

  const kinds = s.kinds.filter((k) => kindAvailable(k, s.grade))
  const config: Config = { grade: s.grade, level: s.level, kinds, tables: s.tables }
  const usesTables = kinds.some((k) => k === 'mul' || k === 'div' || k === 'fill') && s.grade >= 2

  const exit = (): void => setPhase({ name: 'setup' })

  if (phase.name === 'players')
    return (
      <div className="g-stage">
        <div className="row start">
          <button className="btn secondary small" onClick={exit}>
            ← Cambiar opciones
          </button>
        </div>
        <PlayerSetup
          max={4}
          startLabel="¡Empezar el duelo!"
          onStart={(players) => setPhase({ name: 'play', players, key: Date.now() })}
        />
      </div>
    )

  if (phase.name === 'play') {
    if (s.mode === 'duelo')
      return (
        <Duel
          key={phase.key}
          config={config}
          players={phase.players}
          seconds={s.seconds}
          count={s.count}
          onExit={exit}
        />
      )
    if (s.mode === 'solo')
      return (
        <Solo
          key={phase.key}
          config={config}
          seconds={s.soloSeconds}
          count={s.count}
          onExit={exit}
        />
      )
    return (
      <Lightning
        key={phase.key}
        config={config}
        seconds={s.seconds}
        count={s.count}
        onExit={exit}
      />
    )
  }

  const toggleKind = (k: Kind): void => {
    const has = kinds.includes(k)
    if (has && kinds.length === 1) return
    set({ kinds: has ? kinds.filter((x) => x !== k) : [...kinds, k] })
  }
  const toggleTable = (n: number): void => {
    const has = s.tables.includes(n)
    if (has && s.tables.length === 1) return
    set({ tables: has ? s.tables.filter((x) => x !== n) : [...s.tables, n].sort((a, b) => a - b) })
  }
  const start = (): void => {
    if (s.mode === 'duelo') setPhase({ name: 'players' })
    else setPhase({ name: 'play', players: [], key: Date.now() })
  }

  return (
    <div className="g-stage cm-setup">
      <div className="cm-modes" role="group" aria-label="Cómo jugar">
        {MODES.map((m) => (
          <button
            key={m.id}
            className={`cm-mode ${s.mode === m.id ? 'selected' : ''}`}
            aria-pressed={s.mode === m.id}
            onClick={() => set({ mode: m.id })}
          >
            <span className="cm-mode-icon">{m.icon}</span>
            <span className="cm-mode-title">{m.title}</span>
            <span className="cm-mode-text">{m.text}</span>
          </button>
        ))}
      </div>

      <section className="panel cm-options">
        <div className="cm-opt">
          <span className="panel-title">Grado</span>
          <div className="pills" role="group" aria-label="Grado">
            {GRADES.map((g) => (
              <button
                key={g}
                className={`pill ${s.grade === g ? 'selected' : ''}`}
                aria-pressed={s.grade === g}
                onClick={() =>
                  set({
                    grade: g,
                    kinds: DEFAULT_KINDS[g],
                    tables: DEFAULT_TABLES[g].length ? DEFAULT_TABLES[g] : s.tables
                  })
                }
              >
                {gradeLabel(g)}
              </button>
            ))}
          </div>
          <span className="panel-title cm-gap">Dificultad</span>
          <div className="pills" role="group" aria-label="Dificultad">
            {LEVELS.map((l) => (
              <button
                key={l.id}
                className={`pill ${s.level === l.id ? 'selected' : ''}`}
                aria-pressed={s.level === l.id}
                onClick={() => set({ level: l.id })}
              >
                {l.icon} {l.title}
              </button>
            ))}
          </div>
        </div>

        <div className="cm-opt">
          <span className="panel-title">Operaciones</span>
          <div className="pills" role="group" aria-label="Operaciones">
            {KINDS.map((k) => {
              const ok = kindAvailable(k.id, s.grade)
              return (
                <button
                  key={k.id}
                  className={`pill ${kinds.includes(k.id) ? 'selected' : ''}`}
                  aria-pressed={kinds.includes(k.id)}
                  disabled={!ok}
                  title={ok ? undefined : `Desde ${gradeLabel(k.from)}`}
                  onClick={() => toggleKind(k.id)}
                >
                  {k.icon} {k.title}
                </button>
              )
            })}
          </div>
        </div>

        <div className="cm-opt">
          {s.mode === 'solo' ? (
            <>
              <span className="panel-title">Tiempo por operación</span>
              <div className="pills" role="group" aria-label="Tiempo por operación">
                {SOLO_SECONDS.map((n) => (
                  <button
                    key={n}
                    className={`pill ${s.soloSeconds === n ? 'selected' : ''}`}
                    aria-pressed={s.soloSeconds === n}
                    onClick={() => set({ soloSeconds: n })}
                  >
                    {n === 0 ? 'Sin límite' : `${n} s`}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <>
              <span className="panel-title">
                {s.mode === 'duelo' ? 'Tiempo para responder' : 'Tiempo por operación'}
              </span>
              <div className="pills" role="group" aria-label="Segundos">
                {SECONDS.map((n) => (
                  <button
                    key={n}
                    className={`pill ${s.seconds === n ? 'selected' : ''}`}
                    aria-pressed={s.seconds === n}
                    onClick={() => set({ seconds: n })}
                  >
                    {n} s
                  </button>
                ))}
              </div>
            </>
          )}
          <span className="panel-title cm-gap">Cuántas operaciones</span>
          <div className="pills" role="group" aria-label="Cantidad de operaciones">
            {COUNTS.map((n) => (
              <button
                key={n}
                className={`pill ${s.count === n ? 'selected' : ''}`}
                aria-pressed={s.count === n}
                onClick={() => set({ count: n })}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
        {usesTables && (
          <div className="cm-opt wide">
            <span className="panel-title">Tablas</span>
            <div className="pills" role="group" aria-label="Tablas">
              {ALL_TABLES.map((n) => (
                <button
                  key={n}
                  className={`pill cm-table ${s.tables.includes(n) ? 'selected' : ''}`}
                  aria-pressed={s.tables.includes(n)}
                  onClick={() => toggleTable(n)}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
        )}
      </section>

      <div className="row start">
        <button className="btn big" onClick={start}>
          {s.mode === 'duelo' ? 'Siguiente →' : '¡Empezar!'}
        </button>
      </div>
    </div>
  )
}
