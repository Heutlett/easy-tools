import './style.css'
import { useEffect, useState } from 'react'
import PlayerSetup from '../../components/games/PlayerSetup'
import type { Player } from '../../lib/games/players'
import { sfx } from '../../lib/games/sfx'
import { usePersistentState } from '../../lib/usePersistentState'
import { LETTERS, useKeys, useLater, useRun, useStopAudioOnLeave } from '../_musica/hooks'
import InstrumentIcon from '../_musica/icons'
import { playSong, songEvents, type SongMode } from '../_musica/songs'
import { INSTRUMENT_INFO, stopAll, type InstrumentId } from '../_musica/synth'
import { AudioNotice, EndScreen, PillRow, TeamScores, TopBar } from '../_musica/ui'
import { CLUES, makeQuestion, poolOf, type Clues, type Question, type Repertoire } from './data'

interface Settings {
  mode: SongMode
  clues: Clues
  repertoire: Repertoire
  inst: InstrumentId
  count: number
}

const DEFAULTS: Settings = {
  mode: 'melody',
  clues: 'many',
  repertoire: 'kids',
  inst: 'piano',
  count: 8
}
const TIMBRES: InstrumentId[] = ['piano', 'flauta', 'marimba', 'guitarra']

type Phase = { name: 'setup' } | { name: 'players' } | { name: 'play'; players: Player[] }

