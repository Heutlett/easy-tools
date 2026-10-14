import { useEffect, useRef, useState } from 'react'
import './style.css'
import { useQuestionBank } from '../../content/banks'
import type { Player } from '../../lib/games/players'
import { useLastGame } from '../../lib/games/lastGame'
import { useRecordSession } from '../../lib/games/ranking'
import { useGameChrome, useNav } from '../../lib/nav'
import { sfx } from '../../lib/games/sfx'
import { LADDER_10, LADDER_15, ladderFor } from './data'
import { buildLadder, colones, type TurnResult } from './logic'
import { music, useMood, useMusicSettings, type MusicControls } from './music'
import PickQuestions from './PickQuestions'
import Run from './Run'
import Wizard, { type Source } from './Setup'

type Phase =
  | { name: 'setup' }
  | { name: 'pick' }
  | { name: 'play'; source: Source; players: Player[]; round: number }

export default function Millonario(): React.JSX.Element {
  const [phase, setPhase] = useState<Phase>({ name: 'setup' })
  // Se pide una sola vez aquí y se pasa a donde haga falta
  const controls = useMusicSettings()
  const [picked, setPicked] = useState<string[]>([])
  const bank = useQuestionBank()
  const { place, patch } = useNav()
  const { played } = useLastGame()

  // Al salir del juego no queda nada sonando
  useEffect(() => () => music.stop(), [])
  useMood(phase.name === 'play' ? 'off' : 'menu')

  if (phase.name === 'setup') {
    const byId = new Map(bank.all.map((q) => [q.id, q]))
    const fixed = picked.flatMap((id) => byId.get(id) ?? [])
    return (
      <Wizard
        music={controls}
        fixed={fixed.length > 0 ? fixed : null}
        quick={place.quickPlay}
        onPick={() => setPhase({ name: 'pick' })}
        onStart={(source, players, summary) => {
          patch({ quickPlay: false })
          played('millonario', summary)
          setPhase({ name: 'play', source, players, round: 0 })
        }}
      />
    )
  }

  if (phase.name === 'pick')
    return (
      <PickQuestions
        initial={picked}
        onBack={() => setPhase({ name: 'setup' })}
        onDone={(questions) => {
          setPicked(questions.map((q) => q.id))
          setPhase({ name: 'setup' })
        }}
      />
    )

  return (
    <Contest
      key={phase.round}
      source={phase.source}
      players={phase.players}
      music={controls}
      onRestart={() => setPhase({ ...phase, round: phase.round + 1 })}
      onExit={() => setPhase({ name: 'setup' })}
    />
  )
}

type Stage = 'intro' | 'run' | 'result' | 'final'

