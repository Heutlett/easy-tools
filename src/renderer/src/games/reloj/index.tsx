import { useEffect, useState } from 'react'
import './style.css'
import PlayerSetup from '../../components/games/PlayerSetup'
import type { Player } from '../../lib/games/players'
import { shuffle } from '../../lib/games/shuffle'
import { sfx } from '../../lib/games/sfx'
import { usePersistentState } from '../../lib/usePersistentState'
import Choices from '../_manip/Choices'
import { ActivityCards, PillRow, type ActivityInfo } from '../_manip/Menu'
import Runner, { type Ctx } from '../_manip/Runner'
import { mod } from '../_manip/util'
import Clock from './Clock'
import { TIME_LEVELS, levelOf, type Format } from './data'
import { dayIcon, dayPart, digital, distractors, randomTime, sameFace, words } from './time'

type ActivityId = 'explorar' | 'que-hora' | 'pon-la-hora'
interface Prefs {
  activity: ActivityId
  level: number
  format: Format
  answers: 'digital' | 'words'
  total: number
}
const DEFAULTS: Prefs = {
  activity: 'explorar',
  level: 3,
  format: '12',
  answers: 'digital',
  total: 10
}

const ACTIVITIES: ActivityInfo[] = [
  { id: 'explorar', icon: '🖐️', title: 'Explorar', desc: 'Mueve las manecillas y mira la hora' },
  { id: 'que-hora', icon: '🤔', title: '¿Qué hora es?', desc: 'Mira el reloj y elige la hora' },
  {
    id: 'pon-la-hora',
    icon: '🎯',
    title: 'Pon la hora',
    desc: 'Mueve las manecillas a la hora pedida'
  }
]

type Phase =
  { name: 'menu' } | { name: 'explore' } | { name: 'players' } | { name: 'play'; players: Player[] }

export default function Reloj(): React.JSX.Element {
  const [prefs, setPrefs] = usePersistentState<Prefs>('game:reloj:prefs', DEFAULTS)
  const p = { ...DEFAULTS, ...prefs }
  const [phase, setPhase] = useState<Phase>({ name: 'menu' })
  const set = (patch: Partial<Prefs>): void => setPrefs({ ...p, ...patch })
  if (phase.name === 'explore')
    return <Explore prefs={p} onExit={() => setPhase({ name: 'menu' })} />

  if (phase.name === 'players')
    return (
      <div className="g-stage mp-menu">
        <button className="btn secondary small mp-back" onClick={() => setPhase({ name: 'menu' })}>
          ← Cambiar actividad
        </button>
        <PlayerSetup optional onStart={(players) => setPhase({ name: 'play', players })} />
      </div>
    )

  if (phase.name === 'play')
    return (
      <Runner
        players={phase.players}
        total={p.total}
        onExit={() => setPhase({ name: 'menu' })}
        renderQuestion={(ctx) =>
          p.activity === 'que-hora' ? (
            <WhatTime ctx={ctx} prefs={p} />
          ) : (
            <SetTime ctx={ctx} prefs={p} />
          )
        }
      />
    )

  const level = levelOf(p.level)
  return (
    <div className="g-stage mp-menu">
      <ActivityCards
        items={ACTIVITIES}
        value={p.activity}
        onChange={(activity) => set({ activity: activity as ActivityId })}
      />
      <PillRow
        label="Minutos"
        value={p.level}
        onChange={(l) => set({ level: l })}
        items={TIME_LEVELS.map((l) => ({ id: l.id, label: `${l.title} · ${l.grade}` }))}
      />
      <PillRow
        label="Formato"
        value={p.format}
        onChange={(format) => set({ format })}
        items={[
          { id: '12' as Format, label: '12 horas (a. m. / p. m.)' },
          { id: '24' as Format, label: '24 horas · 3.º y 4.º' }
        ]}
      />
      {p.activity !== 'explorar' && (
        <>
          <PillRow
            label="Se muestra en"
            value={p.answers}
            onChange={(answers) => set({ answers })}
            items={[
              { id: 'digital' as const, label: '🔢 Números (3:30)' },
              { id: 'words' as const, label: '📝 Palabras (las tres y media)' }
            ]}
          />
          <PillRow
            label="Preguntas"
            value={p.total}
            onChange={(total) => set({ total })}
            items={[5, 10, 15].map((n) => ({ id: n, label: String(n) }))}
          />
        </>
      )}
      <div className="row start">
        <button
          className="btn big"
          onClick={() =>
            p.activity === 'explorar'
              ? setPhase({ name: 'explore' })
              : setPhase({ name: 'players' })
          }
        >
          {p.activity === 'explorar' ? 'Abrir el reloj →' : 'Siguiente →'}
        </button>
        <span className="muted">
          Manecilla roja: minutos · manecilla negra: horas ({level.title})
        </span>
      </div>
    </div>
  )
}

