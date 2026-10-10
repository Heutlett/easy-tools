import { useEffect, useMemo, useState } from 'react'
import './style.css'
import '../_visual/visual.css'
import PlayerSetup from '../../components/games/PlayerSetup'
import { QuestionPicker } from '../../components/games/Pickers'
import { gradeLabel, subjectOf } from '../../content/subjects'
import type { Question } from '../../content/types'
import type { Player } from '../../lib/games/players'
import { playTones, sfx } from '../../lib/games/sfx'
import { shuffle, shuffleOptions } from '../../lib/games/shuffle'
import { randomInt } from '../../lib/random'
import { usePersistentState } from '../../lib/usePersistentState'
import { THEMES, type Theme, type ThemeId } from './themes'
import { Token } from './tokens'

type QMode = 'none' | 'all' | 'turns'

interface Prefs {
  theme: ThemeId
  length: 10 | 15 | 20
  questions: QMode
}
const DEFAULTS: Prefs = { theme: 'tortugas', length: 15, questions: 'none' }

type Phase =
  | { name: 'setup' }
  | { name: 'questions' }
  | { name: 'players'; pool: Question[] | null }
  | { name: 'play'; pool: Question[] | null; players: Player[] }

export default function Race(): React.JSX.Element {
  const [phase, setPhase] = useState<Phase>({ name: 'setup' })
  const [stored, setPrefs] = usePersistentState<Prefs>('game:carrera:prefs', DEFAULTS)
  const prefs = { ...DEFAULTS, ...stored }

  if (phase.name === 'setup')
    return (
      <Setup
        prefs={prefs}
        onPrefs={setPrefs}
        onNext={() =>
          setPhase(
            prefs.questions === 'none' ? { name: 'players', pool: null } : { name: 'questions' }
          )
        }
      />
    )
  if (phase.name === 'questions')
    return (
      <QuestionPicker
        counts={[10, 20, 30, 50]}
        defaultCount={30}
        minPool={4}
        startLabel="Siguiente →"
        onStart={(pool, count) =>
          setPhase({ name: 'players', pool: shuffle(pool).slice(0, count) })
        }
      />
    )
  if (phase.name === 'players')
    return (
      <PlayerSetup
        min={2}
        max={6}
        startLabel="¡A correr! 🏁"
        onStart={(players) => setPhase({ name: 'play', pool: phase.pool, players })}
      />
    )
  return (
    <Track
      prefs={prefs}
      players={phase.players}
      pool={phase.pool}
      onExit={() => setPhase({ name: 'setup' })}
    />
  )
}

/* ------------------------------------------------------------------ Elegir */

