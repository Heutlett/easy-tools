import { useEffect, useRef, useState } from 'react'
import './style.css'
import PlayerSetup from '../../components/games/PlayerSetup'
import Scoreboard from '../../components/games/Scoreboard'
import type { Grade } from '../../content/types'
import { randomFloat } from '../../lib/random'
import { useScores, type Player } from '../../lib/games/players'
import { shuffle } from '../../lib/games/shuffle'
import { sfx } from '../../lib/games/sfx'
import { useCountdown } from '../../lib/games/useCountdown'
import { useVoice } from '../../lib/games/useVoice'
import { useKeys, usePrefs } from '../_ingles/hooks'
import { GradeRow, PillRow, VoiceNotice } from '../_ingles/ui'
import { commandsFor, type Command } from './data'

type Speed = 'slow' | 'normal' | 'fast'
type Traps = 'few' | 'some' | 'many'
type FailMode = 'out' | 'points'

interface Prefs {
  grade: Grade
  review: boolean
  speed: Speed
  seconds: number
  auto: boolean
  traps: Traps
  rounds: number
  showEs: boolean
  failMode: FailMode
}

const DEFAULTS: Prefs = {
  grade: 1,
  review: false,
  speed: 'normal',
  seconds: 5,
  auto: false,
  traps: 'some',
  rounds: 25,
  showEs: false,
  failMode: 'out'
}

const RATE: Record<Speed, number> = { slow: 0.6, normal: 0.85, fast: 1.1 }
const TRAP_CHANCE: Record<Traps, number> = { few: 0.2, some: 0.35, many: 0.5 }

interface Step {
  command: Command
  /** Verdadero si la orden empieza con «Simon says» (hay que obedecerla) */
  simon: boolean
}

const lower = (s: string): string => s.charAt(0).toLowerCase() + s.slice(1)

function buildSteps(prefs: Prefs): Step[] {
  const chance = TRAP_CHANCE[prefs.traps]
  return shuffle(commandsFor(prefs.grade, prefs.review))
    .slice(0, prefs.rounds)
    .map((command, i) => ({ command, simon: i === 0 || randomFloat() >= chance }))
}

/** Lo que se dice y se escribe: «Simon says touch your nose.» o «Touch your nose.» */
const spoken = (s: Step): string => (s.simon ? `Simon says ${lower(s.command.en)}` : s.command.en)

type Phase =
  | { name: 'setup' }
  | { name: 'players' }
  | { name: 'play'; players: Player[]; steps: Step[]; run: number }

export default function SimonSays(): React.JSX.Element {
  const [prefs, setPrefs] = usePrefs('ingles-simon', DEFAULTS)
  const [phase, setPhase] = useState<Phase>({ name: 'setup' })

  if (phase.name === 'setup')
    return <Setup prefs={prefs} onChange={setPrefs} onNext={() => setPhase({ name: 'players' })} />

  if (phase.name === 'players')
    return (
      <div className="ing-stage">
        <PlayerSetup
          optional
          startLabel="Start ▶"
          onStart={(players) =>
            setPhase({ name: 'play', players, steps: buildSteps(prefs), run: 0 })
          }
        />
        <p className="muted">
          Con equipos o estudiantes puedes marcar con «Fail» a quien se equivoque.
        </p>
        <div className="row start">
          <button className="btn secondary" onClick={() => setPhase({ name: 'setup' })}>
            ← Volver
          </button>
        </div>
      </div>
    )

  return (
    <Round
      key={phase.run}
      prefs={prefs}
      players={phase.players}
      steps={phase.steps}
      onAgain={() => setPhase({ ...phase, steps: buildSteps(prefs), run: phase.run + 1 })}
      onExit={() => setPhase({ name: 'setup' })}
    />
  )
}