/** Hora de la computadora redondeada a lo que permite el nivel */
function nowTime(snap: number): number {
  const d = new Date()
  return mod(Math.round((d.getHours() * 60 + d.getMinutes()) / snap) * snap, 1440)
}

function Explore({ prefs, onExit }: { prefs: Prefs; onExit: () => void }): React.JSX.Element {
  const [format, setFormat] = useState<Format>(prefs.format)
  const [step, setStep] = useState(levelOf(prefs.level).snap)
  const [minutes, setMinutes] = useState(true)
  const [t, setT] = useState(() => nowTime(step))

  useEffect(() => {
    const onKey = (e: KeyboardEvent): void => {
      const tag = e.target instanceof HTMLElement ? e.target.tagName : 'BODY'
      if (tag !== 'BODY') return
      const moves: Record<string, number> = {
        ArrowRight: step,
        ArrowLeft: -step,
        ArrowUp: 60,
        ArrowDown: -60
      }
      if (e.key in moves) {
        e.preventDefault()
        setT((v) => mod(v + moves[e.key], 1440))
        sfx.tick()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [step])

  const move = (d: number): void => (setT((v) => mod(v + d, 1440)), sfx.tick())
  const snapTo = (v: number, s: number): number => mod(Math.round(v / s) * s, 1440)

  return (
    <div className="rl-explore">
      <div className="rl-explore-head">
        <button className="btn secondary small" onClick={onExit}>
          ← Cambiar actividad
        </button>
      </div>
      <div className="rl-play">
        <Clock t={t} onChange={setT} snap={step} showMinutes={minutes} />
        <div className="rl-side">
          <div className="rl-digital" aria-live="polite">
            {digital(t, format)}
            {format === '12' && <small>{t < 720 ? 'a. m.' : 'p. m.'}</small>}
          </div>
          <div className="rl-words">
            <span>
              {words(t)}
              <span className="rl-part">
                {dayIcon(t)} {dayPart(t)}
              </span>
            </span>
          </div>
          <div className="rl-controls">
            <button className="btn" onClick={() => move(-60)}>
              − 1 hora
            </button>
            <button className="btn" onClick={() => move(60)}>
              + 1 hora
            </button>
            <button className="btn" onClick={() => move(-step)}>
              − {step} min
            </button>
            <button className="btn" onClick={() => move(step)}>
              + {step} min
            </button>
          </div>
          <div className="rl-pills">
            <button className="pill" onClick={() => setT(snapTo(randomTime(levelOf(5)), step))}>
              🎲 Al azar
            </button>
            <button className="pill" onClick={() => setT(nowTime(step))}>
              🕒 Ahora
            </button>
            <button
              className={`pill ${format === '24' ? 'selected' : ''}`}
              aria-pressed={format === '24'}
              onClick={() => setFormat(format === '24' ? '12' : '24')}
            >
              24 h
            </button>
            <button
              className={`pill ${minutes ? 'selected' : ''}`}
              aria-pressed={minutes}
              onClick={() => setMinutes(!minutes)}
            >
              Ver minutos
            </button>
            <button
              className="pill"
              onClick={() => setT(mod(t + 720, 1440))}
              aria-label="Cambiar entre mañana y tarde"
            >
              {t < 720 ? '☀️ → 🌙' : '🌙 → ☀️'}
            </button>
          </div>
          <div className="rl-pills" role="group" aria-label="Saltos de la manecilla">
            <span className="muted">Salta de:</span>
            {[60, 30, 15, 5, 1].map((n) => (
              <button
                key={n}
                className={`pill small ${step === n ? 'selected' : ''}`}
                aria-pressed={step === n}
                onClick={() => (setStep(n), setT((v) => snapTo(v, n)))}
              >
                {n === 60 ? '1 hora' : `${n} min`}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function WhatTime({ ctx, prefs }: { ctx: Ctx; prefs: Prefs }): React.JSX.Element {
  const level = levelOf(prefs.level)
  const [q] = useState(() => {
    const t = randomTime(level)
    const options = shuffle([t, ...distractors(t, level)])
    return { t, options }
  })
  const label = (x: number): string =>
    prefs.answers === 'words' ? words(x, prefs.format === '24') : digital(x, prefs.format)
  return (
    <div className="rl-play">
      <Clock
        t={q.t}
        showMinutes={level.id >= 4}
        tone={ctx.resolved ? (ctx.resolved.ok ? 'ok' : 'bad') : 'normal'}
      />
      <div className="rl-side">
        <p className="rl-question">
          ¿Qué hora es?{' '}
          {prefs.format === '24' && (
            <span>
              {dayIcon(q.t)} {dayPart(q.t).replace('de la ', '').replace('del ', '')}
            </span>
          )}
        </p>
        <Choices
          ctx={ctx}
          answerId={String(q.t)}
          explain={`Es ${label(q.t)}`}
          choices={q.options.map((x) => ({
            id: String(x),
            label: label(x),
            content:
              prefs.answers === 'words' ? (
                <span className="rl-opt-words">{label(x)}</span>
              ) : (
                <span className="rl-opt-digital">{label(x)}</span>
              )
          }))}
          className="mp-one-col"
        />
      </div>
    </div>
  )
}

function SetTime({ ctx, prefs }: { ctx: Ctx; prefs: Prefs }): React.JSX.Element {
  const level = levelOf(prefs.level)
  const [q] = useState(() => {
    const target = randomTime(level)
    let start = randomTime(level, target)
    if (prefs.format === '12') start = mod(start, 720)
    return { target, start }
  })
  const [t, setT] = useState(q.start)
  const [tries, setTries] = useState(0)
  const [hint, setHint] = useState('')
  const done = ctx.resolved !== null

  const check = (): void => {
    if (done) return
    const ok = sameFace(t, q.target)
    if (ok) {
      ctx.resolve(true, `¡Son ${digital(q.target, prefs.format)}!`)
      return
    }
    if (tries === 0) {
      setTries(1)
      const hourOk = Math.floor(mod(t, 720) / 60) === Math.floor(mod(q.target, 720) / 60)
      const minOk = mod(t, 60) === mod(q.target, 60)
      sfx.wrong()
      setHint(
        !minOk && !hourOk
          ? 'Casi: revisa las dos manecillas'
          : !minOk
            ? 'Revisa la manecilla roja (los minutos)'
            : 'Revisa la manecilla negra (las horas)'
      )
    } else {
      setT(q.target)
      ctx.resolve(false, `Era ${digital(q.target, prefs.format)}`)
    }
  }

  useEffect(() => {
    if (done) return
    const onKey = (e: KeyboardEvent): void => {
      const tag = e.target instanceof HTMLElement ? e.target.tagName : 'BODY'
      if (
        e.key === 'Enter' &&
        !e.repeat &&
        tag !== 'BUTTON' &&
        !/^(INPUT|TEXTAREA|SELECT)$/.test(tag)
      ) {
        e.preventDefault()
        check()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  return (
    <div className="rl-play">
      <Clock
        t={t}
        onChange={done ? undefined : setT}
        snap={level.snap}
        showMinutes={level.id >= 4}
        ghost={done && !ctx.resolved?.ok ? q.target : undefined}
        tone={done ? (ctx.resolved?.ok ? 'ok' : 'bad') : 'normal'}
      />
      <div className="rl-side">
        <div className="rl-prompt">
          Pon la hora
          {prefs.answers === 'words' ? (
            <span
              className="rl-big rl-opt-words"
              style={{ fontFamily: 'inherit', fontSize: '1.9rem' }}
            >
              {words(q.target, prefs.format === '24')}
            </span>
          ) : (
            <span className="rl-big">{digital(q.target, prefs.format)}</span>
          )}
          {prefs.format === '24' && (
            <small>
              {dayIcon(q.target)} {words(q.target, true)}
            </small>
          )}
        </div>
        <div className={`rl-tries ${hint && !done ? 'warn' : ''}`}>
          {done ? '' : hint || 'Arrastra las manecillas'}
        </div>
        <button className="btn big" disabled={done} onClick={check}>
          Comprobar ✔
        </button>
        <p className="muted rl-keys">Flechas: mover · Enter: comprobar</p>
      </div>
    </div>
  )
}
