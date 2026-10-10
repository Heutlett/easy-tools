import { useEffect, useRef, useState } from 'react'
import './style.css'
import '../_visual/visual.css'
import PlayerSetup from '../../components/games/PlayerSetup'
import Scoreboard from '../../components/games/Scoreboard'
import { useScores, type Player } from '../../lib/games/players'
import { pickOne } from '../../lib/games/shuffle'
import { sfx } from '../../lib/games/sfx'
import { usePersistentState } from '../../lib/usePersistentState'
import ImageFileButton from '../_visual/ImageFileButton'
import { useImageLoader, type OwnImage } from '../_visual/image'
import { ArtPicture, SceneArt } from './Pictures'
import { SCENES, type Art } from './scenes'
import { arrowTarget, isSolved, misplaced, shuffled, slide, type Perm } from './puzzle'

type Mode = 'libre' | 'turnos' | 'reloj'

interface Prefs {
  size: 3 | 4 | 5
  mode: Mode
  /** Minutos del contrarreloj */
  minutes: 1 | 2 | 3 | 5
  /** Id de la ilustración, 'random' o 'own' */
  pic: string
}
const DEFAULTS: Prefs = { size: 3, mode: 'libre', minutes: 3, pic: 'random' }

type Phase =
  | { name: 'setup' }
  | { name: 'players' }
  | { name: 'play'; players: Player[] }
  | { name: 'end'; players: Player[]; scores: Record<string, number> }

const mmss = (s: number): string =>
  `${Math.floor(s / 60)}:${String(Math.max(0, Math.floor(s % 60))).padStart(2, '0')}`

export default function SlidingPuzzle(): React.JSX.Element {
  const [phase, setPhase] = useState<Phase>({ name: 'setup' })
  const [stored, setPrefs] = usePersistentState<Prefs>('game:rompecabezas:prefs', DEFAULTS)
  const prefs = { ...DEFAULTS, ...stored }
  const [own, setOwn] = useState<OwnImage | null>(null)
  const loader = useImageLoader()

  const art = (pic: string): Art => {
    if (pic === 'own' && own) return { url: own.url }
    const found = SCENES.find((s) => s.id === pic)
    return { scene: found ?? (pickOne(SCENES) as (typeof SCENES)[number]) }
  }

  if (phase.name === 'setup')
    return (
      <Setup
        prefs={prefs}
        onPrefs={setPrefs}
        own={own}
        onOwn={async (file) => {
          const [img] = await loader.load([file])
          if (!img) return
          if (own) loader.release(own)
          setOwn(img)
          setPrefs({ ...prefs, pic: 'own' })
        }}
        onStart={() =>
          prefs.mode === 'turnos'
            ? setPhase({ name: 'players' })
            : setPhase({ name: 'play', players: [] })
        }
      />
    )
  if (phase.name === 'players')
    return (
      <PlayerSetup startLabel="Jugar" onStart={(players) => setPhase({ name: 'play', players })} />
    )
  if (phase.name === 'end')
    return (
      <End
        phase={phase}
        onAgain={() => setPhase({ name: 'play', players: phase.players })}
        onExit={() => setPhase({ name: 'setup' })}
      />
    )
  return (
    <Play
      prefs={prefs}
      players={phase.players}
      makeArt={() => art(prefs.pic === 'own' && !own ? 'random' : prefs.pic)}
      onFinish={(scores) => setPhase({ name: 'end', players: phase.players, scores })}
      onExit={() => setPhase({ name: 'setup' })}
    />
  )
}

/* ------------------------------------------------------------------ Elegir */