function Contest({
  source,
  players,
  music: controls,
  onRestart,
  onExit
}: {
  source: Source
  players: Player[]
  music: MusicControls
  onRestart: () => void
  onExit: () => void
}): React.JSX.Element {
  // La partida ocupa toda la ventana, sin barra lateral ni encabezado
  useGameChrome({ ownHeader: true })
  // Con preguntas fijas, todos contestan las mismas (es lo justo); si no, cada quien recibe preguntas nuevas
  const fixed = source.kind === 'fixed'
  // Escalera de 15 si se pidió y hay preguntas; si no, la corta de 10
  const spec = fixed
    ? ladderFor(source.questions.length)
    : source.count >= 15
      ? LADDER_15
      : LADDER_10
  const pool = fixed ? source.questions : source.pool
  const [turn, setTurn] = useState(0)
  const [ladder, setLadder] = useState(() => (fixed ? pool : buildLadder(pool, [], spec)))
  const [usedIds, setUsedIds] = useState<string[]>(() => ladder.map((q) => q.id))
  const [stage, setStage] = useState<Stage>(players.length ? 'intro' : 'run')
  const [results, setResults] = useState<TurnResult[]>([])
  const player = players[turn] as Player | undefined
  const lastTurn = turn >= players.length - 1

  const finish = (r: Omit<TurnResult, 'playerId'>): void => {
    setResults([...results, { ...r, playerId: player?.id }])
    setStage('result')
    if (r.amount > 0) r.outcome === 'won' ? sfx.win() : sfx.correct()
    else sfx.wrong()
  }

  const nextTurn = (): void => {
    if (lastTurn) return setStage('final')
    if (!fixed) {
      const fresh = buildLadder(pool, usedIds, spec)
      setLadder(fresh)
      setUsedIds([...usedIds, ...fresh.map((q) => q.id)])
    }
    setTurn(turn + 1)
    setStage('intro')
  }

  if (stage === 'run')
    return (
      <Run
        key={turn}
        ladder={ladder}
        spec={spec}
        player={player}
        music={controls}
        onFinish={finish}
        onExit={onExit}
      />
    )

  if (stage === 'intro' && player)
    return (
      <Screen>
        <p className="mi-kicker">
          Concursante {turn + 1} de {players.length}
        </p>
        <p className="mi-big-emoji" aria-hidden>
          {player.emoji}
        </p>
        <h2 className="mi-name">{player.name}</h2>
        {fixed && <p className="mi-hint">Todos contestan las mismas preguntas.</p>}
        <Roster players={players} results={results} current={turn} />
        <div className="mi-row">
          <AutoButton className="mi-final" onClick={() => setStage('run')}>
            ¡A jugar! →
          </AutoButton>
          <button className="mi-walk" onClick={onExit}>
            Salir
          </button>
        </div>
        <p className="mi-hint">Teclas A, B, C y D para elegir · Enter para confirmar</p>
      </Screen>
    )

  const result = results[results.length - 1]

  if (stage === 'result' && result)
    return (
      <Screen>
        {player && (
          <p className="mi-kicker">
            {player.emoji} {player.name}
          </p>
        )}
        <h2 className="mi-name">
          {result.outcome === 'won'
            ? '🎉 ¡MILLONARIO!'
            : result.outcome === 'walked'
              ? 'Se retira con'
              : result.amount > 0
                ? 'Se queda en el nivel seguro'
                : 'No ganó premio esta vez'}
        </h2>
        <p className="mi-amount">{colones(result.amount)}</p>
        <p className="mi-detail">
          {result.outcome === 'lost'
            ? `Falló la pregunta ${result.lostAt} de ${ladder.length}`
            : result.outcome === 'walked'
              ? `Contestó ${result.answered} bien`
              : `¡Las ${ladder.length} preguntas bien!`}
        </p>
        <div className="mi-row">
          {player ? (
            <AutoButton className="mi-final" onClick={nextTurn}>
              {lastTurn ? 'Ver resultados →' : 'Siguiente concursante →'}
            </AutoButton>
          ) : (
            <>
              <AutoButton className="mi-final" onClick={onRestart}>
                Jugar otra vez
              </AutoButton>
              <button className="mi-walk" onClick={onExit}>
                Cambiar de preguntas
              </button>
            </>
          )}
        </div>
      </Screen>
    )

  return <Final players={players} results={results} onRestart={onRestart} onExit={onExit} />
}

function Screen({
  className = '',
  children
}: {
  className?: string
  children: React.ReactNode
}): React.JSX.Element {
  return <div className={`mi-tv mi-screen ${className}`}>{children}</div>
}

/** Botón principal de una pantalla: queda enfocado para que Enter lo active */
function AutoButton({
  className,
  onClick,
  children
}: {
  className: string
  onClick: () => void
  children: React.ReactNode
}): React.JSX.Element {
  const ref = useRef<HTMLButtonElement>(null)
  useEffect(() => ref.current?.focus(), [])
  return (
    <button ref={ref} className={className} onClick={onClick}>
      {children}
    </button>
  )
}

function Roster({
  players,
  results,
  current
}: {
  players: Player[]
  results: TurnResult[]
  current: number
}): React.JSX.Element {
  return (
    <ul className="mi-roster" aria-label="Concursantes">
      {players.map((p, i) => {
        const r = results.find((x) => x.playerId === p.id)
        return (
          <li key={p.id} className={i === current ? 'now' : r ? 'done' : ''}>
            <span aria-hidden>{p.emoji}</span> {p.name}
            {r && <b> {colones(r.amount)}</b>}
          </li>
        )
      })}
    </ul>
  )
}

