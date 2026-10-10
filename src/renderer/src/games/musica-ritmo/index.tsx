import './style.css'
import { useCallback, useEffect, useRef, useState } from 'react'
import PlayerSetup from '../../components/games/PlayerSetup'
import type { Player } from '../../lib/games/players'
import { sfx } from '../../lib/games/sfx'
import { usePersistentState } from '../../lib/usePersistentState'
import { FIGURES, beatsText, patternBeats, patternOnsets, type Pattern } from '../_musica/figures'
import { FigureGlyph, RhythmStaff } from '../_musica/FigureViews'
import { LETTERS, useKeys, useRun, useStopAudioOnLeave } from '../_musica/hooks'
import { hit, secondsUntil, stopAll } from '../_musica/synth'
import { AudioNotice, EndScreen, PillRow, TeamScores, TopBar } from '../_musica/ui'
import {
  FIGURE_LEVELS,
  RHYTHM_LEVELS,
  evaluate,
  makeFigureQuestion,
  makePattern,
  type Evaluation,
  type FigureLevel,
  type FigureQuestion,
  type RhythmLevel
} from './data'

interface Settings {
  mode: 'eco' | 'figuras'
  level: number
  count: number
  slow: boolean
}

const DEFAULTS: Settings = { mode: 'eco', level: 1, count: 5, slow: false }

type Phase = { name: 'setup' } | { name: 'players' } | { name: 'play'; players: Player[] }

