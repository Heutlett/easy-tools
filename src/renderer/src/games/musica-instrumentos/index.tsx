import './style.css'
import { useEffect, useState } from 'react'
import PlayerSetup from '../../components/games/PlayerSetup'
import type { Player } from '../../lib/games/players'
import { sfx } from '../../lib/games/sfx'
import { usePersistentState } from '../../lib/usePersistentState'
import { LETTERS, useKeys, useLater, useRun, useStopAudioOnLeave } from '../_musica/hooks'
import InstrumentIcon from '../_musica/icons'
import { stopAll } from '../_musica/synth'
import { AudioNotice, EndScreen, PillRow, TeamScores, TopBar } from '../_musica/ui'
import {
  CLASSIFY_SETS,
  FAMILIES,
  GUESS_LEVELS,
  classifyPool,
  familyOf,
  makeGuess,
  playInstrument,
  type ClassifySet,
  type Family,
  type GuessQuestion,
  type Instrument
} from './data'

interface Settings {
  mode: 'guess' | 'classify'
  level: number
  set: ClassifySet
  count: number
}

const DEFAULTS: Settings = { mode: 'guess', level: 1, set: 'known', count: 10 }

type Phase = { name: 'setup' } | { name: 'players' } | { name: 'play'; players: Player[] }

export default function WhichInstrument(): React.JSX.Element {
  const [saved, setSaved] = usePersistentState<Settings>(
    'game:musica-instrumentos:settings',
    DEFAULTS
  )
  const settings = { ...DEFAULTS, ...saved }
  const [phase, setPhase] = useState<Phase>({ name: 'setup' })
  useStopAudioOnLeave()

  if (phase.name === 'setup') {
    const set = (patch: Partial<Settings>): void => setSaved({ ...settings, ...patch })
    return (
      <section className="panel mi-setup">
        <PillRow
          label="¿Qué hacemos?"
          value={settings.mode}
          onChange={(mode) => set({ mode, count: mode === 'guess' ? 10 : 8 })}
          options={[
            { value: 'guess', label: '👂 ¿Qué instrumento es?', hint: 'escuchar y adivinar' },
            {
              value: 'classify',
              label: '🧺 Clasificar por familia',
              hint: 'cuerdas, vientos, percusión'
            }
          ]}
        />
        {settings.mode === 'guess' ? (
          <PillRow
            label="Nivel"
            value={settings.level}
            onChange={(level) => set({ level })}
            options={GUESS_LEVELS.map((l) => ({
              value: l.id,
              label: `${l.id}. ${l.name}`,
              hint: l.grades
            }))}
          />
        ) : (
          <PillRow
            label="Instrumentos"
            value={settings.set}
            onChange={(s) => set({ set: s })}
            options={CLASSIFY_SETS.map((s) => ({ value: s.id, label: s.name, hint: s.grades }))}
          />
        )}
        <PillRow
          label={settings.mode === 'guess' ? 'Preguntas' : 'Cuántos instrumentos'}
          value={settings.count}
          onChange={(count) => set({ count })}
          options={(settings.mode === 'guess' ? [5, 10, 15, 20] : [6, 8, 12, 20]).map((n) => ({
            value: n,
            label: n === 20 && settings.mode === 'classify' ? 'Todos' : String(n)
          }))}
        />
        <div className="row start">
          <button className="btn big" onClick={() => setPhase({ name: 'players' })}>
            Siguiente →
          </button>
        </div>
      </section>
    )
  }

  if (phase.name === 'players')
    return <PlayerSetup optional onStart={(players) => setPhase({ name: 'play', players })} />

  const onExit = (): void => setPhase({ name: 'setup' })
  return settings.mode === 'guess' ? (
    <GuessRound
      level={settings.level}
      count={settings.count}
      players={phase.players}
      onExit={onExit}
    />
  ) : (
    <ClassifyRound
      set={settings.set}
      count={settings.count}
      players={phase.players}
      onExit={onExit}
    />
  )
}

// ---------------------------------------------------------------- ¿Qué instrumento es?

