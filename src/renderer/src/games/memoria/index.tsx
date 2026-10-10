import { useEffect, useMemo, useRef, useState } from 'react'
import './style.css'
import '../_palabras/palabras.css'
import PlayerSetup from '../../components/games/PlayerSetup'
import { PairListPicker } from '../../components/games/Pickers'
import Scoreboard from '../../components/games/Scoreboard'
import type { PairList } from '../../content/types'
import { useScores, type Player } from '../../lib/games/players'
import { sfx } from '../../lib/games/sfx'
import { shuffle } from '../../lib/games/shuffle'
import { usePersistentState } from '../../lib/usePersistentState'
import ChipRow from '../_palabras/Chips'
import { countOptions, fitCount } from '../_palabras/text'

interface Card {
  /** Posición en la mesa */
  id: number
  /** Número de la pareja a la que pertenece */
  pair: number
  text: string
}

/** Columnas según cuántas parejas hay, para que siempre quede una cuadrícula completa (de 4×3 a 5×4) */
const COLUMNS: Record<number, number> = { 2: 2, 3: 3, 4: 4, 5: 5, 6: 4, 7: 7, 8: 4, 9: 6, 10: 5 }
const columnsFor = (pairs: number): number => COLUMNS[pairs] ?? 5

function deal(list: PairList, pairs: number): Card[] {
  const chosen = shuffle(list.pairs).slice(0, pairs)
  return shuffle(
    chosen.flatMap(([a, b], pair) => [
      { pair, text: a },
      { pair, text: b }
    ])
  ).map((c, id) => ({ ...c, id }))
}

type Phase =
  | { name: 'lists' }
  | { name: 'setup'; list: PairList }
  | { name: 'play'; run: number; list: PairList; pairs: number; players: Player[] }

export default function Memory(): React.JSX.Element {
  const [phase, setPhase] = useState<Phase>({ name: 'lists' })

  if (phase.name === 'lists')
    return (
      <PairListPicker
        startLabel="Siguiente →"
        onStart={(list) => setPhase({ name: 'setup', list })}
      />
    )

  if (phase.name === 'setup')
    return (
      <Setup
        list={phase.list}
        onBack={() => setPhase({ name: 'lists' })}
        onStart={(players, pairs) =>
          setPhase({ name: 'play', run: 0, list: phase.list, pairs, players })
        }
      />
    )

  return (
    <Board
      key={phase.run}
      list={phase.list}
      pairs={phase.pairs}
      players={phase.players}
      onRestart={() => setPhase({ ...phase, run: phase.run + 1 })}
      onChange={() => setPhase({ name: 'lists' })}
    />
  )
}

function Setup({
  list,
  onStart,
  onBack
}: {
  list: PairList
  onStart: (players: Player[], pairs: number) => void
  onBack: () => void
}): React.JSX.Element {
  const [saved, setSaved] = usePersistentState('game:memoria:pairs', 6)
  const available = list.pairs.length
  if (available < 2)
    return (
      <div className="g-stage">
        <p className="notice">Esta lista necesita al menos 2 parejas para jugar.</p>
        <button className="btn secondary mm-return" onClick={onBack}>
          ← Elegir otra lista
        </button>
      </div>
    )
  const options = countOptions(Math.min(available, 10), [6, 8, 10])
  const pairs = fitCount(saved, options)
  return (
    <div className="g-stage">
      <div className="row start">
        <button className="btn secondary mm-return" onClick={onBack}>
          ← Elegir otra lista
        </button>
        <span className="g-badge">{list.title}</span>
      </div>
      {options.length > 1 && (
        <section className="panel pw-options">
          <ChipRow
            label="Cuántas parejas"
            value={pairs}
            options={options.map((n) => ({ value: n, label: `${n} (${2 * n} cartas)` }))}
            onChange={setSaved}
          />
        </section>
      )}
      <PlayerSetup optional onStart={(players) => onStart(players, pairs)} />
    </div>
  )
}

const isEmojiOnly = (text: string): boolean =>
  text.replace(/\p{Extended_Pictographic}|\p{Regional_Indicator}|\u200d|\ufe0f|\u20e3|\s/gu, '') ===
  ''

/** Tamaño de letra (rem) para que el texto quepa en la carta según su largo y cuántas filas hay */
function fontFor(text: string, rows: number): string {
  const scale = rows <= 2 ? 1.3 : rows === 3 ? 1.1 : 1
  if (isEmojiOnly(text)) return `${(rows <= 2 ? 4.2 : rows === 3 ? 3.4 : 2.7).toFixed(2)}rem`
  const len = Array.from(text).length
  const base =
    len <= 5 ? 2 : len <= 9 ? 1.65 : len <= 14 ? 1.35 : len <= 22 ? 1.15 : len <= 34 ? 0.98 : 0.82
  return `${(base * scale).toFixed(2)}rem`
}

const formatTime = (s: number): string => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