function Setup({
  prefs,
  onPrefs,
  onNext
}: {
  prefs: Prefs
  onPrefs: (p: Prefs) => void
  onNext: () => void
}): React.JSX.Element {
  const set = (patch: Partial<Prefs>): void => onPrefs({ ...prefs, ...patch })
  return (
    <section className="panel picker cr-setup">
      <div className="bank-filter-row">
        <span className="bank-filter-label">Tema</span>
        <div className="cr-themes" role="group" aria-label="Tema de la carrera">
          {THEMES.map((t) => (
            <button
              key={t.id}
              className={`cr-theme ${prefs.theme === t.id ? 'selected' : ''}`}
              aria-pressed={prefs.theme === t.id}
              onClick={() => set({ theme: t.id })}
            >
              <span className="cr-theme-art">
                <Token theme={t.id} color="#2563eb" />
              </span>
              <span>{t.title}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="bank-filter-row">
        <span className="bank-filter-label">Pista</span>
        <div className="pills" role="group" aria-label="Largo de la pista">
          {([10, 15, 20] as const).map((n) => (
            <button
              key={n}
              className={`pill ${prefs.length === n ? 'selected' : ''}`}
              aria-pressed={prefs.length === n}
              onClick={() => set({ length: n })}
            >
              {n} casillas
            </button>
          ))}
        </div>
      </div>
      <div className="bank-filter-row">
        <span className="bank-filter-label">Preguntas</span>
        <div className="pills" role="group" aria-label="Preguntas">
          {(
            [
              ['none', '🚫 Sin preguntas'],
              ['all', '❓ Para todos los equipos'],
              ['turns', '🔁 Por turnos']
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              className={`pill ${prefs.questions === id ? 'selected' : ''}`}
              aria-pressed={prefs.questions === id}
              onClick={() => set({ questions: id })}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      <p className="muted">
        {prefs.questions === 'none'
          ? 'Tú pulsas el equipo que acertó y su ficha avanza.'
          : prefs.questions === 'all'
            ? 'Sale una pregunta; tú pulsas a los equipos que acertaron.'
            : 'Una pregunta para cada equipo, uno después del otro.'}
      </p>
      <div className="row">
        <span />
        <button className="btn big" onClick={onNext}>
          Siguiente →
        </button>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ Pista */

interface Move {
  id: string
  from: number
  to: number
}

function Track({
  prefs,
  players,
  pool,
  onExit
}: {
  prefs: Prefs
  players: Player[]
  pool: Question[] | null
  onExit: () => void
}): React.JSX.Element {
  const L = prefs.length
  const theme = THEMES.find((t) => t.id === prefs.theme) ?? THEMES[0]
  const [pos, setPos] = useState<Record<string, number>>({})
  const [moves, setMoves] = useState<Move[]>([])
  const [arrival, setArrival] = useState<string[]>([])
  const [finished, setFinished] = useState(false)
  const [podium, setPodium] = useState(true)
  const [bonus, setBonus] = useState(false)
  const [turn, setTurn] = useState(0)
  const [hop, setHop] = useState<Record<string, number>>({})
  const [rematch, setRematch] = useState(0)

  const get = (id: string): number => pos[id] ?? 0
  const withQuestions = pool !== null

  const advance = (id: string, step = bonus ? 2 : 1): void => {
    if (finished) return
    const from = get(id)
    if (from >= L) return
    const to = Math.min(L, from + step)
    setPos({ ...pos, [id]: to })
    setMoves([...moves, { id, from, to }])
    setHop({ ...hop, [id]: (hop[id] ?? 0) + 1 })
    setBonus(false)
    const lane = players.findIndex((p) => p.id === id)
    playTones(
      Array.from({ length: to - from }, (_, i) => ({
        freq: 392 + lane * 40 + i * 120,
        at: i * 0.1,
        length: 0.16,
        type: 'triangle' as const
      }))
    )
    if (to >= L) {
      setArrival([...arrival, id])
      setFinished(true)
      setPodium(true)
      setTimeout(() => sfx.win(), 350)
    }
  }
  const undo = (): void => {
    const last = moves[moves.length - 1]
    if (!last) return
    setMoves(moves.slice(0, -1))
    setPos({ ...pos, [last.id]: last.from })
    setArrival(arrival.filter((a) => a !== last.id))
    setFinished(false)
    sfx.pop()
  }
  const reset = (): void => {
    setPos({})
    setMoves([])
    setArrival([])
    setFinished(false)
    setPodium(true)
    setBonus(false)
    setTurn(0)
    setHop({})
    setRematch(rematch + 1)
  }

  // Teclado: 1-6 hacen avanzar a ese equipo, B activa el bonus, Z o Retroceso deshace
  useEffect(() => {
    const onKey = (e: KeyboardEvent): void => {
      const tag = e.target instanceof HTMLElement ? e.target.tagName : 'BODY'
      if (/^(INPUT|TEXTAREA|SELECT)$/.test(tag)) return
      if (/^[1-6]$/.test(e.key) && players[Number(e.key) - 1])
        advance(players[Number(e.key) - 1].id)
      else if (e.key === 'b' || e.key === 'B') setBonus((b) => !b)
      else if (e.key === 'z' || e.key === 'Z' || e.key === 'Backspace') undo()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const ranking = useMemo(
    () =>
      [...players].sort((a, b) => {
        const d = (pos[b.id] ?? 0) - (pos[a.id] ?? 0)
        if (d) return d
        const ia = arrival.indexOf(a.id)
        const ib = arrival.indexOf(b.id)
        return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib)
      }),
    [players, pos, arrival]
  )
  const leaderPos = pos[ranking[0]?.id] ?? 0
  const current = players[turn % players.length]

  return (
    <div className={`g-stage cr-play ${withQuestions ? 'with-q' : ''}`}>
      {withQuestions && (
        <QuestionCard
          key={rematch}
          pool={pool}
          players={players}
          turns={prefs.questions === 'turns'}
          turn={turn}
          disabled={finished}
          onRight={() => {
            advance(current.id)
            setTurn(turn + 1)
          }}
          onWrong={() => setTurn(turn + 1)}
        />
      )}

      <div className="cr-track-col">
        <div
          className={`cr-lanes cr-${theme.id}`}
          style={{ '--cnt': players.length, '--L': L } as React.CSSProperties}
        >
          {players.map((p, i) => {
            const at = get(p.id)
            return (
              <div
                key={p.id}
                className={`cr-lane ${withQuestions && prefs.questions === 'turns' && p.id === current.id && !finished ? 'current' : ''}`}
                style={{ '--team': p.color } as React.CSSProperties}
              >
                <button
                  className="cr-label"
                  disabled={finished || at >= L}
                  onClick={() => advance(p.id)}
                  aria-label={`${p.name}: avanzar ${bonus ? 2 : 1} (tecla ${i + 1})`}
                >
                  <span className="cr-label-name">
                    <span aria-hidden>{p.emoji}</span> {p.name}
                  </span>
                  <span className="cr-label-go">{bonus ? '+2' : '+1'}</span>
                </button>
                <div className="cr-track">
                  <div className="cr-run">
                    <div className="cr-token" style={{ '--pos': at } as React.CSSProperties}>
                      <div key={hop[p.id] ?? 0} className={`cr-hop ${hop[p.id] ? 'go' : ''}`}>
                        <Token theme={theme.id} color={p.color} pos={at} />
                      </div>
                    </div>
                  </div>
                  <div className="cr-goal" aria-hidden>
                    {theme.finish}
                  </div>
                </div>
                <span className="cr-count">
                  {at}/{L}
                </span>
              </div>
            )
          })}
        </div>

        <div className="row cr-tools">
          <button
            className={`pill ${bonus ? 'selected' : ''}`}
            aria-pressed={bonus}
            onClick={() => setBonus(!bonus)}
          >
            ⭐ Bonus: el próximo avanza 2
          </button>
          <div className="row start">
            <button className="btn secondary small" onClick={undo} disabled={moves.length === 0}>
              ↩ Deshacer
            </button>
            <button className="btn secondary small" onClick={reset}>
              🔄 Empezar de nuevo
            </button>
            <button className="btn secondary small" onClick={onExit}>
              Salir
            </button>
          </div>
        </div>
        <p className="muted cr-hint">
          Pulsa el nombre del equipo que acertó (o su número del teclado). B: bonus · Z: deshacer
          {leaderPos > 0 && !finished ? ` · Va ganando ${ranking[0].emoji} ${ranking[0].name}` : ''}
        </p>
      </div>

      {finished && podium && (
        <Podium
          theme={theme}
          ranking={ranking}
          pos={pos}
          length={L}
          onAgain={reset}
          onSetup={onExit}
          onClose={() => setPodium(false)}
        />
      )}
      {finished && !podium && (
        <button className="btn cr-reopen" onClick={() => setPodium(true)}>
          🏆 Ver el podio
        </button>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ Preguntas */

interface Card {
  q: Question
  options: string[]
  answer: number
}
interface Deck {
  queue: Question[]
  card: Card
  number: number
}

function firstCard(pool: Question[]): Deck {
  const queue = shuffle(pool)
  const q = queue.shift() as Question
  return { queue, card: { q, ...shuffleOptions(q) }, number: 1 }
}

/** Saca la siguiente pregunta del mazo (si se acaban, se vuelven a mezclar todas) */
function nextCard(deck: Deck, pool: Question[]): Deck {
  const queue = deck.queue.length ? [...deck.queue] : shuffle(pool)
  const q = queue.shift() as Question
  return { queue, card: { q, ...shuffleOptions(q) }, number: deck.number + 1 }
}

function QuestionCard({
  pool,
  players,
  turns,
  turn,
  disabled,
  onRight,
  onWrong
}: {
  pool: Question[]
  players: Player[]
  turns: boolean
  turn: number
  disabled: boolean
  onRight: () => void
  onWrong: () => void
}): React.JSX.Element {
  const [deck, setDeck] = useState<Deck>(() => firstCard(pool))
  const [revealed, setRevealed] = useState(false)
  const { card: item, number } = deck
  const current = players[turn % players.length]
  const subject = subjectOf(item.q.subject)

  const next = (): void => {
    setDeck(nextCard(deck, pool))
    setRevealed(false)
  }
  const mainAction = (): void => {
    if (!revealed) {
      setRevealed(true)
      sfx.pop()
    } else if (!turns) next()
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent): void => {
      const tag = e.target instanceof HTMLElement ? e.target.tagName : 'BODY'
      if (tag !== 'BODY' || disabled) return
      if (e.key === ' ' || e.key === 'Enter' || e.key === 'ArrowRight') {
        e.preventDefault()
        mainAction()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  return (
    <div className="cr-q">
      <div className="row">
        <span className="g-badge">Pregunta {number}</span>
        <span className="g-badge">
          {subject.icon} {gradeLabel(item.q.grade)}
        </span>
      </div>
      {turns && (
        <p className="cr-turn" style={{ '--team': current.color } as React.CSSProperties}>
          Responde {current.emoji} {current.name}
        </p>
      )}
      <div className="g-question cr-qtext">{item.q.text}</div>
      <div className="g-options">
        {item.options.map((o, i) => (
          <div
            key={i}
            className={`g-option ${revealed ? (i === item.answer ? 'correct' : 'dim') : ''}`}
          >
            <span className="g-letter">{'ABCD'[i]}</span>
            {o}
          </div>
        ))}
      </div>
      {revealed && item.q.explanation && <p className="muted">{item.q.explanation}</p>}
      <div className="row start">
        {!revealed || !turns ? (
          <button className="btn big" onClick={mainAction} disabled={disabled}>
            {revealed ? 'Siguiente pregunta →' : 'Mostrar respuesta'}
          </button>
        ) : (
          <>
            <button className="btn big" disabled={disabled} onClick={() => (onRight(), next())}>
              ✅ Acertó
            </button>
            <button
              className="btn secondary big"
              disabled={disabled}
              onClick={() => (onWrong(), next())}
            >
              ❌ No acertó
            </button>
          </>
        )}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ Podio */

const MEDALS = ['🥇', '🥈', '🥉']

function Podium({
  theme,
  ranking,
  pos,
  length,
  onAgain,
  onSetup,
  onClose
}: {
  theme: Theme
  ranking: Player[]
  pos: Record<string, number>
  length: number
  onAgain: () => void
  onSetup: () => void
  onClose: () => void
}): React.JSX.Element {
  const confetti = useMemo(
    () =>
      Array.from({ length: 28 }, (_, i) => ({
        e: ['🎉', '✨', '🎊', '⭐'][i % 4],
        left: randomInt(0, 1000) / 10,
        delay: randomInt(0, 22) / 10,
        dur: 2.6 + randomInt(0, 20) / 10
      })),
    []
  )
  const top3 = ranking.slice(0, 3)
  // En el podio se ve 2.º – 1.º – 3.º
  const order = top3.length === 3 ? [1, 0, 2] : top3.length === 2 ? [1, 0] : [0]
  const winner = ranking[0]
  return (
    <div className="cr-podium" role="dialog" aria-label="Podio">
      {confetti.map((c, i) => (
        <span
          key={i}
          className="cr-confetti"
          aria-hidden
          style={{
            left: `${c.left}%`,
            animationDelay: `${c.delay}s`,
            animationDuration: `${c.dur}s`
          }}
        >
          {c.e}
        </span>
      ))}
      <p className="g-win">
        🏆 ¡{winner.emoji} {winner.name} {theme.goal}!
      </p>
      <div className="cr-steps">
        {order.map((rank) => {
          const p = top3[rank]
          return (
            <div
              key={p.id}
              className={`cr-step r${rank + 1}`}
              style={{ '--team': p.color } as React.CSSProperties}
            >
              <span className="cr-step-medal">{MEDALS[rank]}</span>
              <span className="cr-step-name">
                {p.emoji} {p.name}
              </span>
              <span className="cr-step-pos">
                {pos[p.id] ?? 0}/{length}
              </span>
              <div className="cr-step-block">{rank + 1}</div>
            </div>
          )
        })}
      </div>
      {ranking.length > 3 && (
        <p className="muted">
          {ranking
            .slice(3)
            .map((p, i) => `${i + 4}.º ${p.emoji} ${p.name} (${pos[p.id] ?? 0})`)
            .join(' · ')}
        </p>
      )}
      <div className="row">
        <button className="btn big" onClick={onAgain}>
          Revancha
        </button>
        <button className="btn secondary" onClick={onClose}>
          Ver la pista
        </button>
        <button className="btn secondary" onClick={onSetup}>
          Cambiar opciones
        </button>
      </div>
    </div>
  )
}