function Setup({
  prefs,
  onChange,
  onNext
}: {
  prefs: Prefs
  onChange: (patch: Partial<Prefs>) => void
  onNext: () => void
}): React.JSX.Element {
  const count = commandsFor(prefs.grade, prefs.review).length
  return (
    <section className="panel ing-setup">
      <GradeRow value={prefs.grade} onChange={(grade) => onChange({ grade })} />
      <div className="is-grid">
        <PillRow
          label="Órdenes"
          value={prefs.review ? 1 : 0}
          options={[
            { id: 0, label: 'Este grado' },
            { id: 1, label: '🔁 Con repaso' }
          ]}
          onChange={(v) => onChange({ review: v === 1 })}
        />
        <PillRow
          label="Voz"
          value={prefs.speed}
          options={[
            { id: 'slow', label: '🐢 Lenta' },
            { id: 'normal', label: '🙂 Media' },
            { id: 'fast', label: '🐇 Rápida' }
          ]}
          onChange={(speed) => onChange({ speed })}
        />
        <PillRow
          label="Tiempo"
          value={prefs.seconds}
          options={[3, 5, 8, 12].map((n) => ({ id: n, label: `${n} s` }))}
          onChange={(seconds) => onChange({ seconds })}
        />
        <PillRow
          label="Siguiente"
          value={prefs.auto ? 1 : 0}
          options={[
            { id: 0, label: '👆 Yo pulso' },
            { id: 1, label: '⏩ Automático' }
          ]}
          onChange={(v) => onChange({ auto: v === 1 })}
        />
        <PillRow
          label="Sin «Simon»"
          value={prefs.traps}
          options={[
            { id: 'few', label: 'Pocas' },
            { id: 'some', label: 'Algunas' },
            { id: 'many', label: 'Muchas' }
          ]}
          onChange={(traps) => onChange({ traps })}
        />
        <PillRow
          label="Cuántas"
          value={prefs.rounds}
          options={[15, 25, 40].map((n) => ({ id: n, label: String(n) }))}
          onChange={(rounds) => onChange({ rounds })}
        />
        <PillRow
          label="Español"
          value={prefs.showEs ? 1 : 0}
          options={[
            { id: 0, label: '🙈 Oculto' },
            { id: 1, label: '🇪🇸 Visible' }
          ]}
          onChange={(v) => onChange({ showEs: v === 1 })}
        />
        <PillRow
          label="Si fallan"
          value={prefs.failMode}
          options={[
            { id: 'out', label: '🚪 Quedan fuera' },
            { id: 'points', label: '⭐ Puntos' }
          ]}
          onChange={(failMode) => onChange({ failMode })}
        />
      </div>
      <div className="ing-info">
        <p className="muted">{count} órdenes</p>
        <button className="btn big" disabled={count < 5} onClick={onNext}>
          Siguiente →
        </button>
      </div>
    </section>
  )
}

