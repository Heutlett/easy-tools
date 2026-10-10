import { useEffect, useRef, useState } from 'react'
import Scoreboard from '../../components/games/Scoreboard'
import { gradeLabel, subjectOf } from '../../content/subjects'
import { useScores, type Player } from '../../lib/games/players'
import { sfx } from '../../lib/games/sfx'
import { VALUES, buildBoard, type Category, type Settings } from './board'
import Clue from './Clue'

interface Props {
  players: Player[]
  categories: Category[]
  settings: Settings
  /** Empezar de nuevo con el mismo tablero (otras preguntas) */
  onRestart: () => void
  onChangeBoard: () => void
  onExit: () => void
}

type Spot = { c: number; r: number }

/** Un botón que pide una segunda pulsación para no perder la partida por accidente */
function ConfirmButton({
  label,
  onConfirm
}: {
  label: string
  onConfirm: () => void
}): React.JSX.Element {
  const [armed, setArmed] = useState(false)
  useEffect(() => {
    if (!armed) return
    const id = setTimeout(() => setArmed(false), 3000)
    return () => clearTimeout(id)
  }, [armed])
  return (
    <button
      className={`btn small ${armed ? 'danger' : 'secondary'}`}
      onClick={() => (armed ? onConfirm() : setArmed(true))}
    >
      {armed ? '¿Seguro?' : label}
    </button>
  )
}

