import { useEffect, useMemo, useRef, useState } from 'react'
import './style.css'
import PlayerSetup from '../../components/games/PlayerSetup'
import Scoreboard from '../../components/games/Scoreboard'
import { useScores, type Player } from '../../lib/games/players'
import { sfx } from '../../lib/games/sfx'
import { shuffle } from '../../lib/games/shuffle'
import { usePersistentState } from '../../lib/usePersistentState'
import { BANDS, bandAllows, type BandId } from '../_adivinar/bands'
import { Chips, DeckGrid, SetupRow } from '../_adivinar/ui'
import { DECKS, parseCards, tabooOf, type Card } from './data'

type Mode = 'mimica' | 'dibujo' | 'sin-decir'

const MODES: { id: Mode; icon: string; title: string; hint: string; rule: string }[] = [
  {
    id: 'mimica',
    icon: '🤫',
    title: 'Mímica',
    hint: 'Actúa sin hablar',
    rule: 'Sin hablar: solo gestos'
  },
  {
    id: 'dibujo',
    icon: '✏️',
    title: 'Dibujo',
    hint: 'Dibuja en la pizarra',
    rule: 'Dibuja en la pizarra, sin letras ni números'
  },
  {
    id: 'sin-decir',
    icon: '🚫',
    title: 'Sin decir la palabra',
    hint: 'Descríbela con palabras',
    rule: 'Descríbela sin decir estas palabras'
  }
]

interface Config {
  mode: Mode
  seconds: number
  rounds: number
  cards: Card[]
}

type Phase =
  | { name: 'setup' }
  | { name: 'players'; config: Config }
  | { name: 'play'; config: Config; players: Player[] }

export default function Mimica(): React.JSX.Element {
  const [phase, setPhase] = useState<Phase>({ name: 'setup' })

  if (phase.name === 'setup')
    return <Setup onStart={(config) => setPhase({ name: 'players', config })} />

  if (phase.name === 'players')
    return (
      <PlayerSetup
        optional
        onStart={(players) => setPhase({ name: 'play', config: phase.config, players })}
      />
    )

  return (
    <Play
      config={phase.config}
      players={phase.players}
      onExit={() => setPhase({ name: 'setup' })}
    />
  )
}

function Setup({ onStart }: { onStart: (config: Config) => void }): React.JSX.Element {
  const [mode, setMode] = usePersistentState<Mode>('game:mimica:mode', 'mimica')
  const [band, setBand] = usePersistentState<BandId>('game:mimica:band', 'all')
  const [seconds, setSeconds] = usePersistentState('game:mimica:seconds', 60)
  const [rounds, setRounds] = usePersistentState('game:mimica:rounds', 2)
  const [selected, setSelected] = usePersistentState<string[]>(
    'game:mimica:decks',
    DECKS.map((d) => d.id)
  )
  const [custom, setCustom] = usePersistentState('game:mimica:custom', '')
  const [useCustom, setUseCustom] = usePersistentState('game:mimica:use-custom', false)
  const [editing, setEditing] = useState(false)

  const customCards = useMemo(() => parseCards(custom), [custom])
  const infos = DECKS.map((d) => ({
    id: d.id,
    title: d.title,
    icon: d.icon,
    count: d.cards.filter((c) => bandAllows(band, c.level)).length
  }))
  const pool = useMemo(
    () => [
      ...DECKS.filter((d) => selected.includes(d.id)).flatMap((d) =>
        d.cards.filter((c) => bandAllows(band, c.level))
      ),
      ...(useCustom ? customCards.filter((c) => bandAllows(band, c.level)) : [])
    ],
    [selected, band, useCustom, customCards]
  )

  return (
    <section className="panel ad-setup">
      <SetupRow label="Cómo se juega">
        <div className="mi-modes" role="group" aria-label="Modo de juego">
          {MODES.map((m) => (
            <button
              key={m.id}
              className={`mi-mode ${mode === m.id ? 'on' : ''}`}
              aria-pressed={mode === m.id}
              onClick={() => setMode(m.id)}
            >
              <span className="mi-mode-icon" aria-hidden>
                {m.icon}
              </span>
              <span className="mi-mode-title">{m.title}</span>
              <span className="mi-mode-hint">{m.hint}</span>
            </button>
          ))}
        </div>
      </SetupRow>

      <SetupRow label="Grado">
        <Chips
          label="Grado"
          value={band}
          onChange={setBand}
          options={BANDS.map((b) => ({ value: b.id, label: b.label }))}
        />
      </SetupRow>

      <SetupRow label="Mazos">
        <DeckGrid
          decks={infos}
          selected={selected}
          onChange={setSelected}
          custom={{
            count: customCards.length,
            selected: useCustom && customCards.length > 0,
            onToggle: () =>
              customCards.length === 0 ? setEditing(true) : setUseCustom(!useCustom),
            onEdit: () => setEditing(!editing)
          }}
        />
        {editing && (
          <div className="form-field">
            <span>Escribe tus palabras, una por línea</span>
            <textarea
              className="field ad-textarea"
              value={custom}
              aria-label="Palabras de mi mazo, una por línea"
              placeholder={'Volcán\nTío Conejo\nHacer una torta'}
              onChange={(e) => {
                setCustom(e.target.value)
                if (e.target.value.trim()) setUseCustom(true)
              }}
            />
            <p className="muted">
              Para «Sin decir la palabra» puedes agregar las prohibidas: palabra | 2 | prohibida,
              prohibida
            </p>
          </div>
        )}
      </SetupRow>

      <SetupRow label="Tiempo">
        <Chips
          label="Tiempo por turno"
          value={seconds}
          onChange={setSeconds}
          options={[30, 60, 90].map((s) => ({ value: s, label: `${s} s` }))}
        />
      </SetupRow>

      <SetupRow label="Rondas">
        <Chips
          label="Rondas"
          value={rounds}
          onChange={setRounds}
          options={[1, 2, 3, 4, 5].map((r) => ({ value: r, label: String(r) }))}
        />
      </SetupRow>

      <div className="mi-footer">
        <button
          className="btn big"
          disabled={pool.length < 3}
          onClick={() => onStart({ mode, seconds, rounds, cards: pool })}
        >
          Siguiente →
        </button>
        <span className="muted">
          {pool.length < 3 ? 'Elige al menos un mazo' : `${pool.length} palabras`}
        </span>
      </div>
    </section>
  )
}

