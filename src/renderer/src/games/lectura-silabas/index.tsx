import { useEffect, useMemo, useRef, useState } from 'react'
import './style.css'
import PlayerSetup from '../../components/games/PlayerSetup'
import Scoreboard from '../../components/games/Scoreboard'
import { useScores, type Player } from '../../lib/games/players'
import { pick, shuffle } from '../../lib/games/shuffle'
import { sfx } from '../../lib/games/sfx'
import { useVoice } from '../../lib/games/useVoice'
import { usePersistentState } from '../../lib/usePersistentState'
import { noFocusedButton, useKeys } from '../_lectura/keys'
import { Burst, Choice, EndScreen, OptionRow, TopBar } from '../_lectura/ui'
import { LARGAS, LEVELS, MONOSILABAS, WORDS, wordText, type LevelId, type Word } from './data'

type Kind = 'build' | 'count'
interface Config {
  kind: Kind
  levels: LevelId[]
  /** 0 = todas; 2, 3 o 4 sílabas (4 incluye las de más) */
  size: 0 | 2 | 3 | 4
  count: number
}

const DEFAULTS: Config = { kind: 'build', levels: ['simples', 'todas'], size: 0, count: 8 }

type Phase =
  | { name: 'setup' }
  | { name: 'players'; config: Config; words: Word[] }
  | { name: 'play'; config: Config; words: Word[]; players: Player[] }

const sizeOk = (w: Word, size: Config['size']): boolean =>
  size === 0 || (size === 4 ? w.syl.length >= 4 : w.syl.length === size)

function poolFor(c: Config): Word[] {
  const base = WORDS.filter((w) => c.levels.includes(w.level) && sizeOk(w, c.size))
  if (c.kind === 'count') {
    const extra = [...MONOSILABAS, ...LARGAS].filter((w) => sizeOk(w, c.size))
    return [...base, ...extra]
  }
  return base
}

export default function ArmaLaPalabra(): React.JSX.Element {
  const [phase, setPhase] = useState<Phase>({ name: 'setup' })
  const [saved, setSaved] = usePersistentState<Config>('game:lectura-silabas:config', DEFAULTS)
  const config: Config = { ...DEFAULTS, ...saved }

  if (phase.name === 'setup')
    return (
      <Setup
        config={config}
        onChange={setSaved}
        onNext={(words) => setPhase({ name: 'players', config, words })}
      />
    )
  if (phase.name === 'players')
    return (
      <PlayerSetup
        optional
        startLabel="Empezar"
        onStart={(players) =>
          setPhase({ name: 'play', config: phase.config, words: phase.words, players })
        }
      />
    )
  return (
    <Round
      kind={phase.config.kind}
      words={phase.words}
      players={phase.players}
      onExit={() => setPhase({ name: 'setup' })}
    />
  )
}

