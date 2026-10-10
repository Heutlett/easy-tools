import { useEffect, useMemo, useRef, useState } from 'react'
import './style.css'
import '../_visual/visual.css'
import BankFilters from '../../components/games/BankFilters'
import PlayerSetup from '../../components/games/PlayerSetup'
import Scoreboard from '../../components/games/Scoreboard'
import { filterBank, type BankFilter } from '../../content/banks'
import { subjectOf } from '../../content/subjects'
import { useScores, type Player } from '../../lib/games/players'
import { pick, shuffle } from '../../lib/games/shuffle'
import { sfx } from '../../lib/games/sfx'
import { usePersistentState } from '../../lib/usePersistentState'
import ImageFileButton from '../_visual/ImageFileButton'
import { normalize, useImageLoader, type OwnImage } from '../_visual/image'
import { MYSTERIES } from './data'

/** Lo que se adivina en una ronda: un emoji o una imagen del docente */
interface Item {
  id: string
  emoji?: string
  url?: string
  answer: string
  accepts: string[]
  info?: string
}

interface Prefs {
  size: 4 | 5 | 6
  /** Segundos entre cuadros que se quitan solos; 0 = a mano */
  auto: 0 | 3 | 5 | 8
  count: number
}

const DEFAULTS: Prefs = { size: 4, auto: 0, count: 10 }

interface Draft {
  image: OwnImage
  answer: string
}

type Phase =
  | { name: 'setup' }
  | { name: 'players'; items: Item[] }
  | { name: 'play'; items: Item[]; players: Player[] }

export default function HiddenImage(): React.JSX.Element {
  const [phase, setPhase] = useState<Phase>({ name: 'setup' })
  const [prefs, setPrefs] = usePersistentState<Prefs>('game:imagen-escondida:prefs', DEFAULTS)
  // Las imágenes propias se quedan al volver a la pantalla de elegir
  const [drafts, setDrafts] = useState<Draft[]>([])
  const loader = useImageLoader()

  if (phase.name === 'setup')
    return (
      <Setup
        prefs={{ ...DEFAULTS, ...prefs }}
        onPrefs={setPrefs}
        drafts={drafts}
        setDrafts={setDrafts}
        loader={loader}
        onStart={(items) => setPhase({ name: 'players', items })}
      />
    )
  if (phase.name === 'players')
    return (
      <PlayerSetup
        optional
        startLabel="Jugar"
        onStart={(players) => setPhase({ name: 'play', items: phase.items, players })}
      />
    )
  return (
    <Play
      items={phase.items}
      players={phase.players}
      size={prefs.size ?? DEFAULTS.size}
      auto={prefs.auto ?? 0}
      onExit={() => setPhase({ name: 'setup' })}
    />
  )
}

/* ------------------------------------------------------------------ Elegir */

const SIZES: Prefs['size'][] = [4, 5, 6]
const AUTOS: { id: Prefs['auto']; title: string }[] = [
  { id: 0, title: '🖱️ A mano' },
  { id: 3, title: '⏩ Rápido (3 s)' },
  { id: 5, title: '▶️ Normal (5 s)' },
  { id: 8, title: '🐢 Lento (8 s)' }
]