function Round({
  prefs,
  players,
  steps,
  onAgain,
  onExit
}: {
  prefs: Prefs
  players: Player[]
  steps: Step[]
  onAgain: () => void
  onExit: () => void
}): React.JSX.Element {
  const voice = useVoice('en')
  const { scores, add, ranking, leaders } = useScores(players)
  const [index, setIndex] = useState(0)
  const [phase, setPhase] = useState<'doing' | 'verdict'>('doing')
  const [paused, setPaused] = useState(false)
  const [showEs, setShowEs] = useState(prefs.showEs)
  const [failed, setFailed] = useState<string[]>([])
  const [out, setOut] = useState<string[]>([])
  const [finished, setFinished] = useState(false)
  const [notice, setNotice] = useState('')
  const nextRef = useRef<HTMLButtonElement>(null)

  const step = steps[index]
  const eliminating = players.length > 0 && prefs.failMode === 'out'
  const alive = players.filter((p) => !out.includes(p.id))
  const text = spoken(step)

  const timer = useCountdown({ sound: false, ticks: true, onEnd: () => reveal() })

  function reveal(): void {
    setPhase('verdict')
    if (step.simon) sfx.correct()
    else sfx.wrong()
  }

  // Cada orden nueva: se dice y arranca el tiempo
  useEffect(() => {
    if (finished) return
    const id = window.setTimeout(() => voice.speak(text, RATE[prefs.speed]), 350)
    timer.start(prefs.seconds)
    return () => {
      window.clearTimeout(id)
      timer.stop()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, finished, voice.available])

  useEffect(() => {
    if (phase === 'verdict' && !prefs.auto) nextRef.current?.focus({ preventScroll: true })
  }, [phase, prefs.auto])

  function togglePause(): void {
    if (paused) {
      setPaused(false)
      if (phase === 'doing') timer.start(Math.max(1, timer.seconds))
    } else {
      setPaused(true)
      timer.stop()
      voice.stop()
    }
  }

  function next(): void {
    timer.stop()
    voice.stop()
    setPaused(false)
    setNotice('')
    let nowOut = out
    if (players.length > 0) {
      if (prefs.failMode === 'out') {
        const stillIn = alive.filter((p) => !failed.includes(p.id))
        // Si fallaran todos a la vez, nadie queda fuera esta vez
        if (stillIn.length > 0) nowOut = [...out, ...failed.filter((id) => !out.includes(id))]
        else if (failed.length > 0) setNotice('Todos fallaron: nadie queda fuera esta vez')
      } else {
        for (const p of players) if (!failed.includes(p.id)) add(p.id, 1)
      }
    }
    setOut(nowOut)
    setFailed([])
    const left = players.filter((p) => !nowOut.includes(p.id))
    const over = index + 1 >= steps.length || (eliminating && left.length <= 1)
    if (over) {
      setFinished(true)
      sfx.win()
    } else {
      setIndex(index + 1)
      setPhase('doing')
    }
  }

  // En automático, tras mostrar el veredicto pasa sola a la siguiente
  useEffect(() => {
    if (phase !== 'verdict' || !prefs.auto || paused || finished) return
    const id = window.setTimeout(() => next(), 4000)
    return () => window.clearTimeout(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, paused, finished, index])

  const toggleFail = (id: string): void => {
    if (out.includes(id)) return
    sfx.pop()
    setFailed(failed.includes(id) ? failed.filter((x) => x !== id) : [...failed, id])
  }

  useKeys((e, bodyFocus) => {
    if (finished) return
    if (
      e.key === 'ArrowRight' ||
      e.key === 'PageDown' ||
      (bodyFocus && /^( |Enter)$/.test(e.key))
    ) {
      e.preventDefault()
      next()
    } else if (e.key === 'r' || e.key === 'R') voice.speak(text, RATE[prefs.speed])
    else if (e.key === 't' || e.key === 'T') setShowEs((v) => !v)
    else if (e.key === 'p' || e.key === 'P') togglePause()
  })

  if (finished) {
    const survivors = alive
    return (
      <div className="g-stage g-center ing-end">
        <p className="g-win">🎉 Great game!</p>
        {players.length === 0 ? (
          <p className="ing-winner">{index + 1} commands</p>
        ) : eliminating ? (
          <>
            <p className="ing-winner">
              {survivors.length === 1
                ? `Ganó ${survivors[0].emoji} ${survivors[0].name}`
                : 'Siguen en pie:'}
            </p>
            {survivors.length !== 1 && (
              <div className="is-end-list">
                {survivors.map((p) => (
                  <span key={p.id} className="g-badge" style={{ background: `${p.color}22` }}>
                    {p.emoji} {p.name}
                  </span>
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            <p className="ing-winner">
              {leaders.length === 1
                ? `Ganó ${leaders[0].emoji} ${leaders[0].name}`
                : leaders.length > 1
                  ? `Empate: ${leaders.map((l) => l.name).join(' y ')}`
                  : 'Nadie sumó puntos'}
            </p>
            <Scoreboard players={ranking} scores={scores} />
          </>
        )}
        <div className="row start">
          <button className="btn big" onClick={onAgain}>
            Play again
          </button>
          <button className="btn secondary" onClick={onExit}>
            Cambiar ajustes
          </button>
        </div>
      </div>
    )
  }

  const verdict = phase === 'verdict'
  const total = prefs.seconds
  const body = lower(step.command.en)
  return (
    <div className="ing-stage">
      <div className="ing-hud">
        <span className="g-badge">
          {index + 1} / {steps.length}
        </span>
        {eliminating && <span className="g-badge">🙋 {alive.length} en juego</span>}
        <span className="spacer" />
        <VoiceNotice available={voice.available} />
        {paused && <span className="g-badge">⏸ Pausa</span>}
      </div>

      <div className="ing-card is-card">
        <p className="is-command">
          {step.simon && <span className="is-badge">Simon says</span>}
          {step.simon ? body : step.command.en}
        </p>
        <p className="is-es">{showEs ? `🇪🇸 ${step.command.es}` : ''}</p>
      </div>

      {!verdict ? (
        <div className={`is-bar ${timer.seconds <= 2 ? 'low' : ''}`} aria-hidden>
          <span
            style={{ width: `${(Math.max(0, timer.seconds - 1) / Math.max(1, total - 1)) * 100}%` }}
          />
        </div>
      ) : null}
      <div className={`is-verdict ${verdict ? (step.simon ? 'go' : 'freeze') : ''}`}>
        {verdict
          ? step.simon
            ? '✅ Simon said it: do it!'
            : '🙅 No “Simon says”: stay still!'
          : paused
            ? '⏸'
            : `⏱ ${timer.seconds}`}
      </div>

      <div className="is-controls">
        <button className="btn big" ref={nextRef} onClick={next}>
          {index + 1 < steps.length ? 'Next →' : 'Finish'}
        </button>
        <button className="btn secondary" onClick={() => voice.speak(text, RATE[prefs.speed])}>
          🔊 Repeat
        </button>
        <button className="btn secondary" onClick={togglePause}>
          {paused ? '▶️ Continue' : '✋ Pause'}
        </button>
        <button className="btn secondary" onClick={() => setShowEs(!showEs)}>
          {showEs ? '🙈 Ocultar español' : '🇪🇸 Mostrar español'}
        </button>
        <button className="btn secondary" onClick={onExit}>
          Salir
        </button>
      </div>

      {players.length > 0 && (
        <>
          <p className="is-title">
            {notice || (eliminating ? 'Fail: toca a quien se equivocó' : 'Fail: no suma el punto')}
          </p>
          <div className="is-fails" role="group" aria-label="Quién falló">
            {players.map((p) => {
              const isOut = out.includes(p.id)
              return (
                <button
                  key={p.id}
                  className={`is-fail ${failed.includes(p.id) ? 'failed' : ''} ${isOut ? 'out' : ''}`}
                  style={{ '--team': p.color } as React.CSSProperties}
                  disabled={isOut}
                  aria-pressed={failed.includes(p.id)}
                  onClick={() => toggleFail(p.id)}
                >
                  <span aria-hidden>{failed.includes(p.id) ? '✖' : p.emoji}</span> {p.name}
                  {!eliminating && <span className="pts">{scores[p.id] ?? 0}</span>}
                </button>
              )
            })}
          </div>
        </>
      )}
      <p className="muted ing-hint">Teclas: → siguiente · R repetir · T español · P pausa</p>
    </div>
  )
}