type Stage = 'ready' | 'counting' | 'memorize' | 'play' | 'timeup' | 'end'

interface Result {
  text: string
  ok: boolean
}

const clock = (s: number): string =>
  `${Math.floor(s / 60)}:${String(Math.max(0, s) % 60).padStart(2, '0')}`

function Play({
  config,
  players,
  onExit
}: {
  config: Config
  players: Player[]
  onExit: () => void
}): React.JSX.Element {
  const modeInfo = MODES.find((m) => m.id === config.mode) ?? MODES[0]
  const [cards, setCards] = useState(() => shuffle(config.cards))
  const [drawn, setDrawn] = useState(0)
  const [turn, setTurn] = useState(0)
  const [stage, setStage] = useState<Stage>('ready')
  const [count, setCount] = useState(3)
  const [left, setLeft] = useState(config.seconds)
  const [paused, setPaused] = useState(false)
  const [peek, setPeek] = useState(false)
  const [results, setResults] = useState<Result[]>([])
  const [lateOk, setLateOk] = useState(false)
  const [hits, setHits] = useState(0)
  const { scores, add, reset, ranking, leaders } = useScores(players)

  const turns = config.rounds * Math.max(1, players.length)
  const player = players.length ? players[turn % players.length] : null
  const round = Math.floor(turn / Math.max(1, players.length)) + 1
  const card = cards[drawn % cards.length]
  const taboo = tabooOf(card)

  // Cuenta 3-2-1 antes de mostrar la palabra
  useEffect(() => {
    if (stage !== 'counting') return
    sfx.tick()
    const id = setTimeout(() => {
      if (count <= 1) {
        setStage('memorize')
        sfx.pop()
      } else setCount(count - 1)
    }, 1000)
    return () => clearTimeout(id)
  }, [stage, count])

  // Tiempo del turno (se lleva también en una referencia para saber cuándo llega a cero)
  const leftRef = useRef(config.seconds)
  useEffect(() => {
    if (stage !== 'play' || paused) return
    const id = setInterval(() => {
      const n = leftRef.current - 1
      leftRef.current = n
      setLeft(n)
      if (n <= 0) {
        sfx.timeUp()
        setStage('timeup')
        setLateOk(false)
        setPeek(false)
      } else if (n <= 5) sfx.tick()
    }, 1000)
    return () => clearInterval(id)
  }, [stage, paused])

  const show = (): void => {
    setCount(3)
    setStage('counting')
  }
  const start = (): void => {
    leftRef.current = config.seconds
    setLeft(config.seconds)
    setPaused(false)
    setPeek(false)
    setStage('play')
    sfx.pop()
  }
  const guessed = (): void => {
    if (paused) return
    sfx.correct()
    setResults((r) => [...r, { text: card.text, ok: true }])
    if (player) add(player.id, 1)
    setHits((h) => h + 1)
    setDrawn((d) => d + 1)
    setPeek(false)
  }
  const skip = (): void => {
    if (paused) return
    sfx.pop()
    setResults((r) => [...r, { text: card.text, ok: false }])
    setDrawn((d) => d + 1)
    setPeek(false)
  }
  const endTurn = (): void => {
    setStage('timeup')
    setLateOk(false)
    setPeek(false)
    setPaused(false)
  }
  const lateGuess = (): void => {
    if (lateOk) return
    sfx.correct()
    setLateOk(true)
    setResults((r) => [...r, { text: card.text, ok: true }])
    if (player) add(player.id, 1)
    setHits((h) => h + 1)
  }
  const nextTurn = (): void => {
    setDrawn((d) => d + 1)
    if (turn + 1 >= turns) {
      setStage('end')
      sfx.win()
      return
    }
    setTurn(turn + 1)
    setStage('ready')
    setResults([])
  }
  const restart = (): void => {
    reset()
    setHits(0)
    setTurn(0)
    setDrawn(0)
    setCards(shuffle(config.cards))
    setResults([])
    setStage('ready')
  }

  // Teclado: Espacio o Enter (si no hay un botón seleccionado) y la flecha derecha avanzan;
  // en el juego, Espacio = ¡Adivinaron!, flecha = Pasar, V (mantener) = ver, P = pausa
  useEffect(() => {
    const down = (e: KeyboardEvent): void => {
      const tag = e.target instanceof HTMLElement ? e.target.tagName : 'BODY'
      if (/^(INPUT|TEXTAREA|SELECT)$/.test(tag)) return
      const confirm = (e.key === ' ' || e.key === 'Enter') && tag === 'BODY'
      const arrow = e.key === 'ArrowRight' || e.key === 'PageDown'
      const key = e.key.toLowerCase()
      if (stage === 'ready' && (confirm || arrow)) {
        e.preventDefault()
        show()
      } else if (stage === 'memorize' && (confirm || arrow)) {
        e.preventDefault()
        start()
      } else if (stage === 'play') {
        if (confirm) {
          e.preventDefault()
          guessed()
        } else if (arrow) {
          e.preventDefault()
          skip()
        } else if (key === 'v' && !paused) setPeek(true)
        else if (key === 'p' && !e.repeat) setPaused((p) => !p)
      } else if (stage === 'timeup' && (confirm || arrow)) {
        e.preventDefault()
        nextTurn()
      }
    }
    const up = (e: KeyboardEvent): void => {
      if (e.key.toLowerCase() === 'v') setPeek(false)
    }
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    return () => {
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
    }
  })

  if (stage === 'end') {
    return (
      <div className="g-stage g-center">
        <p className="g-win">🎉 ¡Terminamos!</p>
        {players.length > 0 ? (
          <>
            <p className="mi-winner">
              {leaders.length === 1
                ? `Ganó ${leaders[0].emoji} ${leaders[0].name}`
                : leaders.length > 1
                  ? `Empate: ${leaders.map((l) => l.name).join(' y ')}`
                  : 'Nadie sumó puntos'}
            </p>
            <Scoreboard players={ranking} scores={scores} />
          </>
        ) : (
          <p className="mi-winner">
            La clase adivinó {hits} {hits === 1 ? 'palabra' : 'palabras'}
          </p>
        )}
        <div className="row start">
          <button className="btn big" onClick={restart}>
            Jugar otra vez
          </button>
          <button className="btn secondary" onClick={onExit}>
            Cambiar de mazos
          </button>
        </div>
      </div>
    )
  }

  const header = (
    <div className="mi-top">
      <span className="g-badge">
        {modeInfo.icon} {modeInfo.title}
      </span>
      <span className="g-badge">
        {players.length > 0
          ? `Ronda ${round} de ${config.rounds}`
          : `Turno ${turn + 1} de ${turns}`}
      </span>
      {players.length === 0 && <span className="g-badge">✅ {hits}</span>}
      <button className="btn secondary small" onClick={onExit}>
        Salir
      </button>
    </div>
  )

  const board = players.length > 0 && (
    <div className="mi-board">
      <Scoreboard players={players} scores={scores} onAdd={add} currentId={player?.id} compact />
    </div>
  )

  const secret = (
    <>
      <div className="mi-word">{card.text}</div>
      <p className="mi-rule">
        {modeInfo.icon} {modeInfo.rule}
      </p>
      {config.mode === 'sin-decir' && (
        <div className="mi-taboo" aria-label="Palabras prohibidas">
          {taboo.map((t) => (
            <span key={t} className="mi-taboo-chip">
              {t}
            </span>
          ))}
        </div>
      )}
    </>
  )

  if (stage === 'ready') {
    return (
      <div className="g-stage g-center">
        {header}
        <p className="mi-turn-name" style={{ color: player?.color }}>
          {player ? `${player.emoji} ${player.name}` : '🙋 ¡Pasa al frente!'}
        </p>
        <ol className="mi-steps">
          <li>🚶 Pasa al computador</li>
          <li>🙈 La clase cierra los ojos</li>
          <li>👀 Pulsa Mostrar</li>
        </ol>
        <button className="btn big mi-main" onClick={show}>
          🙈 Mostrar la palabra
        </button>
        {board}
        <p className="muted mi-hint">Espacio o flecha →: mostrar</p>
      </div>
    )
  }

  if (stage === 'counting') {
    return (
      <div className="g-stage g-center">
        {header}
        <p className="mi-big">🙈 ¡Clase, cierren los ojos!</p>
        <div className="mi-count" key={count} aria-live="polite">
          {count}
        </div>
      </div>
    )
  }

  if (stage === 'memorize') {
    return (
      <div className="g-stage mi-stage">
        {header}
        <div className="mi-card show">{secret}</div>
        <div className="g-center">
          <button className="btn big mi-main" onClick={start}>
            🙈 Ocultar y empezar
          </button>
          <p className="muted">
            Memorízala. Después de ocultarla empieza el tiempo ({config.seconds} s).
          </p>
        </div>
      </div>
    )
  }

  if (stage === 'timeup') {
    const last = results.filter((r) => r.ok).length
    return (
      <div className="g-stage g-center">
        {header}
        <p className="mi-big">{left <= 0 ? '⏰ ¡Se acabó el tiempo!' : '🏁 Fin del turno'}</p>
        <div className="mi-card show" style={{ width: '100%' }}>
          <p className="mi-rule">La palabra era:</p>
          <div className="mi-word">{card.text}</div>
        </div>
        <div className="row">
          <button className="btn big mi-ok" disabled={lateOk} onClick={lateGuess}>
            {lateOk ? '✅ ¡Sumó!' : '✅ ¡Sí la adivinaron!'}
          </button>
          <button className="btn big" onClick={nextTurn}>
            {turn + 1 >= turns ? 'Ver resultados' : 'Siguiente turno →'}
          </button>
        </div>
        <p className="g-badge">
          {player ? `${player.emoji} ${player.name}: ` : ''}
          {last} {last === 1 ? 'acierto' : 'aciertos'}
        </p>
        {results.length > 0 && (
          <div className="mi-results">
            {results.map((r, i) => (
              <span key={i} className={`mi-chip ${r.ok ? 'ok' : 'skip'}`}>
                {r.ok ? '✅' : '⏭'} {r.text}
              </span>
            ))}
          </div>
        )}
        {board}
      </div>
    )
  }

  // Jugando
  return (
    <div className="g-stage mi-stage">
      {header}
      <div className="mi-timer-row">
        <span className={`g-timer mi-time ${left <= 10 ? 'low' : ''}`} aria-live="off">
          ⏱ {clock(left)}
        </span>
        <div className={`mi-bar ${left <= 10 ? 'low' : ''}`}>
          <span style={{ width: `${(Math.max(0, left - 1) / config.seconds) * 100}%` }} />
        </div>
        {player && (
          <span className="g-badge" style={{ borderColor: player.color }}>
            {player.emoji} {player.name}
          </span>
        )}
      </div>

      <div className={`mi-card ${peek && !paused ? 'show' : 'hidden'}`}>
        {paused ? (
          <>
            <div className="mi-q">⏸</div>
            <p className="mi-big">En pausa</p>
          </>
        ) : peek ? (
          secret
        ) : (
          <>
            <div className="mi-q">{modeInfo.icon}</div>
            <p className="mi-big">¿Qué palabra será?</p>
            <p className="mi-rule">{modeInfo.rule}</p>
          </>
        )}
      </div>

      <button
        className={`btn secondary mi-peek ${peek ? 'holding' : ''}`}
        disabled={paused}
        onPointerDown={() => setPeek(true)}
        onPointerUp={() => setPeek(false)}
        onPointerLeave={() => setPeek(false)}
        onPointerCancel={() => setPeek(false)}
        onBlur={() => setPeek(false)}
        onKeyDown={(e) => {
          if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault()
            setPeek(true)
          }
        }}
        onKeyUp={(e) => {
          if (e.key === ' ' || e.key === 'Enter') setPeek(false)
        }}
      >
        👀 Mantén presionado para ver la palabra
      </button>

      <div className="mi-actions">
        <button className="btn big mi-ok" disabled={paused} onClick={guessed}>
          ✅ ¡Adivinaron!
        </button>
        <button className="btn big secondary" disabled={paused} onClick={skip}>
          ⏭ Pasar
        </button>
      </div>

      <div className="mi-tools">
        <button className="btn small secondary" onClick={() => setPaused(!paused)}>
          {paused ? 'Seguir ▶' : 'Pausa'}
        </button>
        <button className="btn small secondary" onClick={endTurn}>
          Terminar turno
        </button>
        <span className="muted mi-hint">Espacio: ¡Adivinaron! · →: Pasar · V: ver · P: pausa</span>
      </div>
      {board}
    </div>
  )
}
