import { useEffect, useMemo, useState } from 'react'
import './style.css'
import PlayerSetup from '../../components/games/PlayerSetup'
import Scoreboard from '../../components/games/Scoreboard'
import { useScores, type Player } from '../../lib/games/players'
import { sfx } from '../../lib/games/sfx'
import { pick } from '../../lib/games/shuffle'
import { usePersistentState } from '../../lib/usePersistentState'
import { BANDS, bandAllows, type BandId } from '../_adivinar/bands'
import { Chips, DeckGrid, SetupRow } from '../_adivinar/ui'
import { QUIEN_DECKS, type Clue5 } from './data'

const CLASS_PLAYER: Player = { id: 'clase', name: 'Toda la clase', color: '#0f766e', emoji: '🏫' }
const MAX_CLUES = 5

interface Config {
  pool: Clue5[]
  count: number
}

type Phase =
  | { name: 'setup' }
  | { name: 'players'; config: Config }
  | { name: 'play'; config: Config; players: Player[] }

export default function QuienSoy(): React.JSX.Element {
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
  const [band, setBand] = usePersistentState<BandId>('game:quien-soy:band', 'all')
  const [count, setCount] = usePersistentState('game:quien-soy:count', 10)
  const [selected, setSelected] = usePersistentState<string[]>(
    'game:quien-soy:decks',
    QUIEN_DECKS.map((d) => d.id)
  )

  const infos = QUIEN_DECKS.map((d) => ({
    id: d.id,
    title: d.title,
    icon: d.icon,
    count: d.cards.filter((c) => bandAllows(band, c.level)).length
  }))
  const pool = useMemo(
    () =>
      QUIEN_DECKS.filter((d) => selected.includes(d.id)).flatMap((d) =>
        d.cards.filter((c) => bandAllows(band, c.level))
      ),
    [selected, band]
  )
  const counts = [5, 10, 15, 20]

  return (
    <section className="panel ad-setup">
      <SetupRow label="Grado">
        <Chips
          label="Grado"
          value={band}
          onChange={setBand}
          options={BANDS.map((b) => ({ value: b.id, label: b.label }))}
        />
      </SetupRow>
      <SetupRow label="Temas">
        <DeckGrid decks={infos} selected={selected} onChange={setSelected} />
      </SetupRow>
      <SetupRow label="Cuántas fichas">
        <Chips
          label="Cantidad de fichas"
          value={count}
          onChange={setCount}
          options={counts.map((n) => ({ value: n, label: String(n) }))}
        />
      </SetupRow>
      <div className="row start">
        <button
          className="btn big"
          disabled={pool.length < 3}
          onClick={() => onStart({ pool, count })}
        >
          Siguiente →
        </button>
        <span className="muted">
          {pool.length < 3 ? 'Elige al menos un tema' : `${pool.length} fichas disponibles`}
        </span>
      </div>
    </section>
  )
}

interface Done {
  card: Clue5
  pts: number
}