function Board({
  list,
  pairs,
  players,
  onRestart,
  onChange
}: {
  list: PairList
  pairs: number
  players: Player[]
  onRestart: () => void
  onChange: () => void
}): React.JSX.Element {
  const cards = useMemo(() => deal(list, pairs), [list, pairs])
  const cols = columnsFor(pairs)
  const rows = Math.ceil(cards.length / cols)
  const [open, setOpen] = useState<number[]>([])
  const [matched, setMatched] = useState<Record<number, string>>({})
  const [tries, setTries] = useState(0)
  const [turn, setTurn] = useState(0)
  const [seconds, setSeconds] = useState(0)
  const [started, setStarted] = useState(false)
  const [finished, setFinished] = useState(false)
  const { scores, add, ranking, leaders } = useScores(players)
  const gridRef = useRef<HTMLDivElement>(null)
  const current = players.length > 0 ? players[turn % players.length] : undefined
  const found = Object.keys(matched).length

  // Cuando hay dos cartas boca arriba se revisa si son pareja
  useEffect(() => {
    if (open.length !== 2) return
    const [a, b] = open
    const isMatch = cards[a].pair === cards[b].pair
    const sound = setTimeout(() => (isMatch ? sfx.correct() : sfx.wrong()), 450)
    const resolve = setTimeout(
      () => {
        if (isMatch) {
          setMatched((m) => ({ ...m, [cards[a].pair]: current?.color ?? 'var(--success)' }))
          if (current) add(current.id, 1)
        } else if (players.length > 0) setTurn((t) => t + 1)
        setOpen([])
      },
      isMatch ? 1000 : 1500
    )
    return () => {
      clearTimeout(sound)
      clearTimeout(resolve)
    }
  }, [open, cards, current, add, players.length])

  // Termina cuando están todas las parejas
  useEffect(() => {
    if (found !== pairs) return
    const id = setTimeout(() => {
      setFinished(true)
      sfx.win()
    }, 700)
    return () => clearTimeout(id)
  }, [found, pairs])

  // Cronómetro: arranca con la primera carta y se detiene al terminar
  useEffect(() => {
    if (!started || finished) return
    const id = setInterval(() => setSeconds((s) => s + 1), 1000)
    return () => clearInterval(id)
  }, [started, finished])

  const flip = (id: number): void => {
    if (open.length >= 2 || open.includes(id) || cards[id].pair in matched) return
    sfx.pop()
    setStarted(true)
    if (open.length === 1) setTries((t) => t + 1)
    setOpen([...open, id])
  }

  // Con el teclado: las flechas mueven entre cartas; Enter o Espacio voltean la carta seleccionada
  const onGridKey = (e: React.KeyboardEvent): void => {
    const delta: Record<string, number> = {
      ArrowRight: 1,
      ArrowLeft: -1,
      ArrowDown: cols,
      ArrowUp: -cols
    }
    if (!(e.key in delta) || !gridRef.current) return
    const buttons = Array.from(
      gridRef.current.querySelectorAll<HTMLButtonElement>('button.mm-card')
    )
    const at = buttons.indexOf(document.activeElement as HTMLButtonElement)
    const to = Math.max(0, Math.min(buttons.length - 1, (at < 0 ? 0 : at) + delta[e.key]))
    e.preventDefault()
    buttons[to]?.focus()
  }

  if (finished) {
    return (
      <div className="g-stage g-center">
        <p className="g-win">🎉 ¡Encontraron todas las parejas!</p>
        {players.length > 0 ? (
          <>
            <p className="mm-final">
              {leaders.length === 1
                ? `Ganó ${leaders[0].emoji} ${leaders[0].name}`
                : leaders.length > 1
                  ? `Empate: ${leaders.map((l) => l.name).join(' y ')}`
                  : ''}
            </p>
            <Scoreboard players={ranking} scores={scores} />
          </>
        ) : (
          <p className="mm-final">
            {tries} intentos · ⏱ {formatTime(seconds)}
          </p>
        )}
        <div className="row start">
          <button className="btn big" autoFocus onClick={onRestart}>
            Jugar otra vez
          </button>
          <button className="btn secondary" onClick={onChange}>
            Cambiar de lista
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="g-stage mm">
      <div className="row mm-top">
        <div className="row start">
          <span className="g-badge">
            ✅ {found} / {pairs}
          </span>
          {current ? (
            <span className="g-badge mm-turn" style={{ borderColor: current.color }}>
              Turno: {current.emoji} {current.name}
            </span>
          ) : (
            <span className="g-badge">
              Intentos: {tries} · ⏱ {formatTime(seconds)}
            </span>
          )}
        </div>
        <div className="row start">
          <button className="btn secondary" onClick={onRestart}>
            🔀 Mezclar y reiniciar
          </button>
          <button className="btn secondary" onClick={onChange}>
            Salir
          </button>
        </div>
      </div>

      <div
        ref={gridRef}
        className="mm-grid"
        lang="es"
        role="group"
        aria-label="Cartas"
        onKeyDown={onGridKey}
        style={
          {
            '--cols': cols,
            '--card-h': `${rows >= 4 ? (players.length > 0 ? 88 : 104) : rows === 3 ? 124 : 170}px`
          } as React.CSSProperties
        }
      >
        {cards.map((card) => {
          const isMatched = card.pair in matched
          const faceUp = isMatched || open.includes(card.id)
          return (
            <button
              key={card.id}
              className={`mm-card ${faceUp ? 'up' : ''} ${isMatched ? 'matched' : ''}`}
              style={
                isMatched ? ({ '--owner': matched[card.pair] } as React.CSSProperties) : undefined
              }
              autoFocus={card.id === 0}
              aria-label={faceUp ? card.text : 'Carta boca abajo'}
              aria-pressed={faceUp}
              onClick={() => flip(card.id)}
            >
              <span className="mm-inner">
                <span className="mm-face mm-back" aria-hidden>
                  ?
                </span>
                <span className="mm-face mm-front" style={{ fontSize: fontFor(card.text, rows) }}>
                  {card.text}
                </span>
              </span>
            </button>
          )
        })}
      </div>

      {players.length > 0 && (
        <Scoreboard players={players} scores={scores} currentId={current?.id} compact />
      )}
    </div>
  )
}