function Setup({
  config,
  onChange,
  onNext
}: {
  config: Config
  onChange: (c: Config) => void
  onNext: (words: Word[]) => void
}): React.JSX.Element {
  const pool = poolFor(config)
  const set = (patch: Partial<Config>): void => onChange({ ...config, ...patch })
  const toggleLevel = (id: LevelId): void => {
    const has = config.levels.includes(id)
    if (has && config.levels.length === 1) return
    set({ levels: has ? config.levels.filter((l) => l !== id) : [...config.levels, id] })
  }
  const gradeLevels = (g: number): LevelId[] => LEVELS.filter((l) => l.grade === g).map((l) => l.id)
  const gradeActive = (g: number): boolean => {
    const ids = gradeLevels(g)
    return config.levels.length === ids.length && ids.every((i) => config.levels.includes(i))
  }
  const start = (): void => onNext(pick(pool, Math.min(config.count, pool.length)))

  return (
    <section className="panel lec-setup sil-setup">
      <OptionRow label="¿Qué hacemos?">
        <Choice selected={config.kind === 'build'} onClick={() => set({ kind: 'build' })}>
          🧱 Armar la palabra
        </Choice>
        <Choice selected={config.kind === 'count'} onClick={() => set({ kind: 'count' })}>
          👏 ¿Cuántas sílabas tiene?
        </Choice>
      </OptionRow>
      <OptionRow label="Grado" hint="elige los niveles">
        {[1, 2, 3].map((g) => (
          <Choice key={g} selected={gradeActive(g)} onClick={() => set({ levels: gradeLevels(g) })}>
            {g}.º
          </Choice>
        ))}
      </OptionRow>
      <OptionRow label="Sílabas" hint="varios a la vez">
        {LEVELS.map((l) => (
          <Choice
            key={l.id}
            selected={config.levels.includes(l.id)}
            onClick={() => toggleLevel(l.id)}
          >
            <span className="sil-level-title">{l.title}</span>
            <span className="sil-level-ex">{l.example}</span>
          </Choice>
        ))}
      </OptionRow>
      <OptionRow label="Largo de la palabra">
        {([0, 2, 3, 4] as const).map((s) => (
          <Choice key={s} selected={config.size === s} onClick={() => set({ size: s })}>
            {s === 0 ? 'Todas' : s === 4 ? '4 o más' : `${s} sílabas`}
          </Choice>
        ))}
      </OptionRow>
      <OptionRow label="Palabras">
        {[8, 12, 16].map((n) => (
          <Choice key={n} selected={config.count === n} onClick={() => set({ count: n })}>
            {n}
          </Choice>
        ))}
      </OptionRow>
      <div className="row start">
        <button className="btn big" disabled={pool.length < 2} onClick={start}>
          Siguiente →
        </button>
        <span className="muted">
          {pool.length < 2
            ? 'No hay palabras con esas opciones'
            : `${pool.length} palabras disponibles`}
        </span>
      </div>
    </section>
  )
}

interface Tile {
  id: number
  text: string
}

function Round({
  kind,
  words,
  players,
  onExit
}: {
  kind: Kind
  words: Word[]
  players: Player[]
  onExit: () => void
}): React.JSX.Element {
  const [index, setIndex] = useState(0)
  const [finished, setFinished] = useState(false)
  const [stats, setStats] = useState({ clean: 0 })
  const { scores, add, reset, ranking, leaders } = useScores(players)

  const restart = (): void => {
    reset()
    setIndex(0)
    setStats({ clean: 0 })
    setFinished(false)
    sfx.pop()
  }

  if (finished)
    return (
      <EndScreen
        title="🎉 ¡Muy bien!"
        lines={[`Palabras a la primera: ${stats.clean} de ${words.length}`]}
        players={players}
        scores={scores}
        ranking={ranking}
        leaders={leaders}
        onAgain={restart}
        onExit={onExit}
      />
    )

  const turn = players.length > 0 ? players[index % players.length] : undefined
  const common = {
    key: index,
    word: words[index],
    progress: `${index + 1} / ${words.length}`,
    turn,
    last: index + 1 === words.length,
    onExit,
    onDone: (clean: boolean) => {
      if (clean) {
        setStats((s) => ({ clean: s.clean + 1 }))
        if (turn) add(turn.id, 1)
      }
    },
    onNext: () => {
      if (index + 1 < words.length) setIndex(index + 1)
      else {
        setFinished(true)
        sfx.win()
      }
    }
  }
  return (
    <div className={`g-stage sil-stage ${players.length > 0 ? 'sil-teams' : ''}`}>
      {kind === 'build' ? <Build {...common} /> : <Count {...common} />}
      {players.length > 0 && (
        <div className="lec-score">
          <Scoreboard players={players} scores={scores} onAdd={add} currentId={turn?.id} compact />
        </div>
      )}
    </div>
  )
}

interface StepProps {
  word: Word
  progress: string
  turn?: Player
  last: boolean
  onExit: () => void
  onDone: (clean: boolean) => void
  onNext: () => void
}

/** Las sílabas separadas, cada una de su color */
function Syllables({ word, lit }: { word: Word; lit?: number }): React.JSX.Element {
  return (
    <span className="sil-word" aria-label={word.syl.join(' ')}>
      {word.syl.map((s, i) => (
        <span key={i} className={`sil-syl ${lit === i ? 'lit' : ''}`}>
          {s}
        </span>
      ))}
    </span>
  )
}