export default function GuessMelody(): React.JSX.Element {
  const [saved, setSaved] = usePersistentState<Settings>('game:musica-melodia:settings', DEFAULTS)
  const settings = { ...DEFAULTS, ...saved }
  const [phase, setPhase] = useState<Phase>({ name: 'setup' })
  useStopAudioOnLeave()

  if (phase.name === 'setup') {
    const set = (patch: Partial<Settings>): void => setSaved({ ...settings, ...patch })
    return (
      <section className="panel mm-setup">
        <PillRow
          label="¿Cómo suena?"
          value={settings.mode}
          onChange={(mode) => set({ mode })}
          options={[
            { value: 'melody', label: '🎶 Melodía y ritmo' },
            { value: 'rhythm', label: '🥁 Solo el ritmo', hint: 'sin notas' },
            { value: 'even', label: '🎵 Sin el ritmo', hint: 'notas parejas' }
          ]}
        />
        <PillRow
          label="Pistas"
          value={settings.clues}
          onChange={(clues) => set({ clues })}
          options={CLUES.map((c) => ({ value: c.id, label: c.label, hint: c.hint || undefined }))}
        />
        <PillRow
          label="Canciones"
          value={settings.repertoire}
          onChange={(repertoire) => set({ repertoire })}
          options={[
            { value: 'kids', label: '🧒 Infantiles', hint: `${poolOf('kids').length} canciones` },
            {
              value: 'all',
              label: '🎻 Y también clásicas',
              hint: `${poolOf('all').length} canciones`
            }
          ]}
        />
        {settings.mode !== 'rhythm' && (
          <div className="mus-pillrow">
            <span className="panel-title">Instrumento</span>
            <div className="pills" role="group" aria-label="Instrumento">
              {TIMBRES.map((id) => (
                <button
                  key={id}
                  className={`pill ${settings.inst === id ? 'selected' : ''}`}
                  aria-pressed={settings.inst === id}
                  onClick={() => set({ inst: id })}
                >
                  <InstrumentIcon id={id} size={1.3} /> {INSTRUMENT_INFO[id].name}
                </button>
              ))}
            </div>
          </div>
        )}
        <PillRow
          label="Canciones por partida"
          value={settings.count}
          onChange={(count) => set({ count })}
          options={[5, 8, 10, 15].map((n) => ({ value: n, label: String(n) }))}
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

  return (
    <Round settings={settings} players={phase.players} onExit={() => setPhase({ name: 'setup' })} />
  )
}

const EXTRA = 3

function Round({
  settings,
  players,
  onExit
}: {
  settings: Settings
  players: Player[]
  onExit: () => void
}): React.JSX.Element {
  const run = useRun(players, settings.count)
  const later = useLater()
  const pool = poolOf(settings.repertoire)
  const make = (avoid?: string): Question =>
    makeQuestion(pool, settings.clues, settings.mode, avoid)
  const [q, setQ] = useState<Question>(() => make())
  const [picked, setPicked] = useState<number | null>(null)
  const [extra, setExtra] = useState(0)
  const [playing, setPlaying] = useState(false)
  const total = songEvents(q.song).length
  const noteCount = Math.min(total, q.count + extra * EXTRA)

  const listen = (count = noteCount, mode: SongMode = settings.mode): void => {
    stopAll()
    const { duration } = playSong(q.song, { inst: settings.inst, count, mode, after: 0.1 })
    setPlaying(true)
    later(() => setPlaying(false), 150 + duration * 1000)
  }

  // La melodía suena sola al empezar cada pregunta
  useEffect(() => {
    if (run.finished) return
    const t = window.setTimeout(() => {
      stopAll()
      const { duration } = playSong(q.song, {
        inst: settings.inst,
        count: q.count,
        mode: settings.mode,
        after: 0.05
      })
      setPlaying(true)
      window.setTimeout(() => setPlaying(false), 100 + duration * 1000)
    }, 450)
    return () => window.clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, run.finished])

  const worth = Math.max(1, 3 - extra)

  const choose = (i: number): void => {
    if (picked !== null || run.finished) return
    setPicked(i)
    if (i === q.answer) {
      run.award(worth)
      sfx.correct()
    } else sfx.wrong()
    // Al revelar suena la primera frase completa, como era
    later(() => listen(Math.min(total, q.song.phrase + 3), 'melody'), 900)
  }

  const advance = (): void => {
    stopAll()
    if (run.index + 1 >= run.total) {
      run.next()
      return
    }
    run.next()
    setPicked(null)
    setExtra(0)
    setQ(make(q.song.id))
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
        summary={`${run.right} de ${run.total} canciones adivinadas`}
        onAgain={() => {
          run.restart()
          setPicked(null)
          setExtra(0)
          setQ(make(q.song.id))
        }}
        onChange={onExit}
      />
    )
  }

  const state = (i: number): string =>
    picked === null ? '' : i === q.answer ? 'correct' : i === picked ? 'wrong' : 'dim'
  const ok = picked === q.answer
  const modeText =
    settings.mode === 'melody'
      ? 'la melodía'
      : settings.mode === 'rhythm'
        ? 'solo el ritmo'
        : 'las notas sin el ritmo'

  return (
    <div className="g-stage mm">
      <TopBar
        index={run.index}
        total={run.total}
        current={run.current}
        points={run.points}
        onExit={() => (stopAll(), onExit())}
      />
      <AudioNotice />

      <div className="mm-board">
        <div className={`mm-bars ${playing ? 'on' : ''}`} aria-hidden>
          {Array.from({ length: 9 }, (_, i) => (
            <span key={i} style={{ animationDelay: `${(i % 5) * 0.11}s` }} />
          ))}
        </div>
        <p className="mm-ask">¿Qué canción es?</p>
        <p className="muted mm-mode">
          Escuchen {modeText} · {noteCount} {noteCount === 1 ? 'nota' : 'notas'}
        </p>
        <div className="row mm-actions">
          <button className="btn big" onClick={() => listen()}>
            🔊 Escuchar otra vez
          </button>
          <button
            className="btn secondary"
            disabled={picked !== null || noteCount >= total}
            onClick={() => {
              const next = extra + 1
              setExtra(next)
              listen(Math.min(total, q.count + next * EXTRA))
            }}
          >
            ➕ Más notas
          </button>
        </div>
      </div>

      <div className="g-options">
        {q.options.map((s, i) => (
          <button
            key={s.id}
            className={`g-option mm-option ${state(i)}`}
            disabled={picked !== null}
            onClick={() => choose(i)}
          >
            <span className="g-letter">{LETTERS[i]}</span>
            <span className="mm-emoji" aria-hidden>
              {s.emoji}
            </span>
            {s.title}
          </button>
        ))}
      </div>

      <div className="mm-feedback">
        {picked === null ? (
          <p className="muted">
            Vale {worth} {worth === 1 ? 'punto' : 'puntos'}
            {extra > 0 ? ' (con pistas extra)' : ''}
          </p>
        ) : (
          <>
            <p className={`mm-verdict ${ok ? 'ok' : 'bad'}`}>
              {ok
                ? `✅ ¡Sí! ${q.song.emoji} ${q.song.title}`
                : `❌ Era ${q.song.emoji} ${q.song.title}`}
              <small>{q.song.credit}</small>
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