export default function RhythmEcho(): React.JSX.Element {
  const [saved, setSettings] = usePersistentState<Settings>('game:musica-ritmo:settings', DEFAULTS)
  const settings = { ...DEFAULTS, ...saved }
  const [phase, setPhase] = useState<Phase>({ name: 'setup' })
  useStopAudioOnLeave()

  if (phase.name === 'setup') {
    const set = (patch: Partial<Settings>): void => setSettings({ ...settings, ...patch })
    const levels = settings.mode === 'eco' ? RHYTHM_LEVELS : FIGURE_LEVELS
    const level = Math.min(settings.level, levels.length)
    return (
      <section className="panel mr-setup">
        <PillRow
          label="¿Qué hacemos?"
          value={settings.mode}
          onChange={(mode) => set({ mode, level: 1, count: mode === 'eco' ? 5 : 10 })}
          options={[
            { value: 'eco', label: '🥁 Eco rítmico' },
            { value: 'figuras', label: '🎼 ¿Qué figura es?' }
          ]}
        />
        <PillRow
          label="Nivel"
          value={level}
          onChange={(l) => set({ level: l })}
          options={levels.map((l) => ({
            value: l.id,
            label: `${l.id}. ${l.name}`,
            hint: l.grades
          }))}
        />
        {settings.mode === 'eco' && (
          <PillRow
            label="Velocidad"
            value={settings.slow ? 'slow' : 'normal'}
            onChange={(v) => set({ slow: v === 'slow' })}
            options={[
              { value: 'slow', label: '🐢 Lenta' },
              { value: 'normal', label: '🚶 Normal' }
            ]}
          />
        )}
        <PillRow
          label={settings.mode === 'eco' ? 'Ritmos' : 'Preguntas'}
          value={settings.count}
          onChange={(count) => set({ count })}
          options={(settings.mode === 'eco' ? [3, 5, 8, 10] : [5, 10, 15, 20]).map((n) => ({
            value: n,
            label: String(n)
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
  const level = Math.min(
    settings.level,
    (settings.mode === 'eco' ? RHYTHM_LEVELS : FIGURE_LEVELS).length
  )
  return settings.mode === 'eco' ? (
    <EchoRound
      level={RHYTHM_LEVELS[level - 1]}
      slow={settings.slow}
      count={settings.count}
      players={phase.players}
      onExit={onExit}
    />
  ) : (
    <FigureRound
      level={FIGURE_LEVELS[level - 1]}
      count={settings.count}
      players={phase.players}
      onExit={onExit}
    />
  )
}

// ---------------------------------------------------------------- Eco rítmico

/** Reloj de la página (los golpes del teclado y del mouse usan la misma hora) */
const nowMs = (): number => performance.now()

type EchoPhase = 'idle' | 'listen' | 'count' | 'tap' | 'result'

interface Timeline {
  kind: 'listen' | 'tap'
  countStart: number
  t0: number
  beatMs: number
  end: number
  perBar: number
  taps: number[]
}

function EchoRound({
  level,
  slow,
  count,
  players,
  onExit
}: {
  level: RhythmLevel
  slow: boolean
  count: number
  players: Player[]
  onExit: () => void
}): React.JSX.Element {
  const run = useRun(players, count)
  const [pattern, setPattern] = useState<Pattern>(() => makePattern(level))
  const [phase, setPhase] = useState<EchoPhase>('idle')
  const [heard, setHeard] = useState(false)
  const [cursor, setCursor] = useState<number | null>(null)
  const [beatNum, setBeatNum] = useState<number | null>(null)
  const [counting, setCounting] = useState(false)
  const [result, setResult] = useState<Evaluation | null>(null)
  const timeline = useRef<Timeline | null>(null)
  const raf = useRef(0)
  const attempts = useRef(0)
  const phaseRef = useRef<EchoPhase>('idle')
  const bpm = Math.round(level.bpm * (slow ? 0.75 : 1))
  const perBar = level.timeSig[0]

  const setPhaseBoth = (p: EchoPhase): void => {
    phaseRef.current = p
    setPhase(p)
  }

  const cancel = useCallback((): void => {
    cancelAnimationFrame(raf.current)
    timeline.current = null
    stopAll()
  }, [])

  const begin = (kind: 'listen' | 'tap'): void => {
    cancel()
    const beatMs = 60000 / bpm
    const now = nowMs()
    const countStart = now + 400
    const t0 = countStart + perBar * beatMs
    const beats = patternBeats(pattern)
    const tail = kind === 'tap' ? 0.9 : 0.3
    const tl: Timeline = {
      kind,
      countStart,
      t0,
      beatMs,
      end: t0 + (beats + tail) * beatMs,
      perBar,
      taps: []
    }
    timeline.current = tl
    for (let b = 0; b < perBar; b++)
      hit('metronomo', secondsUntil(countStart + b * beatMs), 0.9, b === 0)
    for (let b = 0; b < beats; b++)
      hit(
        'metronomo',
        secondsUntil(t0 + b * beatMs),
        kind === 'listen' ? 0.45 : 0.6,
        b % perBar === 0
      )
    if (kind === 'listen')
      for (const o of patternOnsets(pattern))
        hit('claves', secondsUntil(t0 + o.beat * beatMs), 0.95)
    setResult(null)
    setCounting(true)
    setPhaseBoth(kind === 'listen' ? 'listen' : 'count')

    const tick = (): void => {
      const cur = timeline.current
      if (!cur) return
      const t = nowMs()
      if (t < cur.t0) {
        setCursor(null)
        setCounting(true)
        setBeatNum(t < cur.countStart ? null : Math.floor((t - cur.countStart) / cur.beatMs) + 1)
      } else {
        setCounting(false)
        const beat = (t - cur.t0) / cur.beatMs
        setCursor(beat <= beats ? beat : null)
        setBeatNum((Math.floor(beat) % cur.perBar) + 1)
        if (cur.kind === 'tap' && phaseRef.current === 'count') setPhaseBoth('tap')
      }
      if (t >= cur.end) {
        timeline.current = null
        setCursor(null)
        setBeatNum(null)
        if (cur.kind === 'listen') {
          setHeard(true)
          setPhaseBoth('idle')
        } else finishTap(cur)
        return
      }
      raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)
  }

  const finishTap = (cur: Timeline): void => {
    const ev = evaluate(
      patternOnsets(pattern).map((o) => o.beat),
      cur.taps
    )
    setResult(ev)
    setPhaseBoth('result')
    attempts.current += 1
    if (attempts.current === 1) run.award(ev.stars)
    if (ev.stars >= 2) sfx.correct()
    else if (ev.stars === 0) sfx.wrong()
  }

  const tap = (ts: number): void => {
    const cur = timeline.current
    hit('tambor', 0, 0.9)
    if (!cur || cur.kind !== 'tap' || phaseRef.current === 'result') return
    const beat = (ts - cur.t0) / cur.beatMs
    if (beat < -0.45) return // golpes durante la cuenta
    cur.taps.push(beat)
  }

  // Cada ritmo nuevo suena solo al empezar
  useEffect(() => {
    if (run.finished) return
    const t = window.setTimeout(() => begin('listen'), 500)
    return () => {
      window.clearTimeout(t)
      cancel()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pattern, run.finished])

  const resetRound = (): void => {
    attempts.current = 0
    setHeard(false)
    setResult(null)
    setPhaseBoth('idle')
  }

  const next = (): void => {
    cancel()
    if (run.index + 1 >= run.total) {
      run.next()
      return
    }
    run.next()
    resetRound()
    setPattern(makePattern(level, pattern))
  }

  useKeys((e) => {
    if (run.finished) return
    const tag = e.target instanceof HTMLElement ? e.target.tagName : 'BODY'
    if (e.key === ' ' || e.code === 'Space') {
      if (phaseRef.current === 'tap' || phaseRef.current === 'count') {
        e.preventDefault()
        if (!e.repeat) tap(e.timeStamp)
      } else if (tag === 'BODY') {
        e.preventDefault()
        if (!e.repeat && phaseRef.current === 'idle' && heard) begin('tap')
        else if (!e.repeat && phaseRef.current === 'result') tap(e.timeStamp)
      }
    } else if (e.key === 'Enter' && tag === 'BODY') {
      e.preventDefault()
      if (phaseRef.current === 'idle') begin(heard ? 'tap' : 'listen')
      else if (phaseRef.current === 'result') next()
    }
  })

  if (run.finished) {
    return (
      <EndScreen
        players={players}
        run={run}
        summary={`${run.points} estrellas de ${run.total * 3}`}
        onAgain={() => {
          run.restart()
          resetRound()
          setPattern(makePattern(level, pattern))
        }}
        onChange={onExit}
      />
    )
  }

  const busy = phase === 'listen' || phase === 'count' || phase === 'tap'
  const stars = result?.stars ?? 0
  const missing = result ? result.marks.filter((m) => m === 'miss').length : 0
  const message = result
    ? ['¡Inténtalo otra vez!', '¡Bien, casi!', '¡Muy bien!', '¡Perfecto!'][stars]
    : ''

  return (
    <div className="g-stage mr">
      <TopBar
        index={run.index}
        total={run.total}
        current={run.current}
        points={run.points}
        onExit={() => (cancel(), onExit())}
      >
        <span className="g-badge">♩ = {bpm}</span>
      </TopBar>
      <AudioNotice />

      <div
        className="mr-board"
        data-onsets={JSON.stringify(patternOnsets(pattern).map((o) => o.beat))}
        data-phase={phase}
      >
        <RhythmStaff
          pattern={pattern}
          timeSig={level.timeSig}
          cursor={cursor}
          marks={result?.marks}
        />
        <div className="mr-beats" aria-hidden>
          {Array.from({ length: perBar }, (_, i) => (
            <span
              key={i}
              className={`mr-dot ${beatNum === i + 1 ? 'on' : ''} ${counting ? 'count' : ''}`}
            >
              {i + 1}
            </span>
          ))}
        </div>
        <p className="mr-status" aria-live="polite">
          {phase === 'listen' && (counting ? 'Prepárense…' : '👂 Escuchen el ritmo')}
          {phase === 'count' && 'Prepárense…'}
          {phase === 'tap' && '🥁 ¡Ahora ustedes!'}
          {phase === 'idle' && (heard ? 'Ahora lo repetimos' : '…')}
          {phase === 'result' && (
            <span className="mr-stars">
              {'⭐'.repeat(stars)}
              <span className="mr-stars-off">{'⭐'.repeat(3 - stars)}</span> {message}
            </span>
          )}
        </p>
        {phase === 'result' && result && (
          <p className="muted mr-detail">
            {missing > 0 &&
              `Faltó${missing === 1 ? '' : 'n'} ${missing} sonido${missing === 1 ? '' : 's'}. `}
            {result.extra > 0 &&
              `Sobró${result.extra === 1 ? '' : 'n'} ${result.extra} golpe${result.extra === 1 ? '' : 's'}. `}
            <span className="mr-key ok">verde: justo</span>{' '}
            <span className="mr-key near">naranja: casi</span>{' '}
            <span className="mr-key miss">rojo: faltó</span>
          </p>
        )}
      </div>

      <button
        className={`mr-pad ${phase === 'tap' ? 'live' : ''}`}
        onPointerDown={(e) => {
          e.preventDefault()
          tap(e.timeStamp)
        }}
        onKeyDown={(e) => e.key === ' ' && e.preventDefault()}
        aria-label="Tambor: tocar aquí o con la barra espaciadora"
      >
        <span className="mr-pad-icon">🥁</span>
        <span>Toca aquí o pulsa la barra espaciadora</span>
      </button>

      <div className="row mr-actions">
        {phase === 'result' ? (
          <>
            <button className="btn secondary" onClick={() => begin('listen')}>
              🔊 Escuchar
            </button>
            <button className="btn secondary" onClick={() => begin('tap')}>
              ↺ Intentar otra vez
            </button>
            <button className="btn big" onClick={next}>
              {run.index + 1 >= run.total ? 'Terminar' : 'Siguiente →'}
            </button>
          </>
        ) : (
          <>
            <button className="btn secondary" disabled={busy} onClick={() => begin('listen')}>
              🔊 Escuchar {heard ? 'otra vez' : ''}
            </button>
            <button className="btn big" disabled={busy || !heard} onClick={() => begin('tap')}>
              🥁 ¡Mi turno!
            </button>
          </>
        )}
      </div>

      <TeamScores players={players} run={run} />
    </div>
  )
}

// ---------------------------------------------------------------- ¿Qué figura es?

function FigureRound({
  level,
  count,
  players,
  onExit
}: {
  level: FigureLevel
  count: number
  players: Player[]
  onExit: () => void
}): React.JSX.Element {
  const run = useRun(players, count)
  const [q, setQ] = useState<FigureQuestion>(() => makeFigureQuestion(level))
  const [picked, setPicked] = useState<number | null>(null)

  const choose = (i: number): void => {
    if (picked !== null || run.finished) return
    setPicked(i)
    if (i === q.answer) {
      run.award(1)
      sfx.correct()
    } else sfx.wrong()
  }
  const advance = (): void => {
    if (run.index + 1 >= run.total) {
      run.next()
      return
    }
    run.next()
    setPicked(null)
    setQ(makeFigureQuestion(level, q.figure))
  }

  useKeys((e) => {
    if (run.finished) return
    const tag = e.target instanceof HTMLElement ? e.target.tagName : 'BODY'
    const n = Number(e.key)
    const letter = LETTERS.indexOf(e.key.toUpperCase())
    if (picked === null) {
      if (n >= 1 && n <= 4) choose(n - 1)
      else if (letter >= 0 && letter < 4) choose(letter)
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
        summary={`${run.right} de ${run.total} figuras`}
        onAgain={() => {
          run.restart()
          setPicked(null)
          setQ(makeFigureQuestion(level))
        }}
        onChange={onExit}
      />
    )
  }

  const fig = FIGURES[q.figure]
  const state = (i: number): string =>
    picked === null ? '' : i === q.answer ? 'correct' : i === picked ? 'wrong' : 'dim'
  const ok = picked === q.answer

  return (
    <div className="g-stage mr">
      <TopBar
        index={run.index}
        total={run.total}
        current={run.current}
        points={run.points}
        onExit={onExit}
      />
      <div className="mr-question">
        {q.kind === 'draw' ? (
          <p className="mr-ask">¿Cuál es la figura «{fig.name}»?</p>
        ) : (
          <>
            <div className="mr-figure-big">
              <FigureGlyph id={q.figure} />
            </div>
            <p className="mr-ask">
              {q.kind === 'name' ? '¿Qué figura es?' : '¿Cuánto dura? (la negra vale 1 tiempo)'}
            </p>
          </>
        )}
      </div>

      {q.kind === 'draw' ? (
        <div className="mr-cards">
          {q.options.map((id, i) => (
            <button
              key={id}
              className={`g-option mr-card ${state(i)}`}
              disabled={picked !== null}
              onClick={() => choose(i)}
              aria-label={`Opción ${LETTERS[i]}`}
            >
              <span className="g-letter">{LETTERS[i]}</span>
              <FigureGlyph id={id} />
            </button>
          ))}
        </div>
      ) : (
        <div className="g-options">
          {q.options.map((name, i) => (
            <button
              key={name}
              className={`g-option mr-name ${state(i)}`}
              disabled={picked !== null}
              onClick={() => choose(i)}
            >
              <span className="g-letter">{LETTERS[i]}</span>
              {name}
            </button>
          ))}
        </div>
      )}

      <div className="mr-feedback">
        {picked === null ? (
          <p className="muted">Elige la respuesta</p>
        ) : (
          <>
            <p className={`mr-verdict ${ok ? 'ok' : 'bad'}`}>
              {ok ? '✅ ¡Correcto! ' : '❌ Era '}
              {fig.name}: {beatsText(fig.beats)}
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