function Setup({
  prefs,
  onPrefs,
  drafts,
  setDrafts,
  loader,
  onStart
}: {
  prefs: Prefs
  onPrefs: (p: Prefs) => void
  drafts: Draft[]
  setDrafts: (d: Draft[]) => void
  loader: ReturnType<typeof useImageLoader>
  onStart: (items: Item[]) => void
}): React.JSX.Element {
  const [source, setSource] = useState<'app' | 'own'>('app')
  const [filter, setFilter] = usePersistentState<BankFilter>('game:imagen-escondida:filter', {})
  const pool = useMemo(() => filterBank(MYSTERIES, filter), [filter])
  const set = (patch: Partial<Prefs>): void => onPrefs({ ...prefs, ...patch })
  const ready = drafts.filter((d) => d.answer.trim())

  const start = (): void => {
    if (source === 'app') {
      // Si dos misterios usan el mismo dibujo (en español y en inglés), solo sale uno
      const byEmoji = new Map(shuffle(pool).map((m) => [m.emoji, m]))
      const chosen = pick([...byEmoji.values()], prefs.count)
      onStart(
        chosen.map((m) => ({
          id: m.id,
          emoji: m.emoji,
          answer: m.answer,
          accepts: m.accepts,
          info: `${subjectOf(m.subject).icon} ${m.topic}`
        }))
      )
    } else {
      onStart(
        shuffle(ready).map((d) => ({
          id: d.image.id,
          url: d.image.url,
          answer: d.answer.trim(),
          accepts: d.answer
            .split(/[,/]/)
            .map((s) => s.trim())
            .filter(Boolean)
        }))
      )
    }
  }

  return (
    <section className="panel picker ie-setup">
      <div className="bank-filter-row">
        <span className="bank-filter-label">Imágenes</span>
        <div className="pills" role="group" aria-label="De dónde salen las imágenes">
          <button
            className={`pill ${source === 'app' ? 'selected' : ''}`}
            aria-pressed={source === 'app'}
            onClick={() => setSource('app')}
          >
            🕵️ Misterios de la app
          </button>
          <button
            className={`pill ${source === 'own' ? 'selected' : ''}`}
            aria-pressed={source === 'own'}
            onClick={() => setSource('own')}
          >
            🖼️ Mis imágenes
          </button>
        </div>
      </div>

      {source === 'app' ? (
        <>
          <BankFilters items={MYSTERIES} value={filter} onChange={setFilter} />
          <div className="bank-filter-row">
            <span className="bank-filter-label">Cuántos</span>
            <div className="pills" role="group" aria-label="Cantidad de misterios">
              {[5, 10, 15, 20].map((n) => (
                <button
                  key={n}
                  className={`pill ${prefs.count === n ? 'selected' : ''}`}
                  aria-pressed={prefs.count === n}
                  onClick={() => set({ count: n })}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
        </>
      ) : (
        <OwnImages drafts={drafts} setDrafts={setDrafts} loader={loader} />
      )}

      <div className="bank-filter-row">
        <span className="bank-filter-label">Cuadros</span>
        <div className="pills" role="group" aria-label="Tamaño de la cuadrícula">
          {SIZES.map((n) => (
            <button
              key={n}
              className={`pill ${prefs.size === n ? 'selected' : ''}`}
              aria-pressed={prefs.size === n}
              onClick={() => set({ size: n })}
            >
              {n}×{n}
            </button>
          ))}
        </div>
      </div>
      <div className="bank-filter-row">
        <span className="bank-filter-label">Se quitan</span>
        <div className="pills" role="group" aria-label="Cómo se quitan los cuadros">
          {AUTOS.map((a) => (
            <button
              key={a.id}
              className={`pill ${prefs.auto === a.id ? 'selected' : ''}`}
              aria-pressed={prefs.auto === a.id}
              onClick={() => set({ auto: a.id })}
            >
              {a.title}
            </button>
          ))}
        </div>
      </div>

      <div className="row">
        <p className={(source === 'app' ? pool.length : ready.length) === 0 ? 'notice' : 'muted'}>
          {source === 'app'
            ? `${pool.length} misterios disponibles`
            : `${ready.length} imágenes con respuesta`}
        </p>
        <button
          className="btn big"
          disabled={(source === 'app' ? pool.length : ready.length) === 0}
          onClick={start}
        >
          Siguiente →
        </button>
      </div>
    </section>
  )
}

function OwnImages({
  drafts,
  setDrafts,
  loader
}: {
  drafts: Draft[]
  setDrafts: (d: Draft[]) => void
  loader: ReturnType<typeof useImageLoader>
}): React.JSX.Element {
  return (
    <div className="ie-own">
      <div className="row start">
        <ImageFileButton
          label="📁 Elegir imágenes del computador"
          multiple
          className="btn"
          onFiles={async (files) => {
            const images = await loader.load(files)
            setDrafts([...drafts, ...images.map((image) => ({ image, answer: '' }))])
          }}
        />
        <span className="muted">
          Escribe qué es cada una (varias respuestas, separadas por coma).
        </span>
      </div>
      {drafts.length > 0 && (
        <ul className="ie-drafts">
          {drafts.map((d, i) => (
            <li key={d.image.id} className="ie-draft">
              <img src={d.image.url} alt="" />
              <input
                className="field"
                value={d.answer}
                placeholder="¿Qué es?"
                aria-label={`Respuesta de la imagen ${i + 1}`}
                maxLength={60}
                onChange={(e) =>
                  setDrafts(drafts.map((x, j) => (j === i ? { ...x, answer: e.target.value } : x)))
                }
              />
              <button
                className="icon-btn"
                aria-label={`Quitar la imagen ${i + 1}`}
                onClick={() => {
                  loader.release(d.image)
                  setDrafts(drafts.filter((_, j) => j !== i))
                }}
              >
                ✖
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ Jugar */

function Play({
  items,
  players,
  size,
  auto,
  onExit
}: {
  items: Item[]
  players: Player[]
  size: number
  auto: number
  onExit: () => void
}): React.JSX.Element {
  const [index, setIndex] = useState(0)
  const [solved, setSolved] = useState(0)
  const [finished, setFinished] = useState(false)
  const { scores, add, reset, ranking, leaders } = useScores(players)

  const next = (wasSolved: boolean): void => {
    if (wasSolved) setSolved((s) => s + 1)
    if (index + 1 < items.length) setIndex(index + 1)
    else {
      setFinished(true)
      sfx.win()
    }
  }

  if (finished)
    return (
      <div className="g-stage g-center ie-end">
        <p className="g-win">🕵️ ¡Misterios resueltos!</p>
        {players.length > 0 ? (
          <>
            <p className="ie-winner">
              {leaders.length === 1
                ? `Ganó ${leaders[0].emoji} ${leaders[0].name}`
                : leaders.length > 1
                  ? `Empate: ${leaders.map((l) => l.name).join(' y ')}`
                  : 'Nadie sumó puntos'}
            </p>
            <Scoreboard players={ranking} scores={scores} />
          </>
        ) : null}
        <p className="ie-winner">
          Adivinaron {solved} de {items.length}
        </p>
        <div className="row start">
          <button
            className="btn big"
            onClick={() => (reset(), setIndex(0), setSolved(0), setFinished(false))}
          >
            Jugar otra vez
          </button>
          <button className="btn secondary" onClick={onExit}>
            Cambiar de imágenes
          </button>
        </div>
      </div>
    )

  return (
    <Round
      key={index}
      item={items[index]}
      number={index + 1}
      total={items.length}
      players={players}
      scores={scores}
      size={size}
      auto={auto}
      isLast={index + 1 === items.length}
      onAward={add}
      onNext={next}
      onExit={onExit}
    />
  )
}

type RoundState =
  { name: 'playing' } | { name: 'done'; guessed: boolean; pts: number; winner: string | null }

function Round({
  item,
  number,
  total,
  players,
  scores,
  size,
  auto,
  isLast,
  onAward,
  onNext,
  onExit
}: {
  item: Item
  number: number
  total: number
  players: Player[]
  scores: Record<string, number>
  size: number
  auto: number
  isLast: boolean
  onAward: (id: string, delta: number) => void
  onNext: (solved: boolean) => void
  onExit: () => void
}): React.JSX.Element {
  const cells = size * size
  const [open, setOpen] = useState<boolean[]>(() => Array(cells).fill(false))
  const [state, setState] = useState<RoundState>({ name: 'playing' })
  const [paused, setPaused] = useState(false)
  const [guess, setGuess] = useState('')
  const [shake, setShake] = useState(0)
  const guessRef = useRef<HTMLInputElement>(null)

  const hidden = open.filter((o) => !o).length
  const points = Math.min(10, Math.max(1, Math.ceil((10 * hidden) / cells)))
  const done = state.name === 'done'

  const revealOne = (): void => {
    if (done) return
    const closed = open.map((o, i) => (o ? -1 : i)).filter((i) => i >= 0)
    if (closed.length === 0) return
    const i = closed[Math.floor(Math.random() * closed.length)]
    setOpen(open.map((o, j) => o || j === i))
    sfx.pop()
  }
  const openCell = (i: number): void => {
    if (done || open[i]) return
    setOpen(open.map((o, j) => o || j === i))
    sfx.pop()
  }

  // Cuadros que se quitan solos
  useEffect(() => {
    if (!auto || paused || done || hidden === 0) return
    const id = setTimeout(revealOne, auto * 1000)
    return () => clearTimeout(id)
  })

  const solve = (teamId: string | null): void => {
    if (done) return
    if (teamId) onAward(teamId, points)
    setState({ name: 'done', guessed: true, pts: points, winner: teamId })
    sfx.correct()
  }
  const giveUp = (): void => {
    if (done) return
    setState({ name: 'done', guessed: false, pts: 0, winner: null })
  }
  const award = (teamId: string): void => {
    if (state.name !== 'done' || !state.guessed || state.winner) return
    onAward(teamId, state.pts)
    setState({ ...state, winner: teamId })
    sfx.correct()
  }

  const check = (): void => {
    const g = normalize(guess)
    if (!g) return
    if (item.accepts.some((a) => normalize(a) === g)) {
      solve(null)
      setGuess('')
    } else {
      sfx.wrong()
      setShake((s) => s + 1)
    }
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent): void => {
      const tag = e.target instanceof HTMLElement ? e.target.tagName : 'BODY'
      if (/^(INPUT|TEXTAREA|SELECT)$/.test(tag)) return
      if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        e.preventDefault()
        if (done) onNext(state.guessed)
        else revealOne()
      } else if ((e.key === ' ' || e.key === 'Enter') && tag === 'BODY') {
        e.preventDefault()
        if (done) onNext(state.guessed)
        else revealOne()
      } else if (!done && /^[1-8]$/.test(e.key) && players[Number(e.key) - 1]) {
        solve(players[Number(e.key) - 1].id)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  return (
    <div className="g-stage ie-play">
      <div className="ie-board-col">
        <div
          className={`ie-board ${done ? 'all-open' : ''}`}
          style={{ '--ie-n': size } as React.CSSProperties}
        >
          {item.url ? (
            <div className="ie-pic" style={{ backgroundImage: `url("${item.url}")` }} />
          ) : (
            <div className="ie-pic ie-emoji" aria-hidden>
              {item.emoji}
            </div>
          )}
          <div className="ie-grid">
            {open.map((o, i) => (
              <button
                key={i}
                className={`ie-cell ${o || done ? 'open' : ''} ${(Math.floor(i / size) + i) % 2 ? 'b' : 'a'}`}
                aria-label={`Descubrir el cuadro ${i + 1}`}
                tabIndex={o || done ? -1 : 0}
                onClick={() => openCell(i)}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="ie-side">
        <div className="row">
          <span className="g-badge">
            {number} / {total}
          </span>
          {done ? (
            <span className="g-badge">
              {state.guessed
                ? `⭐ ${state.pts} ${state.pts === 1 ? 'punto' : 'puntos'}`
                : 'Sin puntos'}
            </span>
          ) : (
            <span className="g-badge ie-worth" key={points}>
              ⭐ Vale {points} {points === 1 ? 'punto' : 'puntos'}
            </span>
          )}
        </div>

        {done ? (
          <div className={`ie-answer ${state.guessed ? 'yes' : 'no'}`}>
            <span className="ie-answer-small">{state.guessed ? '¡Era!' : 'Era...'}</span>
            <span className="ie-answer-big">{item.answer}</span>
            {item.info && <span className="muted">{item.info}</span>}
          </div>
        ) : (
          <div className="ie-answer">
            <span className="ie-answer-big">¿Qué será?</span>
            <span className="muted">
              {hidden} de {cells} cuadros tapados
            </span>
          </div>
        )}

        {!done && (
          <>
            <div className="ie-guess">
              <input
                ref={guessRef}
                key={shake}
                className={`field ${shake ? 'ie-shake' : ''}`}
                value={guess}
                placeholder="Escribe lo que dice la clase"
                aria-label="Respuesta de la clase"
                onChange={(e) => setGuess(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') check()
                }}
              />
              <button className="btn secondary" onClick={check} disabled={!guess.trim()}>
                Comprobar
              </button>
            </div>
            <div className="row start">
              <button className="btn big" onClick={revealOne} disabled={hidden === 0}>
                Quitar un cuadro
              </button>
              {auto > 0 && (
                <button
                  className="btn secondary"
                  aria-pressed={paused}
                  onClick={() => setPaused(!paused)}
                >
                  {paused ? '▶️ Seguir' : '⏸️ Pausa'}
                </button>
              )}
              <button className="btn secondary" onClick={giveUp}>
                Revelar respuesta
              </button>
            </div>
            <div className="ie-solve">
              <span className="muted">
                {players.length ? '¿Quién acertó?' : 'Si ya adivinaron:'}
              </span>
              <div className="row start">
                {players.length === 0 && (
                  <button className="btn" onClick={() => solve(null)}>
                    ✅ ¡Lo adivinaron!
                  </button>
                )}
                {players.map((p, i) => (
                  <button
                    key={p.id}
                    className="btn ie-team"
                    style={{ '--team': p.color } as React.CSSProperties}
                    aria-label={`${p.name} acertó (tecla ${i + 1})`}
                    onClick={() => solve(p.id)}
                  >
                    {p.emoji} {p.name}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {done && (
          <>
            {state.guessed && !state.winner && players.length > 0 && (
              <div className="ie-solve">
                <span className="muted">¿Quién acertó? Pulsa su equipo para darle los puntos:</span>
                <div className="row start">
                  {players.map((p) => (
                    <button
                      key={p.id}
                      className="btn ie-team"
                      style={{ '--team': p.color } as React.CSSProperties}
                      onClick={() => award(p.id)}
                    >
                      {p.emoji} {p.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div className="row start">
              <button className="btn big" onClick={() => onNext(state.guessed)}>
                {isLast ? 'Terminar' : 'Siguiente →'}
              </button>
            </div>
          </>
        )}

        {players.length > 0 && <Scoreboard players={players} scores={scores} compact />}

        <div className="row">
          <button className="btn secondary small" onClick={onExit}>
            Salir
          </button>
          <span className="muted">
            Espacio o → : {done ? 'siguiente' : 'quitar un cuadro'}
            {players.length > 0 && !done ? ' · 1-' + players.length + ': acierta ese equipo' : ''}
          </span>
        </div>
      </div>
    </div>
  )
}