function GuessRound({
  level,
  count,
  players,
  onExit
}: {
  level: number
  count: number
  players: Player[]
  onExit: () => void
}): React.JSX.Element {
  const run = useRun(players, count)
  const later = useLater()
  const [q, setQ] = useState<GuessQuestion>(() => makeGuess(level))
  const [picked, setPicked] = useState<number | null>(null)
  const [playing, setPlaying] = useState(false)

  const listen = (): void => {
    stopAll()
    const seconds = playInstrument(q.instrument.sound!, q.motif)
    setPlaying(true)
    later(() => setPlaying(false), seconds * 1000)
  }

  useEffect(() => {
    if (run.finished) return
    const t = window.setTimeout(() => {
      stopAll()
      const seconds = playInstrument(q.instrument.sound!, q.motif)
      setPlaying(true)
      window.setTimeout(() => setPlaying(false), seconds * 1000)
    }, 450)
    return () => window.clearTimeout(t)
  }, [q, run.finished])

  const choose = (i: number): void => {
    if (picked !== null || run.finished) return
    setPicked(i)
    if (i === q.answer) {
      run.award(1)
      sfx.correct()
    } else sfx.wrong()
  }
  const advance = (): void => {
    stopAll()
    if (run.index + 1 >= run.total) {
      run.next()
      return
    }
    run.next()
    setPicked(null)
    setQ(makeGuess(level, q.instrument.id))
  }

  useKeys((e) => {
    if (run.finished) return
    const tag = e.target instanceof HTMLElement ? e.target.tagName : 'BODY'
    const n = Number(e.key)
    const letter = LETTERS.indexOf(e.key.toUpperCase())
    if (picked === null) {
      if (n >= 1 && n <= 4) choose(n - 1)
      else if (letter >= 0 && letter < 4) choose(letter)
      else if ((e.key === ' ' || e.key === 'Enter') && tag === 'BODY') {
        e.preventDefault()
        listen()
      }
    } else if (
      e.key === 'ArrowRight' ||
      e.key === 'PageDown' ||
      ((e.key === ' ' || e.key === 'Enter') && tag === 'BODY')
    ) {
      e.preventDefault()
      advance()
    }
  })

  if (run.finished) {
    return (
      <EndScreen
        players={players}
        run={run}
        summary={`${run.right} de ${run.total} instrumentos`}
        onAgain={() => {
          run.restart()
          setPicked(null)
          setQ(makeGuess(level, q.instrument.id))
        }}
        onChange={onExit}
      />
    )
  }

  const state = (i: number): string =>
    picked === null ? '' : i === q.answer ? 'correct' : i === picked ? 'wrong' : 'dim'
  const ok = picked === q.answer
  const fam = q.instrument.family ? familyOf(q.instrument.family) : null

  return (
    <div className="g-stage mi">
      <TopBar
        index={run.index}
        total={run.total}
        current={run.current}
        points={run.points}
        onExit={() => (stopAll(), onExit())}
      />
      <AudioNotice />
      <div className="mi-board">
        <button className={`btn big mi-speaker ${playing ? 'on' : ''}`} onClick={listen}>
          🔊 Escuchar otra vez
        </button>
        <p className="mi-ask">¿Qué instrumento suena?</p>
      </div>

      <div className="mi-options">
        {q.options.map((ins, i) => (
          <button
            key={ins.id}
            className={`g-option mi-option ${state(i)}`}
            disabled={picked !== null}
            onClick={() => choose(i)}
          >
            <span className="g-letter">{LETTERS[i]}</span>
            <InstrumentIcon id={ins.id} size={3} />
            <span className="mi-name">{ins.name}</span>
          </button>
        ))}
      </div>

      <div className="mi-feedback">
        {picked === null ? (
          <p className="muted">Escuchen con atención el timbre</p>
        ) : (
          <>
            <p className={`mi-verdict ${ok ? 'ok' : 'bad'}`}>
              {ok ? '✅ ¡Sí!' : '❌ Era'} {q.instrument.name}
              <small>
                {fam ? `Familia: ${fam.name}` : 'Instrumento de teclado'}
                {q.instrument.cr ? ' · 🇨🇷 También se toca en Costa Rica' : ''}
              </small>
            </p>
            <button className="btn big" onClick={advance}>
              {run.index + 1 >= run.total ? 'Terminar' : 'Siguiente →'}
            </button>
          </>
        )}
      </div>
      <TeamScores players={players} run={run} />
    </div>
  )
}

// ---------------------------------------------------------------- Clasificar por familia

