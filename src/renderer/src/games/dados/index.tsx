import { useEffect, useRef, useState } from 'react'
import './style.css'
import PlayerSetup from '../../components/games/PlayerSetup'
import type { Player } from '../../lib/games/players'
import { playTones, sfx } from '../../lib/games/sfx'
import { randomInt } from '../../lib/random'
import { usePersistentState } from '../../lib/usePersistentState'
import {
  COIN_FACES,
  COLOR_FACES,
  DEFAULT_CONFIG,
  MAX_FACES,
  MIN_FACES,
  PRESETS,
  SIDES,
  TABS,
  nextCoinRotation,
  nextRotation,
  sumWays,
  type Config,
  type Roll,
  type Rotation
} from './data'
import { Coin, ColorFace, Cube, FlatDie, Pips, TextFace } from './Die'
import { Bars, History, type Chip } from './Stats'

const ROLL_MS = 1200
const COIN_MS = 1500
const HISTORY_SHOWN = 14
const MANY = 100

/** Para botones: si se pulsó con el mouse suelta el foco, así la barra espaciadora siempre lanza */
function tapped(e: React.MouseEvent<HTMLButtonElement>, fn: () => void): void {
  if (e.detail > 0) e.currentTarget.blur()
  fn()
}

export default function Dice(): React.JSX.Element {
  const [saved, setSaved] = usePersistentState<Config>('game:dados:config', DEFAULT_CONFIG)
  const cfg: Config = { ...DEFAULT_CONFIG, ...saved }
  const [rawFaces, setFaces] = usePersistentState<string[]>('game:dados:faces', PRESETS[0].faces)
  const faces = rawFaces.length >= MIN_FACES ? rawFaces.slice(0, MAX_FACES) : PRESETS[0].faces
  const [histories, setHistories] = useState<Record<string, Roll[]>>({})
  const [cubeRot, setCubeRot] = useState<Record<string, Rotation[]>>({})
  const [coinRot, setCoinRot] = useState<Record<string, number[]>>({})
  const [rolling, setRolling] = useState(false)
  const [players, setPlayers] = useState<Player[]>([])
  const [choosing, setChoosing] = useState(false)
  const [turn, setTurn] = useState(0)
  const nextId = useRef(1)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const set = (patch: Partial<Config>): void => setSaved({ ...cfg, ...patch })

  const { tab, count } = cfg
  const labels: string[] =
    tab === 'dados'
      ? Array.from({ length: cfg.sides }, (_, i) => String(i + 1))
      : tab === 'moneda'
        ? COIN_FACES
        : tab === 'colores'
          ? COLOR_FACES.map((c) => c.name)
          : faces.map((f) => f.trim() || '?')
  const isCube =
    tab === 'colores' ||
    (tab === 'dados' && cfg.sides === 6) ||
    (tab === 'personalizado' && labels.length === 6)
  const sig =
    tab === 'dados'
      ? `d${cfg.sides}x${count}`
      : tab === 'personalizado'
        ? `p${count}:${labels.join('|')}`
        : `${tab}x${count}`
  const rolls = histories[sig] ?? []
  const last = rolls[0]
  const sized = count === 1 ? 'l' : count === 2 ? 'm' : 's'

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current)
    },
    []
  )

  const addRolls = (key: string, list: Roll[]): void =>
    setHistories((h) => ({ ...h, [key]: [...list.reverse(), ...(h[key] ?? [])] }))

  const makeRoll = (by?: string): Roll => ({
    id: nextId.current++,
    faces: Array.from({ length: count }, () => randomInt(0, labels.length - 1)),
    by
  })

  const spinTo = (roll: Roll): void => {
    if (tab === 'moneda')
      setCoinRot((r) => ({
        ...r,
        [sig]: roll.faces.map((f, i) => nextCoinRotation(r[sig]?.[i] ?? 0, f))
      }))
    else if (isCube)
      setCubeRot((r) => ({
        ...r,
        [sig]: roll.faces.map((f, i) => nextRotation(r[sig]?.[i] ?? { x: 0, y: 0 }, f))
      }))
  }

  const sounds = (): void => {
    if (tab === 'moneda') {
      const times = [0, 0.18, 0.4, 0.66, 0.96, 1.28]
      playTones(
        times.map((at) => ({ freq: 2100, at, length: 0.07, type: 'triangle', volume: 0.12 }))
      )
      playTones([
        { freq: 1568, at: 1.42, length: 0.35, volume: 0.18 },
        { freq: 2093, at: 1.44, length: 0.5, volume: 0.12 }
      ])
    } else {
      const times = [0, 0.1, 0.22, 0.38, 0.58, 0.82, 1.08]
      playTones(
        times.map((at, i) => ({
          freq: 150 + (i % 3) * 45,
          at,
          length: 0.06,
          type: 'triangle',
          volume: 0.22
        }))
      )
      playTones([{ freq: 110, at: 1.14, length: 0.14, volume: 0.28 }])
    }
  }

  const roll = (): void => {
    if (rolling || choosing) return
    const by = players.length ? players[turn % players.length].emoji : undefined
    const result = makeRoll(by)
    const key = sig
    setRolling(true)
    spinTo(result)
    sounds()
    timer.current = setTimeout(
      () => {
        addRolls(key, [result])
        setRolling(false)
        if (players.length) setTurn((t) => (t + 1) % players.length)
      },
      tab === 'moneda' ? COIN_MS : ROLL_MS
    )
  }

  const rollMany = (): void => {
    if (rolling || choosing) return
    const list = Array.from({ length: MANY }, () => makeRoll())
    addRolls(sig, list)
    spinTo(list[list.length - 1])
    sfx.pop()
  }

  const reset = (): void => setHistories((h) => ({ ...h, [sig]: [] }))

  // Espacio o Enter lanzan (si no hay un botón o un campo seleccionado)
  const rollRef = useRef(roll)
  useEffect(() => {
    rollRef.current = roll
  })
  useEffect(() => {
    const onKey = (e: KeyboardEvent): void => {
      const tag = e.target instanceof HTMLElement ? e.target.tagName : 'BODY'
      if ((e.key === ' ' || e.key === 'Enter') && tag === 'BODY') {
        e.preventDefault()
        rollRef.current()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  if (choosing)
    return (
      <div className="g-stage">
        <div className="row start">
          <button className="btn secondary small" onClick={() => setChoosing(false)}>
            ← Volver
          </button>
        </div>
        <PlayerSetup
          startLabel="Empezar con turnos"
          onStart={(list) => {
            setPlayers(list)
            setTurn(0)
            setChoosing(false)
          }}
        />
      </div>
    )

  /* ---------- Estadística ---------- */
  const useSum = tab === 'dados' && count > 1 && cfg.chart === 'sum'
  const chartLabels = useSum
    ? Array.from({ length: count * (cfg.sides - 1) + 1 }, (_, i) => String(count + i))
    : labels
  const counts = chartLabels.map(() => 0)
  for (const r of rolls) {
    if (useSum) counts[r.faces.reduce((a, f) => a + f, 0)]++
    else for (const f of r.faces) counts[f]++
  }
  const samples = useSum ? rolls.length : rolls.length * count
  const expected = useSum
    ? sumWays(count, cfg.sides).map((w) => (w / cfg.sides ** count) * samples)
    : labels.map(() => samples / labels.length)
  const colors =
    tab === 'colores' && !useSum
      ? COLOR_FACES.map((c) => c.color)
      : tab === 'moneda'
        ? ['#d4a017', '#64748b']
        : undefined

  const chips: Chip[] = rolls.slice(0, HISTORY_SHOWN).map((r) => ({
    id: r.id,
    by: r.by,
    dots: tab === 'colores' ? r.faces.map((f) => COLOR_FACES[f].color) : undefined,
    text:
      tab === 'dados'
        ? count === 1
          ? String(r.faces[0] + 1)
          : `${r.faces.map((f) => f + 1).join(' + ')} = ${r.faces.reduce((a, f) => a + f + 1, 0)}`
        : r.faces.map((f) => labels[f]).join(' · ')
  }))

  /* ---------- Resultado grande ---------- */
  let result = ''
  let detail = ''
  if (last && !rolling) {
    if (tab === 'dados') {
      const total = last.faces.reduce((a, f) => a + f + 1, 0)
      result = count === 1 ? String(total) : `Total: ${total}`
      detail = count === 1 ? '' : last.faces.map((f) => f + 1).join(' + ')
    } else result = last.faces.map((f) => labels[f]).join(' · ')
  }

  const itemLabel = (i: number): string =>
    last && !rolling ? `${labels[last.faces[i]]}` : tab === 'moneda' ? 'Moneda' : 'Dado'

  const cubeFaces = (): React.ReactNode[] =>
    tab === 'colores'
      ? COLOR_FACES.map((_, i) => <ColorFace key={i} index={i} />)
      : tab === 'dados'
        ? [1, 2, 3, 4, 5, 6].map((v) => <Pips key={v} value={v} />)
        : labels.map((t, i) => <TextFace key={i} text={t} />)

  const stage = Array.from({ length: count }, (_, i) => {
    if (tab === 'moneda')
      return (
        <Coin
          key={i}
          rotation={coinRot[sig]?.[i] ?? 0}
          rolling={rolling}
          size={sized}
          label={itemLabel(i)}
        />
      )
    if (isCube)
      return (
        <Cube
          key={i}
          faces={cubeFaces()}
          rotation={cubeRot[sig]?.[i] ?? { x: 0, y: 0 }}
          rolling={rolling}
          size={sized}
          label={itemLabel(i)}
        />
      )
    return (
      <FlatDie
        key={i}
        labels={labels}
        value={last ? last.faces[i] : null}
        rolling={rolling}
        size={sized}
        label={itemLabel(i)}
      />
    )
  })

  const player = players.length ? players[turn % players.length] : null

  return (
    <div className="da">
      <div className="da-top">
        <div className="pills" role="group" aria-label="Qué lanzar">
          {TABS.map((t) => (
            <button
              key={t.id}
              className={`pill ${tab === t.id ? 'selected' : ''}`}
              aria-pressed={tab === t.id}
              disabled={rolling}
              onClick={(e) => tapped(e, () => set({ tab: t.id }))}
            >
              {t.icon} {t.title}
            </button>
          ))}
        </div>
        <button className="btn secondary small" onClick={(e) => tapped(e, () => setChoosing(true))}>
          👥 Turnos
        </button>
      </div>

      <div className="da-config">
        <span className="panel-title">{tab === 'moneda' ? 'Monedas' : 'Dados'}</span>
        <div className="pills" role="group" aria-label="Cantidad">
          {[1, 2, 3].map((n) => (
            <button
              key={n}
              className={`pill ${count === n ? 'selected' : ''}`}
              aria-pressed={count === n}
              disabled={rolling}
              onClick={(e) =>
                tapped(e, () => set({ count: n, chart: n === 1 ? 'face' : cfg.chart }))
              }
            >
              {n}
            </button>
          ))}
        </div>
        {tab === 'dados' && (
          <>
            <span className="panel-title da-gap">Caras</span>
            <div className="pills" role="group" aria-label="Caras del dado">
              {SIDES.map((n) => (
                <button
                  key={n}
                  className={`pill ${cfg.sides === n ? 'selected' : ''}`}
                  aria-pressed={cfg.sides === n}
                  disabled={rolling}
                  onClick={(e) => tapped(e, () => set({ sides: n }))}
                >
                  {n}
                </button>
              ))}
            </div>
          </>
        )}
        {tab === 'personalizado' && (
          <>
            <span className="panel-title da-gap">Modelos</span>
            <div className="pills" role="group" aria-label="Modelos de dado">
              {PRESETS.map((p) => (
                <button
                  key={p.id}
                  className="pill small"
                  disabled={rolling}
                  onClick={(e) => tapped(e, () => setFaces(p.faces))}
                >
                  {p.title}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {tab === 'personalizado' && (
        <div className="da-faces" role="group" aria-label="Caras del dado">
          {faces.map((f, i) => (
            <span key={i} className="da-face-edit">
              <input
                className="field"
                value={f}
                maxLength={16}
                placeholder={`Cara ${i + 1}`}
                aria-label={`Cara ${i + 1}`}
                onChange={(e) => setFaces(faces.map((x, k) => (k === i ? e.target.value : x)))}
              />
              <button
                className="icon-btn"
                aria-label={`Quitar la cara ${i + 1}`}
                disabled={faces.length <= MIN_FACES}
                onClick={(e) => tapped(e, () => setFaces(faces.filter((_, k) => k !== i)))}
              >
                ✕
              </button>
            </span>
          ))}
          {faces.length < MAX_FACES && (
            <button
              className="btn secondary small"
              onClick={(e) => tapped(e, () => setFaces([...faces, `Cara ${faces.length + 1}`]))}
            >
              + Agregar cara
            </button>
          )}
        </div>
      )}

      <div className="da-main">
        <section className="da-play">
          <div className="da-stage">{stage}</div>
          <div className="da-result" aria-live="polite">
            {result && <span className="da-result-big">{result}</span>}
            {detail && <span className="da-result-detail">{detail}</span>}
          </div>
          {player && (
            <p className="da-turn" style={{ '--team': player.color } as React.CSSProperties}>
              Le toca a {player.emoji} {player.name}{' '}
              <button
                className="btn secondary small"
                onClick={(e) => tapped(e, () => setPlayers([]))}
              >
                Quitar turnos
              </button>
            </p>
          )}
          <div className="row">
            <button className="btn big da-roll" disabled={rolling} onClick={(e) => tapped(e, roll)}>
              {tab === 'moneda' ? '🪙 Lanzar' : '🎲 Lanzar'}
            </button>
            <button
              className="btn secondary"
              disabled={rolling}
              onClick={(e) => tapped(e, rollMany)}
              title="Para ver cómo se reparten los resultados"
            >
              Lanzar {MANY} veces
            </button>
          </div>
          <p className="muted da-hint">Espacio o Enter: lanzar</p>
        </section>

        <aside className="panel da-side">
          <div className="row">
            <span className="panel-title">
              {rolls.length} {rolls.length === 1 ? 'lanzamiento' : 'lanzamientos'}
            </span>
            <button
              className="btn secondary small"
              disabled={rolls.length === 0 || rolling}
              onClick={(e) => tapped(e, reset)}
            >
              Reiniciar conteo
            </button>
          </div>
          {tab === 'dados' && count > 1 && (
            <div className="pills" role="group" aria-label="Qué contar">
              <button
                className={`pill small ${cfg.chart === 'face' ? 'selected' : ''}`}
                aria-pressed={cfg.chart === 'face'}
                onClick={(e) => tapped(e, () => set({ chart: 'face' }))}
              >
                Cada cara
              </button>
              <button
                className={`pill small ${cfg.chart === 'sum' ? 'selected' : ''}`}
                aria-pressed={cfg.chart === 'sum'}
                onClick={(e) => tapped(e, () => set({ chart: 'sum' }))}
              >
                La suma
              </button>
            </div>
          )}
          <Bars labels={chartLabels} counts={counts} expected={expected} colors={colors} />
          <p className="muted da-legend">
            <span className="da-legend-mark" aria-hidden /> lo que se esperaría
          </p>
          <History chips={chips} />
        </aside>
      </div>
    </div>
  )
}