export default function Play({
  players,
  categories,
  settings,
  onRestart,
  onChangeBoard,
  onExit
}: Props): React.JSX.Element {
  const [board] = useState(() => buildBoard(categories, settings.doubles))
  const [used, setUsed] = useState<string[]>([])
  const [turn, setTurn] = useState(0)
  const [active, setActive] = useState<Spot | null>(null)
  const [last, setLast] = useState<Spot | null>(null)
  const [answerer, setAnswerer] = useState(players[0].id)
  const [finished, setFinished] = useState(false)
  const [adjust, setAdjust] = useState(false)
  const { scores, add, ranking, leaders } = useScores(players)
  const cellRefs = useRef<Record<string, HTMLButtonElement | null>>({})
  const total = board.length * VALUES.length
  const current = players[turn]
  const taken = (c: number, r: number): boolean => used.includes(`${c}-${r}`)

  // Al volver al tablero, el foco queda en la siguiente casilla libre (de la misma columna si hay)
  useEffect(() => {
    if (active || finished) return
    const column = last?.c ?? 0
    const order = [
      ...VALUES.map((_, r) => ({ c: column, r })),
      ...board.flatMap((_, c) => VALUES.map((__, r) => ({ c, r })))
    ]
    const spot = order.find((s) => !used.includes(`${s.c}-${s.r}`))
    if (last && spot) cellRefs.current[`${spot.c}-${spot.r}`]?.focus()
    // Solo cuando cambia lo que se muestra
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, finished])

  // Flechas: moverse por el tablero (Enter o Espacio abren la casilla seleccionada, como cualquier botón)
  useEffect(() => {
    if (active || finished) return
    const onKey = (e: KeyboardEvent): void => {
      const delta: Record<string, [number, number]> = {
        ArrowRight: [1, 0],
        ArrowLeft: [-1, 0],
        ArrowDown: [0, 1],
        ArrowUp: [0, -1]
      }
      const step = delta[e.key]
      if (!step) return
      const tag = e.target instanceof HTMLElement ? e.target.tagName : 'BODY'
      if (/^(INPUT|TEXTAREA|SELECT)$/.test(tag)) return
      e.preventDefault()
      const focused = Object.entries(cellRefs.current).find(
        ([, el]) => el === document.activeElement
      )
      let [c, r] = focused ? focused[0].split('-').map(Number) : [0, -1]
      for (let n = 0; n < board.length * VALUES.length; n++) {
        c += step[0]
        r += step[1]
        if (c < 0 || c >= board.length || r < 0 || r >= VALUES.length) return
        const el = cellRefs.current[`${c}-${r}`]
        if (el && !el.disabled) return el.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const open = (c: number, r: number): void => {
    sfx.pop()
    setAnswerer(current.id)
    setActive({ c, r })
  }

  const done = (winner: string | null): void => {
    if (!active) return
    const next = [...used, `${active.c}-${active.r}`]
    setUsed(next)
    const index = winner && settings.keepTurn ? players.findIndex((p) => p.id === winner) : turn + 1
    setTurn(index % players.length)
    setLast(active)
    setActive(null)
    if (next.length === total) finish()
  }

  const finish = (): void => {
    setActive(null)
    setFinished(true)
    sfx.win()
  }

  if (finished) {
    return (
      <div className="g-stage g-center cq-end">
        <p className="g-win">🏆 ¡Terminó el concurso!</p>
        <p className="cq-winner">
          {leaders.length === 1
            ? `Ganó ${leaders[0].emoji} ${leaders[0].name}`
            : leaders.length > 1
              ? `Empate: ${leaders.map((l) => l.name).join(' y ')}`
              : 'Nadie sumó puntos'}
        </p>
        <Scoreboard players={ranking} scores={scores} />
        <div className="row start">
          <button className="btn big" onClick={onRestart}>
            Jugar otra vez
          </button>
          <button className="btn secondary" onClick={onChangeBoard}>
            Cambiar el tablero
          </button>
          <button className="btn secondary" onClick={onExit}>
            Salir
          </button>
        </div>
      </div>
    )
  }

  const cell = active ? board[active.c].cells[active.r] : null
  return (
    <div className="cq-play">
      <div className="cq-top">
        <Scoreboard
          players={players}
          scores={scores}
          currentId={active ? answerer : current.id}
          compact
          step={100}
          onAdd={adjust ? (id, delta) => add(id, delta, true) : undefined}
        />
      </div>
      <div className="cq-bar">
        {active ? (
          <span />
        ) : (
          <p className="cq-turn" style={{ color: current.color }}>
            {current.emoji} Turno de {current.name}: elige una casilla
          </p>
        )}
        <div className="cq-tools">
          <button
            className={`btn small ${adjust ? '' : 'secondary'}`}
            aria-pressed={adjust}
            onClick={() => setAdjust(!adjust)}
          >
            ✏️ Ajustar puntos
          </button>
          <ConfirmButton label="🏁 Terminar" onConfirm={finish} />
          <ConfirmButton label="↺ Reiniciar" onConfirm={onRestart} />
          <ConfirmButton label="🧩 Cambiar tablero" onConfirm={onChangeBoard} />
          <ConfirmButton label="Salir" onConfirm={onExit} />
        </div>
      </div>

      {active && cell ? (
        <Clue
          key={`${active.c}-${active.r}`}
          category={board[active.c].category}
          cell={cell}
          players={players}
          asker={current}
          answerer={answerer}
          setAnswerer={setAnswerer}
          scores={scores}
          settings={settings}
          onScore={(id, delta) => add(id, delta, true)}
          onDone={done}
          onCancel={() => setActive(null)}
        />
      ) : (
        <>
          <div
            className="cq-board"
            style={{ '--cols': board.length, '--rows': VALUES.length } as React.CSSProperties}
          >
            {board.map((col, c) => {
              const subject = subjectOf(col.category.subject)
              return (
                <div
                  key={col.category.key}
                  className="cq-head"
                  style={
                    { '--cat': subject.color, gridColumn: c + 1, gridRow: 1 } as React.CSSProperties
                  }
                >
                  <span className="cq-head-topic">{col.category.topic}</span>
                  <span className="cq-head-sub">
                    {subject.icon} {gradeLabel(col.category.grade)}
                  </span>
                </div>
              )
            })}
            {board.map((col, c) =>
              col.cells.map((cl, r) => (
                <button
                  key={`${c}-${r}`}
                  ref={(el) => {
                    cellRefs.current[`${c}-${r}`] = el
                  }}
                  className="cq-cell"
                  style={
                    {
                      '--cat': subjectOf(col.category.subject).color,
                      gridColumn: c + 1,
                      gridRow: r + 2
                    } as React.CSSProperties
                  }
                  disabled={taken(c, r)}
                  aria-label={`${col.category.topic}, ${cl.value} puntos`}
                  onClick={() => open(c, r)}
                >
                  {taken(c, r) ? '' : cl.value}
                </button>
              ))
            )}
          </div>
        </>
      )}
    </div>
  )
}