function ClassifyRound({
  set,
  count,
  players,
  onExit
}: {
  set: ClassifySet
  count: number
  players: Player[]
  onExit: () => void
}): React.JSX.Element {
  const run = useRun(players, 9999)
  const later = useLater()
  const [cards, setCards] = useState<Instrument[]>(() => classifyPool(set, count))
  const [placed, setPlaced] = useState<Record<string, Family>>({})
  const [selected, setSelected] = useState<string | null>(null)
  const [wrong, setWrong] = useState<{ id: string; family: Family } | null>(null)
  const [mistakes, setMistakes] = useState(0)
  const [over, setOver] = useState(false)

  const families = FAMILIES.filter((f) => cards.some((c) => c.family === f.id))
  const waiting = cards.filter((c) => !placed[c.id])

  const hear = (ins: Instrument): void => {
    stopAll()
    if (ins.sound) playInstrument(ins.sound, 0)
  }

  const drop = (family: Family, id = selected): void => {
    const ins = cards.find((c) => c.id === id)
    if (!ins || placed[ins.id]) return
    if (ins.family === family) {
      const nextPlaced = { ...placed, [ins.id]: family }
      setPlaced(nextPlaced)
      setSelected(null)
      run.award(1)
      sfx.correct()
      run.next()
      if (cards.every((c) => nextPlaced[c.id])) {
        later(() => {
          setOver(true)
          sfx.win()
        }, 700)
      }
    } else {
      setMistakes((m) => m + 1)
      setWrong({ id: ins.id, family })
      sfx.wrong()
      run.next()
      later(() => setWrong(null), 700)
    }
  }

  useKeys((e) => {
    if (over) return
    const n = Number(e.key)
    if (selected && n >= 1 && n <= families.length) drop(families[n - 1].id)
  })

  const restart = (): void => {
    stopAll()
    run.restart()
    setCards(classifyPool(set, count))
    setPlaced({})
    setSelected(null)
    setMistakes(0)
    setOver(false)
  }

  if (over) {
    return (
      <EndScreen
        players={players}
        run={run}
        summary={
          mistakes === 0
            ? 'Todos en su familia, sin errores'
            : `${cards.length} instrumentos · ${mistakes} errores`
        }
        onAgain={restart}
        onChange={onExit}
      />
    )
  }

  return (
    <div className="g-stage mi">
      <TopBar
        index={Object.keys(placed).length - 1}
        total={cards.length}
        current={run.current}
        onExit={() => (stopAll(), onExit())}
      >
        {mistakes > 0 && <span className="g-badge">❌ {mistakes}</span>}
      </TopBar>
      <AudioNotice />

      <div
        className="mi-families"
        style={{ gridTemplateColumns: `repeat(${families.length}, 1fr)` }}
      >
        {families.map((f, i) => {
          const inside = cards.filter((c) => placed[c.id] === f.id)
          return (
            <div
              key={f.id}
              role="button"
              tabIndex={0}
              aria-label={`Familia ${f.name}`}
              className={`mi-family ${selected ? 'ready' : ''} ${wrong?.family === f.id ? 'bad' : ''}`}
              style={{ '--fam': f.color } as React.CSSProperties}
              onClick={() => selected && drop(f.id)}
              onKeyDown={(e) => {
                if ((e.key === 'Enter' || e.key === ' ') && selected) {
                  e.preventDefault()
                  drop(f.id)
                }
              }}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault()
                drop(f.id, e.dataTransfer.getData('text/plain'))
              }}
            >
              <div className="mi-family-head">
                <InstrumentIcon id={f.icon} size={1.8} />
                <span>{f.name}</span>
                <kbd className="mi-key">{i + 1}</kbd>
              </div>
              <div className="mi-family-body">
                {inside.map((c) => (
                  <span key={c.id} className="mi-chip">
                    <InstrumentIcon id={c.id} size={1.5} /> {c.name}
                  </span>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      <p className="mi-hint">
        {selected
          ? `Toca la familia de «${cards.find((c) => c.id === selected)?.name}»`
          : 'Elige un instrumento y luego su familia (o arrástralo)'}
      </p>

      <div className="mi-pool">
        {waiting.map((c) => (
          <div
            key={c.id}
            className={`mi-card ${selected === c.id ? 'selected' : ''} ${wrong?.id === c.id ? 'shake' : ''}`}
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData('text/plain', c.id)
              setSelected(c.id)
            }}
          >
            <button
              className="mi-card-main"
              aria-pressed={selected === c.id}
              onClick={() => {
                setSelected(selected === c.id ? null : c.id)
                hear(c)
              }}
            >
              <InstrumentIcon id={c.id} size={2.6} />
              <span className="mi-name">
                {c.name} {c.cr ? <span title="Costa Rica">🇨🇷</span> : null}
              </span>
            </button>
          </div>
        ))}
      </div>
      <TeamScores players={players} run={run} />
    </div>
  )
}