function Play({
  config,
  players,
  onExit
}: {
  config: Config
  players: Player[]
  onExit: () => void
}): React.JSX.Element {
  const teams = players.length > 0
  const roster = teams ? players : [CLASS_PLAYER]
  const [cards, setCards] = useState(() => pick(config.pool, config.count))
  const [index, setIndex] = useState(0)
  const [shown, setShown] = useState(1)
  const [revealed, setRevealed] = useState(false)
  const [winner, setWinner] = useState<Player | null>(null)
  const [done, setDone] = useState<Done[]>([])
  const [finished, setFinished] = useState(false)
  const { scores, add, reset, ranking, leaders } = useScores(roster)

  const card = cards[index]
  const worth = MAX_CLUES + 1 - shown
  const last = index + 1 >= cards.length

  const moreClues = (): void => {
    if (shown >= MAX_CLUES) return
    setShown(shown + 1)
    sfx.pop()
  }
  const reveal = (who: Player | null): void => {
    setWinner(who)
    setRevealed(true)
    if (who) {
      add(who.id, worth)
      sfx.correct()
    } else sfx.wrong()
    setDone((d) => [...d, { card, pts: who ? worth : 0 }])
  }
  const next = (): void => {
    if (last) {
      setFinished(true)
      sfx.win()
      return
    }
    setIndex(index + 1)
    setShown(1)
    setRevealed(false)
    setWinner(null)
  }
  const restart = (): void => {
    reset()
    setCards(pick(config.pool, config.count))
    setIndex(0)
    setShown(1)
    setRevealed(false)
    setWinner(null)
    setDone([])
    setFinished(false)
  }

  // Teclado: Espacio, Enter o flecha derecha = otra pista (o la siguiente ficha); R = revelar sin puntos
  useEffect(() => {
    if (finished) return
    const onKey = (e: KeyboardEvent): void => {
      const tag = e.target instanceof HTMLElement ? e.target.tagName : 'BODY'
      if (/^(INPUT|TEXTAREA|SELECT)$/.test(tag)) return
      const arrow = e.key === 'ArrowRight' || e.key === 'PageDown'
      const confirm = (e.key === ' ' || e.key === 'Enter') && tag === 'BODY'
      if (arrow || confirm) {
        e.preventDefault()
        if (revealed) next()
        else moreClues()
      } else if (e.key.toLowerCase() === 'r' && !revealed && !e.repeat) {
        reveal(null)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  if (finished) {
    const total = done.reduce((sum, d) => sum + d.pts, 0)
    return (
      <div className="g-stage g-center">
        <p className="g-win">🎉 ¡Terminamos!</p>
        {teams ? (
          <>
            <p className="qs-winner">
              {leaders.length === 1
                ? `Ganó ${leaders[0].emoji} ${leaders[0].name}`
                : leaders.length > 1
                  ? `Empate: ${leaders.map((l) => l.name).join(' y ')}`
                  : 'Nadie sumó puntos'}
            </p>
            <Scoreboard players={ranking} scores={scores} />
          </>
        ) : (
          <p className="qs-winner">
            La clase sumó {total} de {cards.length * MAX_CLUES} puntos
          </p>
        )}
        <div className="qs-review" aria-label="Repaso">
          {done.map((d, i) => (
            <span key={i} className={`qs-review-item ${d.pts > 0 ? 'hit' : ''}`}>
              <span aria-hidden>{d.card.emoji}</span>
              <span>{d.card.answer}</span>
              {d.pts > 0 && <span>+{d.pts}</span>}
            </span>
          ))}
        </div>
        <div className="row start">
          <button className="btn big" onClick={restart}>
            Jugar otra vez
          </button>
          <button className="btn secondary" onClick={onExit}>
            Cambiar de temas
          </button>
        </div>
      </div>
    )
  }

  const header = (
    <div className="qs-top">
      <span className="g-badge">
        Ficha {index + 1} / {cards.length}
      </span>
      {!teams && <span className="g-badge">⭐ {scores[CLASS_PLAYER.id] ?? 0}</span>}
      <button className="btn secondary small" onClick={onExit}>
        Salir
      </button>
    </div>
  )

  const clueList = (small: boolean): React.JSX.Element => (
    <ol className={`qs-clues ${small ? 'small' : ''}`}>
      {card.clues.map((clue, i) => {
        const open = i < shown
        return (
          <li
            key={i}
            className={`qs-clue ${open ? 'open' : 'locked'} ${open && i === shown - 1 && !revealed ? 'fresh' : ''}`}
          >
            <span className="qs-num">{i + 1}</span>
            <span>{open ? clue : '🔒 Pista bloqueada'}</span>
          </li>
        )
      })}
    </ol>
  )

  const board = teams && (
    <div className="qs-board">
      <Scoreboard players={players} scores={scores} onAdd={add} compact />
    </div>
  )

  if (revealed) {
    return (
      <div className="g-stage">
        {header}
        <div className="qs-reveal">
          <div className="qs-emoji" aria-hidden>
            {card.emoji}
          </div>
          <div>
            <p className="qs-answer">{card.answer}</p>
            {card.variants.length > 0 && (
              <p className="qs-also">También vale: {card.variants.join(' · ')}</p>
            )}
            <p className="qs-fact">💡 {card.fact}</p>
            {winner ? (
              <span className="qs-points">
                {winner.emoji} {winner.name}: +{worth} {worth === 1 ? 'punto' : 'puntos'}
              </span>
            ) : (
              <span className="qs-points none">Sin puntos esta vez</span>
            )}
          </div>
        </div>
        <div className="qs-actions">
          <button className="btn big" onClick={next}>
            {last ? 'Ver resultados' : 'Siguiente ficha →'}
          </button>
        </div>
        {board}
        <p className="muted qs-hint">Espacio o flecha →: continuar</p>
      </div>
    )
  }

  return (
    <div className="g-stage">
      {header}
      <div className="qs-head">
        <span className="qs-title">🕵️‍♂️ ¿Quién soy?</span>
        <span className="qs-worth">
          Vale <b>{worth}</b> {worth === 1 ? 'punto' : 'puntos'}
        </span>
      </div>
      {clueList(false)}
      <div className="qs-actions">
        <button className="btn big" disabled={shown >= MAX_CLUES} onClick={moreClues}>
          {shown >= MAX_CLUES ? 'Ya no hay más pistas' : '💡 Otra pista'}
        </button>
        {!teams && (
          <button className="btn big qs-ok" onClick={() => reveal(CLASS_PLAYER)}>
            ✅ ¡Adivinaron!
          </button>
        )}
        <button className="btn big secondary" onClick={() => reveal(null)}>
          👀 Revelar
        </button>
      </div>
      {teams && (
        <div className="qs-who" role="group" aria-label="Quién adivinó">
          <span className="qs-who-label">¿Quién adivinó?</span>
          {players.map((p) => (
            <button
              key={p.id}
              className="qs-team"
              style={{ '--team': p.color } as React.CSSProperties}
              onClick={() => reveal(p)}
            >
              <span aria-hidden>{p.emoji}</span> {p.name}
            </button>
          ))}
        </div>
      )}
      {board}
      <p className="muted qs-hint">Espacio o flecha →: otra pista · R: revelar</p>
    </div>
  )
}
