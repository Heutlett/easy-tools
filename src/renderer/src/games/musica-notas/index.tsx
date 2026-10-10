import './style.css'
import { useEffect, useState } from 'react'
import PlayerSetup from '../../components/games/PlayerSetup'
import type { Player } from '../../lib/games/players'
import { sfx } from '../../lib/games/sfx'
import { usePersistentState } from '../../lib/usePersistentState'
import { freqOf, pitchName, type Pitch } from '../_musica/notes'
import Staff from '../_musica/Staff'
import { playNote, stopAll } from '../_musica/synth'
import { LETTERS, useKeys, useLater, useRun, useStopAudioOnLeave } from '../_musica/hooks'
import { AudioNotice, EndScreen, PillRow, TeamScores, TopBar } from '../_musica/ui'
import { LEVELS, listenQuestion, readQuestion, type Level, type Question } from './data'

interface Settings {
  mode: 'read' | 'listen'
  level: number
  count: number
  seven: boolean
}

const DEFAULTS: Settings = { mode: 'read', level: 1, count: 10, seven: false }

type Phase = { name: 'setup' } | { name: 'players' } | { name: 'play'; players: Player[] }

export default function ReadNotes(): React.JSX.Element {
  const [settings, setSettings] = usePersistentState<Settings>(
    'game:musica-notas:settings',
    DEFAULTS
  )
  const [phase, setPhase] = useState<Phase>({ name: 'setup' })
  const level = LEVELS.find((l) => l.id === settings.level) ?? LEVELS[0]
  useStopAudioOnLeave()

  if (phase.name === 'setup') {
    const set = (patch: Partial<Settings>): void =>
      setSettings({ ...DEFAULTS, ...settings, ...patch })
    return (
      <section className="panel mn-setup">
        <PillRow
          label="¿Qué hacemos?"
          value={settings.mode}
          onChange={(mode) => set({ mode })}
          options={[
            { value: 'read', label: '👀 Lee la nota' },
            { value: 'listen', label: '👂 Escucha y escribe' }
          ]}
        />
        <PillRow
          label="Nivel"
          value={settings.level}
          onChange={(l) => set({ level: l })}
          options={LEVELS.map((l) => ({
            value: l.id,
            label: `${l.id}. ${l.name}`,
            hint: l.grades
          }))}
        />
        <p className="mn-range">
          {level.clef === 'fa' ? '𝄢 Clave de fa' : '𝄞 Clave de sol'} · {level.range}
        </p>
        {settings.mode === 'read' && !level.accidentals && (
          <PillRow
            label="Respuestas"
            value={settings.seven ? 'seven' : 'four'}
            onChange={(v) => set({ seven: v === 'seven' })}
            options={[
              { value: 'four', label: '4 opciones' },
              { value: 'seven', label: 'Las 7 notas' }
            ]}
          />
        )}
        <PillRow
          label="Preguntas"
          value={settings.count}
          onChange={(count) => set({ count })}
          options={[5, 10, 15, 20].map((n) => ({ value: n, label: String(n) }))}
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
    <Round
      settings={settings}
      level={level}
      players={phase.players}
      onExit={() => setPhase({ name: 'setup' })}
    />
  )
}

function Round({
  settings,
  level,
  players,
  onExit
}: {
  settings: Settings
  level: Level
  players: Player[]
  onExit: () => void
}): React.JSX.Element {
  const run = useRun(players, settings.count)
  const later = useLater()
  const make = (avoid?: Pitch): Question =>
    settings.mode === 'read'
      ? readQuestion(level, settings.seven, avoid)
      : listenQuestion(level, avoid)
  const [q, setQ] = useState<Question>(() => make())
  const [picked, setPicked] = useState<number | null>(null)

  const hear = (pitch: Pitch = q.pitch, after = 0): void => {
    stopAll()
    playNote('piano', freqOf(pitch), { after: after + 0.02, dur: 1.6, vol: 0.8 })
  }

  // En «Escucha y escribe» la nota suena sola al empezar cada pregunta
  useEffect(() => {
    if (settings.mode !== 'listen' || run.finished) return
    const t = window.setTimeout(() => hear(q.pitch), 350)
    return () => window.clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, run.finished])

  const choose = (i: number): void => {
    if (picked !== null || run.finished) return
    setPicked(i)
    if (i === q.answer) {
      run.award(1)
      hear(q.pitch)
      later(sfx.correct, 700)
    } else {
      sfx.wrong()
      hear(q.pitch, 0.55)
    }
  }

  const advance = (): void => {
    if (run.index + 1 >= run.total) {
      stopAll()
      run.next()
      return
    }
    run.next()
    setPicked(null)
    setQ(make(q.pitch))
  }

  const options = q.kind === 'read' ? q.options : q.options.map(pitchName)

  useKeys((e) => {
    if (run.finished) return
    const tag = e.target instanceof HTMLElement ? e.target.tagName : 'BODY'
    const n = Number(e.key)
    const letter = LETTERS.indexOf(e.key.toUpperCase())
    if (picked === null) {
      if (n >= 1 && n <= options.length) choose(n - 1)
      else if (q.kind === 'read' && options.length === 4 && letter >= 0 && letter < 4)
        choose(letter)
      else if (q.kind === 'listen' && (e.key === ' ' || e.key === 'Enter') && tag === 'BODY') {
        e.preventDefault()
        hear()
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
        summary={`${run.right} de ${run.total} notas`}
        onAgain={() => {
          run.restart()
          setPicked(null)
          setQ(make())
        }}
        onChange={onExit}
      />
    )
  }

  const ok = picked !== null && picked === q.answer
  const answerName = pitchName(q.pitch)

  return (
    <div className="g-stage mn">
      <TopBar
        index={run.index}
        total={run.total}
        current={run.current}
        points={run.points}
        onExit={() => (stopAll(), onExit())}
      />
      <AudioNotice />

      {q.kind === 'read' ? (
        <div className="mn-board">
          <Staff
            clef={level.clef}
            minNotes={3}
            showLabels={picked !== null}
            notes={[
              {
                pitch: q.pitch,
                mark: picked === null ? undefined : ok ? 'ok' : 'bad',
                label: answerName
              }
            ]}
          />
        </div>
      ) : (
        <div className="mn-board mn-listen">
          <button className="btn big mn-speaker" onClick={() => hear()}>
            🔊 Escuchar otra vez
          </button>
          <p className="muted">¿Cuál de estas notas suena?</p>
        </div>
      )}

      {q.kind === 'read' && options.length === 7 ? (
        <div className="mn-seven">
          {options.map((name, i) => {
            const state =
              picked === null ? '' : i === q.answer ? 'correct' : i === picked ? 'wrong' : 'dim'
            return (
              <button
                key={name}
                className={`g-option mn-note-btn ${state}`}
                disabled={picked !== null}
                onClick={() => choose(i)}
              >
                {name}
              </button>
            )
          })}
        </div>
      ) : q.kind === 'read' ? (
        <div className="g-options">
          {options.map((name, i) => {
            const state =
              picked === null ? '' : i === q.answer ? 'correct' : i === picked ? 'wrong' : 'dim'
            return (
              <button
                key={name}
                className={`g-option mn-name ${state}`}
                disabled={picked !== null}
                onClick={() => choose(i)}
              >
                <span className="g-letter">{LETTERS[i]}</span>
                {name}
              </button>
            )
          })}
        </div>
      ) : (
        <div className="mn-cards">
          {q.options.map((p, i) => {
            const state =
              picked === null ? '' : i === q.answer ? 'correct' : i === picked ? 'wrong' : 'dim'
            return (
              <button
                key={`${p.step}-${p.alter}`}
                className={`g-option mn-card ${state}`}
                disabled={picked !== null}
                onClick={() => choose(i)}
                aria-label={`Opción ${LETTERS[i]}`}
              >
                <span className="g-letter">{LETTERS[i]}</span>
                <Staff
                  clef={level.clef}
                  notes={[{ pitch: p, label: pitchName(p) }]}
                  showLabels={picked !== null}
                  minNotes={2}
                />
              </button>
            )
          })}
        </div>
      )}

      <div className="mn-feedback">
        {picked === null ? (
          <p className="muted">
            {q.kind === 'read' ? '¿Cómo se llama esta nota?' : 'Elige la nota que oíste'}
          </p>
        ) : (
          <>
            <p className={`mn-verdict ${ok ? 'ok' : 'bad'}`}>
              {ok ? `✅ ¡Correcto! Es ${answerName}` : `❌ Era ${answerName}`}
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