/** Confeti del podio: cuadros y círculos de colores en posiciones fijas */
const CONFETTI = Array.from({ length: 34 }, (_, i) => ({
  x: (i * 37) % 100,
  y: (i * 53) % 70,
  size: 8 + (i % 4) * 4,
  radius: i % 3 ? '3px' : '50%',
  color: ['#e8644a', '#3b8fd9', '#f2b632', '#4fae6a', '#8a63d2', '#e46aa8', '#2aa3a0', '#e0a020'][
    i % 8
  ],
  turn: (i * 47) % 360
}))

function Final({
  players,
  results,
  onRestart,
  onExit
}: {
  players: Player[]
  results: TurnResult[]
  onRestart: () => void
  onExit: () => void
}): React.JSX.Element {
  const rows = players
    .map((p) => ({ p, r: results.find((x) => x.playerId === p.id) }))
    .sort((a, b) => (b.r?.amount ?? 0) - (a.r?.amount ?? 0))
  const top = rows[0]?.r?.amount ?? 0
  const winners = top > 0 ? rows.filter((x) => x.r?.amount === top) : []
  const tag = (r?: TurnResult): string =>
    !r
      ? ''
      : r.outcome === 'won'
        ? '¡Millonario!'
        : r.outcome === 'walked'
          ? 'Se retiró'
          : `Falló la ${r.lostAt}`

  useEffect(() => sfx.win(), [])

  // El resultado (lo que ganó cada quien, en colones) también va al ranking de juegos
  const record = useRecordSession()
  const recorded = useRef(false)
  useEffect(() => {
    if (recorded.current) return
    recorded.current = true
    record(results.flatMap((r) => (r.playerId ? [{ id: r.playerId, score: r.amount }] : [])))
  }, [record, results])

  // El podio muestra a los tres primeros (el segundo a la izquierda y el tercero a la derecha); los demás van en una lista
  const podium = rows.slice(0, 3)
  const order = podium.length === 3 ? [1, 0, 2] : podium.map((_, i) => i)
  const height = [210, 150, 110]
  // Solo se guarda en el ranking a quienes son estudiantes de un grupo
  const saved = results.some((r) => r.playerId && !r.playerId.startsWith('team-'))

  return (
    <Screen className="mi-final-screen">
      <div className="mi-confetti-layer" aria-hidden>
        {CONFETTI.map((c, i) => (
          <span
            key={i}
            className="mi-confetti"
            style={{
              left: `${c.x}%`,
              top: `${c.y}%`,
              width: c.size,
              height: c.size,
              borderRadius: c.radius,
              background: c.color,
              transform: `rotate(${c.turn}deg)`
            }}
          />
        ))}
      </div>
      <p className="mi-kicker">🏆 Resultados</p>
      <h2 className="mi-name big">
        {winners.length === 1
          ? `¡Ganaron ${winners[0].p.name}!`
          : winners.length > 1
            ? `Empate: ${winners.map((w) => w.p.name).join(' y ')}`
            : 'Nadie ganó premio'}
      </h2>
      <div className="mi-podium">
        {order.map((i) => {
          const { p, r } = podium[i]
          return (
            <div
              key={p.id}
              className="mi-place"
              style={{ '--team': p.color } as React.CSSProperties}
            >
              <span className="mi-place-emoji" style={{ fontSize: i === 0 ? 84 : 62 }} aria-hidden>
                {p.emoji}
              </span>
              <b className="mi-place-name">{p.name}</b>
              <span className="mi-place-amount">{colones(r?.amount ?? 0)}</span>
              <span className="mi-place-tag">{tag(r)}</span>
              <div className="mi-place-block" style={{ height: height[i] }}>
                {i + 1}
              </div>
            </div>
          )
        })}
      </div>
      {rows.length > 3 && (
        <ol className="mi-others" start={4} aria-label="Los demás">
          {rows.slice(3).map(({ p, r }) => (
            <li key={p.id} style={{ '--team': p.color } as React.CSSProperties}>
              {p.emoji} {p.name} · {colones(r?.amount ?? 0)}
            </li>
          ))}
        </ol>
      )}
      <div className="mi-final-actions">
        {saved && <span className="mi-saved">✅ Guardado en el ranking</span>}
        <AutoButton className="mi-final" onClick={onRestart}>
          Jugar otra vez
        </AutoButton>
        <button className="mi-walk" onClick={onExit}>
          Cambiar preguntas
        </button>
      </div>
    </Screen>
  )
}