function Build({
  word,
  progress,
  turn,
  last,
  onExit,
  onDone,
  onNext
}: StepProps): React.JSX.Element {
  const voice = useVoice('es')
  const tiles = useMemo<Tile[]>(() => {
    const base = word.syl.map((text, id) => ({ id, text }))
    if (new Set(word.syl).size < 2) return base
    let mix = shuffle(base)
    while (mix.every((t, i) => t.id === i)) mix = shuffle(base)
    return mix
  }, [word])
  const [placed, setPlaced] = useState<number[]>([])
  const [status, setStatus] = useState<'playing' | 'wrong' | 'solved'>('playing')
  const [mistakes, setMistakes] = useState(0)
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  useEffect(() => () => clearTimeout(timer.current), [])

  const text = wordText(word)
  const n = word.syl.length

  const choose = (id: number): void => {
    if (status !== 'playing' || placed.includes(id)) return
    const next = [...placed, id]
    setPlaced(next)
    if (next.length < n) return sfx.pop()
    const built = next.map((i) => tiles.find((t) => t.id === i)!.text).join('')
    if (built === text) {
      setStatus('solved')
      sfx.correct()
      voice.speak(text, 0.8)
      onDone(mistakes === 0)
    } else {
      setStatus('wrong')
      setMistakes((m) => m + 1)
      sfx.wrong()
      timer.current = setTimeout(() => {
        setPlaced([])
        setStatus('playing')
      }, 1100)
    }
  }
  const undo = (at?: number): void => {
    if (status !== 'playing' || placed.length === 0) return
    sfx.pop()
    setPlaced(at === undefined ? placed.slice(0, -1) : placed.filter((_, i) => i !== at))
  }

  useKeys((e) => {
    if (status === 'solved') {
      if (
        e.key === 'ArrowRight' ||
        e.key === 'PageDown' ||
        ((e.key === ' ' || e.key === 'Enter') && noFocusedButton(e))
      ) {
        e.preventDefault()
        onNext()
      }
      return
    }
    if (/^[1-9]$/.test(e.key)) {
      const free = tiles.filter((t) => !placed.includes(t.id))
      const slot = tiles.findIndex((t) => t.id === free[Number(e.key) - 1]?.id)
      if (slot >= 0) choose(tiles[slot].id)
    } else if (e.key === 'Backspace') undo()
  })

  const free = tiles.filter((t) => !placed.includes(t.id))
  return (
    <>
      <TopBar progress={progress} turn={turn} onExit={onExit} />
      <div className="sil-picture" aria-hidden>
        {word.emoji}
      </div>

      {status === 'solved' ? (
        <div className="sil-solved">
          <Burst />
          <Syllables word={word} />
          <p className="sil-claps">{'👏'.repeat(n)}</p>
        </div>
      ) : (
        <div className={`sil-slots ${status === 'wrong' ? 'wrong' : ''}`}>
          {word.syl.map((_, i) => {
            const t = placed[i] === undefined ? null : tiles.find((x) => x.id === placed[i])
            return (
              <button
                key={i}
                className={`sil-slot ${t ? 'filled' : ''}`}
                aria-label={t ? `Quitar ${t.text}` : `Espacio ${i + 1}`}
                disabled={!t || status !== 'playing'}
                onClick={() => undo(i)}
              >
                {t?.text}
              </button>
            )
          })}
        </div>
      )}

      {status !== 'solved' && (
        <div className="sil-tiles">
          {free.map((t, i) => (
            <button
              key={t.id}
              className="sil-tile"
              disabled={status !== 'playing'}
              onClick={() => choose(t.id)}
            >
              <span className="sil-tile-key" aria-hidden>
                {i + 1}
              </span>
              {t.text}
            </button>
          ))}
        </div>
      )}

      <div className="row sil-actions">
        {status === 'solved' ? (
          <button className="btn big" onClick={onNext}>
            {last ? 'Terminar' : 'Siguiente →'}
          </button>
        ) : (
          <>
            <button
              className="btn secondary"
              disabled={placed.length === 0 || status !== 'playing'}
              onClick={() => undo()}
            >
              ⌫ Borrar
            </button>
            {voice.available && (
              <button className="btn secondary" onClick={() => voice.speak(text, 0.8)}>
                🔊 Escúchala
              </button>
            )}
            <button className="btn secondary" onClick={onNext}>
              Saltar
            </button>
          </>
        )}
      </div>
      <p className="muted lec-sub">
        {status === 'wrong'
          ? 'Casi. ¡Inténtalo otra vez!'
          : status === 'solved'
            ? 'Flecha → o Espacio: siguiente'
            : 'Toca las sílabas en orden (o usa las teclas 1, 2, 3…)'}
      </p>
    </>
  )
}