function Setup({
  prefs,
  onPrefs,
  own,
  onOwn,
  onStart
}: {
  prefs: Prefs
  onPrefs: (p: Prefs) => void
  own: OwnImage | null
  onOwn: (file: File) => void
  onStart: () => void
}): React.JSX.Element {
  const set = (patch: Partial<Prefs>): void => onPrefs({ ...prefs, ...patch })
  return (
    <section className="panel picker rp-setup">
      <div className="bank-filter-row">
        <span className="bank-filter-label">Imagen</span>
        <div className="rp-scenes" role="group" aria-label="Imagen del rompecabezas">
          <button
            className={`rp-scene rp-random ${prefs.pic === 'random' ? 'selected' : ''}`}
            aria-pressed={prefs.pic === 'random'}
            onClick={() => set({ pic: 'random' })}
          >
            <span className="rp-scene-art">🎲</span>
            <span>Al azar</span>
          </button>
          {SCENES.map((s) => (
            <button
              key={s.id}
              className={`rp-scene ${prefs.pic === s.id ? 'selected' : ''}`}
              aria-pressed={prefs.pic === s.id}
              onClick={() => set({ pic: s.id })}
            >
              <span className="rp-scene-art">
                <SceneArt scene={s} />
              </span>
              <span>{s.name}</span>
            </button>
          ))}
          {own && (
            <button
              className={`rp-scene ${prefs.pic === 'own' ? 'selected' : ''}`}
              aria-pressed={prefs.pic === 'own'}
              onClick={() => set({ pic: 'own' })}
            >
              <span className="rp-scene-art">
                <ArtPicture art={{ url: own.url }} />
              </span>
              <span>Mi imagen</span>
            </button>
          )}
          <ImageFileButton
            label={own ? '📁 Otra imagen' : '📁 Mi imagen'}
            className="btn secondary rp-own"
            onFiles={(files) => onOwn(files[0])}
          />
        </div>
      </div>

      <div className="bank-filter-row">
        <span className="bank-filter-label">Tamaño</span>
        <div className="pills" role="group" aria-label="Tamaño">
          {(
            [
              [3, '3×3 Fácil'],
              [4, '4×4 Medio'],
              [5, '5×5 Difícil']
            ] as const
          ).map(([n, label]) => (
            <button
              key={n}
              className={`pill ${prefs.size === n ? 'selected' : ''}`}
              aria-pressed={prefs.size === n}
              onClick={() => set({ size: n })}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="bank-filter-row">
        <span className="bank-filter-label">Cómo se juega</span>
        <div className="pills" role="group" aria-label="Modo de juego">
          {(
            [
              ['libre', '🏫 Toda la clase'],
              ['turnos', '🔁 Por turnos'],
              ['reloj', '⏱️ Contrarreloj']
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              className={`pill ${prefs.mode === id ? 'selected' : ''}`}
              aria-pressed={prefs.mode === id}
              onClick={() => set({ mode: id })}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      {prefs.mode === 'reloj' && (
        <div className="bank-filter-row">
          <span className="bank-filter-label">Tiempo</span>
          <div className="pills" role="group" aria-label="Tiempo">
            {([1, 2, 3, 5] as const).map((m) => (
              <button
                key={m}
                className={`pill ${prefs.minutes === m ? 'selected' : ''}`}
                aria-pressed={prefs.minutes === m}
                onClick={() => set({ minutes: m })}
              >
                {m} {m === 1 ? 'minuto' : 'minutos'}
              </button>
            ))}
          </div>
        </div>
      )}
      <p className="muted">
        {prefs.mode === 'turnos'
          ? 'Cada turno es un movimiento. Quien completa el rompecabezas suma un punto.'
          : prefs.mode === 'reloj'
            ? 'El tiempo empieza con el primer movimiento.'
            : 'Se juega con clic o con las flechas del teclado.'}
      </p>
      <div className="row">
        <span />
        <button className="btn big" onClick={onStart}>
          {prefs.mode === 'turnos' ? 'Siguiente →' : 'Jugar'}
        </button>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ Jugar */

function Play({
  prefs,
  players,
  makeArt,
  onFinish,
  onExit
}: {
  prefs: Prefs
  players: Player[]
  makeArt: () => Art
  onFinish: (scores: Record<string, number>) => void
  onExit: () => void
}): React.JSX.Element {
  const [round, setRound] = useState(0)
  const [art, setArt] = useState<Art>(makeArt)
  const [best, setBest] = usePersistentState<Record<string, number>>('game:rompecabezas:best', {})
  const { scores, add } = useScores(players)

  return (
    <Puzzle
      key={round}
      n={prefs.size}
      mode={prefs.mode}
      limit={prefs.minutes * 60}
      art={art}
      players={players}
      scores={scores}
      record={best[String(prefs.size)]}
      onSolved={(winnerId, seconds) => {
        if (winnerId) add(winnerId, 1)
        else if (prefs.mode !== 'turnos') {
          const key = String(prefs.size)
          if (best[key] === undefined || seconds < best[key]) setBest({ ...best, [key]: seconds })
        }
      }}
      onAgain={(newArt) => {
        if (newArt) setArt(makeArt())
        setRound(round + 1)
      }}
      onFinish={() => onFinish(scores)}
      onExit={onExit}
    />
  )
}

function Puzzle({
  n,
  mode,
  limit,
  art,
  players,
  scores,
  record,
  onSolved,
  onAgain,
  onFinish,
  onExit
}: {
  n: number
  mode: Mode
  limit: number
  art: Art
  players: Player[]
  scores: Record<string, number>
  record: number | undefined
  onSolved: (winnerId: string | null, seconds: number) => void
  onAgain: (newArt: boolean) => void
  onFinish: () => void
  onExit: () => void
}): React.JSX.Element {
  const [perm, setPerm] = useState<Perm>(() => shuffled(n))
  const [moves, setMoves] = useState(0)
  const [turn, setTurn] = useState(0)
  const [elapsed, setElapsed] = useState(0)
  const [state, setState] = useState<'idle' | 'running' | 'won' | 'lost'>('idle')
  const [winner, setWinner] = useState<string | null>(null)
  const [numbers, setNumbers] = useState(n === 3)
  const [peek, setPeek] = useState(false)
  const [newRecord, setNewRecord] = useState(false)
  const startedAt = useRef(0)
  const [finalSeconds, setFinalSeconds] = useState(0)
  const peekTimer = useRef<ReturnType<typeof setTimeout>>(undefined)

  // Reloj: cuenta desde el primer movimiento
  useEffect(() => {
    if (state !== 'running') return
    const id = setInterval(() => {
      const s = (Date.now() - startedAt.current) / 1000
      setElapsed(s)
      if (mode === 'reloj' && s >= limit) {
        setFinalSeconds(limit)
        setState('lost')
        sfx.timeUp()
      } else if (mode === 'reloj' && limit - s <= 5.5 && Math.floor(s) !== Math.floor(s - 0.25)) {
        sfx.tick()
      }
    }, 250)
    return () => clearInterval(id)
  }, [state, mode, limit])

  useEffect(() => () => clearTimeout(peekTimer.current), [])

  const frozen = state === 'won' || state === 'lost'

  const move = (p: number): void => {
    if (frozen) return
    const next = slide(perm, p, n)
    if (!next) return
    if (state === 'idle') {
      startedAt.current = Date.now()
      setState('running')
    }
    setPerm(next)
    setMoves(moves + 1)
    if (isSolved(next)) {
      const seconds = Math.max(
        1,
        Math.round((Date.now() - (startedAt.current || Date.now())) / 1000)
      )
      setFinalSeconds(seconds)
      setElapsed(seconds)
      setState('won')
      const solver = players.length ? players[turn % players.length].id : null
      setWinner(solver)
      setNewRecord(!solver && (record === undefined || seconds < record))
      onSolved(solver, seconds)
      sfx.win()
    } else {
      sfx.pop()
      if (players.length) setTurn((turn + 1) % players.length)
    }
  }

  const showPeek = (): void => {
    setPeek(true)
    clearTimeout(peekTimer.current)
    peekTimer.current = setTimeout(() => setPeek(false), 3000)
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent): void => {
      const tag = e.target instanceof HTMLElement ? e.target.tagName : 'BODY'
      if (/^(INPUT|TEXTAREA|SELECT)$/.test(tag)) return
      if (e.key.startsWith('Arrow')) {
        e.preventDefault()
        const target = arrowTarget(perm, n, e.key)
        if (target !== null) move(target)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const posOf = (id: number): number => perm.indexOf(id)
  const inPlace = perm.filter((t, i) => t === i && t !== n * n - 1).length
  const remaining = Math.max(0, limit - elapsed)
  const current = players.length ? players[turn % players.length] : null

  return (
    <div className="g-stage rp-play">
      <div className="rp-board-col">
        <div className="rp-board" style={{ '--n': n } as React.CSSProperties}>
          {perm.map((_, id) => {
            const pos = posOf(id)
            const isBlank = id === n * n - 1
            return (
              <button
                key={id}
                className={`rp-tile ${isBlank ? (state === 'won' ? 'last won' : 'blank') : ''} ${pos === id && !isBlank ? 'ok' : ''}`}
                style={
                  {
                    '--r': Math.floor(pos / n),
                    '--c': pos % n,
                    '--tr': Math.floor(id / n),
                    '--tc': id % n
                  } as React.CSSProperties
                }
                aria-label={isBlank ? 'Hueco' : `Ficha ${id + 1}`}
                tabIndex={isBlank ? -1 : 0}
                onClick={() => move(pos)}
              >
                <ArtPicture art={art} />
                {numbers && !isBlank && <span className="rp-num">{id + 1}</span>}
              </button>
            )
          })}
          <div className={`rp-peek ${peek ? 'on' : ''}`}>
            <ArtPicture art={art} />
          </div>
        </div>
      </div>

      <div className="rp-side">
        <div className="rp-stats">
          <div className="rp-stat">
            <span className="rp-stat-label">Movimientos</span>
            <span className="rp-stat-value">{moves}</span>
          </div>
          <div
            className={`rp-stat ${mode === 'reloj' && remaining <= 10 && state === 'running' ? 'low' : ''}`}
          >
            <span className="rp-stat-label">
              {mode === 'reloj' ? 'Tiempo que queda' : 'Tiempo'}
            </span>
            <span className="rp-stat-value">
              {mmss(mode === 'reloj' ? Math.ceil(remaining) : elapsed)}
            </span>
          </div>
        </div>

        {state === 'won' && (
          <div className="rp-result win" role="status">
            <p className="g-win">🎉 ¡Lo lograron!</p>
            <p className="rp-big">
              {moves} movimientos · {mmss(finalSeconds)}
            </p>
            {current && winner && (
              <p className="rp-big">
                +1 para {players.find((p) => p.id === winner)?.emoji}{' '}
                {players.find((p) => p.id === winner)?.name}
              </p>
            )}
            {newRecord && <p className="rp-big">🏆 ¡Nuevo récord!</p>}
          </div>
        )}
        {state === 'lost' && (
          <div className="rp-result lose" role="status">
            <p className="g-win">⏰ ¡Se acabó el tiempo!</p>
            <p className="rp-big">
              {inPlace} de {n * n - 1} fichas en su lugar
            </p>
          </div>
        )}
        {mode !== 'turnos' && record !== undefined && (
          <p className="muted">
            🏆 Mejor tiempo en {n}×{n}: {mmss(record)}
          </p>
        )}
        {current && !frozen && (
          <p className="rp-turn" style={{ '--team': current.color } as React.CSSProperties}>
            Le toca a {current.emoji} {current.name}
          </p>
        )}

        {frozen ? (
          <div className="row start">
            <button className="btn big" onClick={() => onAgain(true)}>
              {mode === 'turnos' && state === 'won' ? 'Otro rompecabezas' : 'Jugar otra vez'}
            </button>
            {mode === 'turnos' && (
              <button className="btn secondary" onClick={onFinish}>
                Terminar
              </button>
            )}
          </div>
        ) : (
          <div className="row start">
            <button className="btn" onClick={showPeek}>
              👁️ Ver la imagen
            </button>
            <button className="btn secondary" onClick={() => onAgain(false)}>
              🔀 Mezclar de nuevo
            </button>
          </div>
        )}
        <div className="row start">
          <button
            className="pill small"
            aria-pressed={numbers}
            onClick={() => setNumbers(!numbers)}
          >
            {numbers ? '🔢 Números: sí' : '🔢 Números: no'}
          </button>
          {mode === 'turnos' && !frozen && (
            <button className="btn secondary small" onClick={onFinish}>
              Terminar
            </button>
          )}
        </div>

        {players.length > 0 && (
          <Scoreboard
            players={players}
            scores={scores}
            currentId={frozen ? undefined : current?.id}
            compact
          />
        )}

        <div className="row">
          <button className="btn secondary small" onClick={onExit}>
            Salir
          </button>
          <span className="muted">Clic en una ficha o flechas ← ↑ ↓ →</span>
        </div>
        <p className="muted rp-progress">
          {misplaced(perm) === 0 ? '' : `${inPlace} de ${n * n - 1} fichas en su lugar`}
        </p>
      </div>
    </div>
  )
}

function End({
  phase,
  onAgain,
  onExit
}: {
  phase: Extract<Phase, { name: 'end' }>
  onAgain: () => void
  onExit: () => void
}): React.JSX.Element {
  const ranking = phase.players
    .map((p) => ({ ...p, score: phase.scores[p.id] ?? 0 }))
    .sort((a, b) => b.score - a.score)
  const top = ranking[0]?.score ?? 0
  const leaders = top > 0 ? ranking.filter((p) => p.score === top) : []
  return (
    <div className="g-stage g-center">
      <p className="g-win">🧩 ¡Terminamos!</p>
      <p className="rp-big">
        {leaders.length === 1
          ? `Ganó ${leaders[0].emoji} ${leaders[0].name}`
          : leaders.length > 1
            ? `Empate: ${leaders.map((l) => l.name).join(' y ')}`
            : 'Nadie completó un rompecabezas'}
      </p>
      <Scoreboard players={ranking} scores={phase.scores} />
      <div className="row start">
        <button className="btn big" onClick={onAgain}>
          Jugar otra vez
        </button>
        <button className="btn secondary" onClick={onExit}>
          Cambiar opciones
        </button>
      </div>
    </div>
  )
}
