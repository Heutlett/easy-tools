import { useEffect, useRef, useState } from 'react'
import './style.css'
import type { Question } from '../../content/types'
import type { Player } from '../../lib/games/players'
import { sfx } from '../../lib/games/sfx'
import { LADDER_10, LADDER_15, ladderFor } from './data'
import { buildLadder, colones, type TurnResult } from './logic'
import { music, useMood, useMusicSettings, type MusicControls } from './music'
import PickQuestions from './PickQuestions'
import Run from './Run'
import { StepPlayers, StepQuestions } from './Setup'

/** Lo que se eligió en el paso 1: o un grupo de preguntas del que la app arma la escalera, o preguntas fijas */
type Source =
  { kind: 'auto'; pool: Question[]; count: number } | { kind: 'fixed'; questions: Question[] }

type Phase =
  | { name: 'questions' }
  | { name: 'pick' }
  | { name: 'players'; source: Source }
  | { name: 'play'; source: Source; players: Player[]; round: number }

export default function Millonario(): React.JSX.Element {
  const [phase, setPhase] = useState<Phase>({ name: 'questions' })
  // Se pide una sola vez aquí y se pasa a donde haga falta
  const controls = useMusicSettings()
  const [picked, setPicked] = useState<string[]>([])

  // Al salir del juego no queda nada sonando
  useEffect(() => () => music.stop(), [])
  useMood(phase.name === 'play' ? 'off' : 'menu')

  if (phase.name === 'questions')
    return (
      <StepQuestions
        onAuto={(pool, count) =>
          setPhase({ name: 'players', source: { kind: 'auto', pool, count } })
        }
        onPick={() => setPhase({ name: 'pick' })}
      />
    )

  if (phase.name === 'pick')
    return (
      <PickQuestions
        initial={picked}
        onBack={() => setPhase({ name: 'questions' })}
        onDone={(questions) => {
          setPicked(questions.map((q) => q.id))
          setPhase({ name: 'players', source: { kind: 'fixed', questions } })
        }}
      />
    )

  if (phase.name === 'players') {
    const s = phase.source
    return (
      <StepPlayers
        summary={
          s.kind === 'fixed'
            ? `✋ Elegiste ${s.questions.length} preguntas.`
            : `🎯 ${Math.min(s.count, s.pool.length)} preguntas de entre ${s.pool.length} posibles.`
        }
        music={controls}
        onBack={() => setPhase(s.kind === 'fixed' ? { name: 'pick' } : { name: 'questions' })}
        onStart={(players) => setPhase({ name: 'play', source: s, players, round: 0 })}
      />
    )
  }

  return (
    <Contest
      key={phase.round}
      source={phase.source}
      players={phase.players}
      music={controls}
      onRestart={() => setPhase({ ...phase, round: phase.round + 1 })}
      onExit={() =>
        setPhase(phase.source.kind === 'fixed' ? { name: 'pick' } : { name: 'questions' })
      }
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

function Screen({ children }: { children: React.ReactNode }): React.JSX.Element {
  return <div className="mi-tv mi-screen">{children}</div>
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

  return (
    <Screen>
      <p className="mi-kicker">🏆 Resultados</p>
      <h2 className="mi-name">
        {winners.length === 1
          ? `Ganó ${winners[0].p.emoji} ${winners[0].p.name}`
          : winners.length > 1
            ? `Empate: ${winners.map((w) => w.p.name).join(' y ')}`
            : 'Nadie ganó premio'}
      </h2>
      <ol className="mi-table">
        {rows.map(({ p, r }) => (
          <li
            key={p.id}
            className={r && r.amount === top && top > 0 ? 'top' : ''}
            style={{ '--team': p.color } as React.CSSProperties}
          >
            <span className="mi-t-name">
              {p.emoji} {p.name}
            </span>
            <span className="mi-t-tag">{tag(r)}</span>
            <span className="mi-t-amount">{colones(r?.amount ?? 0)}</span>
          </li>
        ))}
      </ol>
      <div className="mi-row">
        <AutoButton className="mi-final" onClick={onRestart}>
          Jugar otra vez
        </AutoButton>
        <button className="mi-walk" onClick={onExit}>
          Cambiar de preguntas
        </button>
      </div>
    </Screen>
  )
}