function Count({
  word,
  progress,
  turn,
  last,
  onExit,
  onDone,
  onNext
}: StepProps): React.JSX.Element {
  const voice = useVoice('es')
  const n = word.syl.length
  const [wrongPicks, setWrongPicks] = useState<number[]>([])
  const [solved, setSolved] = useState(false)
  const [lit, setLit] = useState(-1)
  const text = wordText(word)

  // Las palmadas: cada sílaba se ilumina y suena un golpe
  useEffect(() => {
    if (!solved) return
    let i = 0
    const id = setInterval(() => {
      setLit(i)
      sfx.pop()
      i++
      if (i >= n) clearInterval(id)
    }, 520)
    return () => clearInterval(id)
  }, [solved, n])

  const answer = (k: number): void => {
    if (solved || wrongPicks.includes(k)) return
    if (k === n) {
      setSolved(true)
      sfx.correct()
      voice.speak(text, 0.8)
      onDone(wrongPicks.length === 0)
    } else {
      setWrongPicks([...wrongPicks, k])
      sfx.wrong()
    }
  }

  useKeys((e) => {
    if (solved) {
      if (
        e.key === 'ArrowRight' ||
        e.key === 'PageDown' ||
        ((e.key === ' ' || e.key === 'Enter') && noFocusedButton(e))
      ) {
        e.preventDefault()
        onNext()
      }
    } else if (/^[1-5]$/.test(e.key)) answer(Number(e.key))
  })

  return (
    <>
      <TopBar progress={progress} turn={turn} onExit={onExit} />
      <div className="sil-picture" aria-hidden>
        {word.emoji}
      </div>
      <div className="sil-solved">
        {solved ? <Syllables word={word} lit={lit} /> : <span className="sil-plain">{text}</span>}
        <p className="sil-claps">
          {solved
            ? Array.from({ length: n }, (_, i) => (
                <span key={i} className={i <= lit ? 'on' : 'off'}>
                  👏
                </span>
              ))
            : ' '}
        </p>
      </div>
      {solved && <Burst />}
      <div className="sil-numbers" role="group" aria-label="Cantidad de sílabas">
        {[1, 2, 3, 4, 5].map((k) => (
          <button
            key={k}
            className={`sil-number ${solved && k === n ? 'right' : ''} ${wrongPicks.includes(k) ? 'miss' : ''}`}
            disabled={solved || wrongPicks.includes(k)}
            onClick={() => answer(k)}
          >
            {k}
          </button>
        ))}
      </div>
      <div className="row sil-actions">
        {solved ? (
          <button className="btn big" onClick={onNext}>
            {last ? 'Terminar' : 'Siguiente →'}
          </button>
        ) : (
          <>
            {voice.available && (
              <button className="btn secondary" onClick={() => voice.speak(text, 0.8)}>
                🔊 Escúchala
              </button>
            )}
            <button className="btn secondary" onClick={onNext}>
              Saltar
            </button>
          </>
        )}
      </div>
      <p className="muted lec-sub">
        {solved
          ? 'Flecha → o Espacio: siguiente'
          : wrongPicks.length > 0
            ? 'Casi. ¡Da las palmadas otra vez!'
            : 'Den palmadas: una por cada sílaba. Tecla 1 a 5 para elegir.'}
      </p>
    </>
  )
}
