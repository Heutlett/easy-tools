import { useEffect, useMemo, useState } from 'react'
import { sfx } from '../../lib/games/sfx'
import type { Ctx } from '../_manip/Runner'
import { ALL, denomOf, money } from './data'
import { describe, minPieces, pieceSize } from './moneyUtil'

const grouped = (n: number): string =>
  n >= 10000 ? String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') : String(n)

interface PieceProps {
  value: number
  /** Ancho en píxeles (en el dibujo propio) o en unidades del SVG que lo contiene */
  width?: number
  x?: number
  y?: number
}

/** Una moneda o un billete dibujado en SVG (estilizado, no copia los diseños oficiales) */
export function Piece({ value, width, x, y }: PieceProps): React.JSX.Element {
  const d = denomOf(value)
  const size = pieceSize(d)
  const w = width ?? size.w
  const h = (w * size.h) / size.w
  if (d.kind === 'coin') {
    const digits = String(value).length
    return (
      <svg
        className="cl-piece coin"
        x={x}
        y={y}
        width={w}
        height={h}
        viewBox="0 0 100 100"
        aria-hidden
      >
        <circle
          cx="50"
          cy="50"
          r="47"
          fill={value === 500 ? '#d4a017' : d.fill}
          stroke={d.rim}
          strokeWidth="5"
        />
        {value === 500 && (
          <circle cx="50" cy="50" r="33" fill={d.fill} stroke={d.rim} strokeWidth="3" />
        )}
        <circle
          cx="50"
          cy="50"
          r={value === 500 ? 28 : 39}
          fill="none"
          stroke={d.rim}
          strokeWidth="1.5"
          strokeDasharray="2 4"
          opacity="0.7"
        />
        <text x="50" y="35" textAnchor="middle" fontSize="17" fontWeight="800" fill={d.ink}>
          ₡
        </text>
        <text
          x="50"
          y="68"
          textAnchor="middle"
          fontSize={digits === 3 ? 34 : 38}
          fontWeight="800"
          fill={d.ink}
        >
          {value}
        </text>
      </svg>
    )
  }
  return (
    <svg
      className="cl-piece bill"
      x={x}
      y={y}
      width={w}
      height={h}
      viewBox="0 0 200 100"
      aria-hidden
    >
      <rect
        x="3"
        y="3"
        width="194"
        height="94"
        rx="12"
        fill={d.fill}
        stroke={d.rim}
        strokeWidth="5"
      />
      <rect
        x="11"
        y="11"
        width="178"
        height="78"
        rx="8"
        fill="none"
        stroke={d.rim}
        strokeWidth="1.5"
        strokeDasharray="3 4"
        opacity="0.7"
      />
      <circle
        cx="156"
        cy="48"
        r="27"
        fill="#fff"
        fillOpacity="0.6"
        stroke={d.rim}
        strokeWidth="2"
      />
      <text x="156" y="49" textAnchor="middle" dominantBaseline="central" fontSize="30">
        {d.emoji}
      </text>
      <text x="22" y="34" fontSize="16" fontWeight="800" fill={d.ink}>
        ₡
      </text>
      <text x="22" y="68" fontSize={value >= 10000 ? 33 : 38} fontWeight="800" fill={d.ink}>
        {grouped(value)}
      </text>
      <text x="22" y="85" fontSize="9" fontWeight="700" fill={d.ink} letterSpacing="2.5">
        COLONES
      </text>
    </svg>
  )
}

/** Montón de dinero ordenado de mayor a menor, un poco desparramado */
export function Pile({
  values,
  height = 260
}: {
  values: number[]
  height?: number
}): React.JSX.Element {
  const layout = useMemo(() => {
    const W = 760
    const gap = 14
    const sorted = [...values].sort((a, b) => b - a)
    const rows: { value: number; w: number; h: number }[][] = [[]]
    let used = 0
    for (const v of sorted) {
      const s = pieceSize(denomOf(v))
      if (used + s.w > W && rows[rows.length - 1].length) {
        rows.push([])
        used = 0
      }
      rows[rows.length - 1].push({ value: v, ...s })
      used += s.w + gap
    }
    let y = 0
    const placed: { value: number; x: number; y: number; w: number; h: number; rot: number }[] = []
    let i = 0
    for (const row of rows) {
      const rowH = Math.max(...row.map((p) => p.h))
      const rowW = row.reduce((a, p) => a + p.w + gap, -gap)
      let x = (W - rowW) / 2
      for (const p of row) {
        placed.push({ ...p, x, y: y + (rowH - p.h) / 2, rot: ((i * 37) % 9) - 4 })
        x += p.w + gap
        i++
      }
      y += rowH + gap
    }
    return { placed, W, H: Math.max(y - gap, 10) }
  }, [values])
  return (
    <svg
      className="cl-pile"
      viewBox={`-10 -10 ${layout.W + 20} ${layout.H + 20}`}
      style={{ height }}
      role="img"
      aria-label="Dinero"
    >
      {layout.placed.map((p, i) => (
        <g key={i} transform={`rotate(${p.rot} ${p.x + p.w / 2} ${p.y + p.h / 2})`}>
          <Piece value={p.value} x={p.x} y={p.y} width={p.w} />
        </g>
      ))}
    </svg>
  )
}

interface BuilderProps {
  ctx: Ctx
  /** Cuánto hay que formar */
  target: number
  /** Qué monedas y billetes se pueden tocar */
  denoms: number[]
  /** Se ve la suma mientras se arma */
  help: boolean
  /** Lo que se pide (se muestra arriba) */
  heading: React.ReactNode
  /** Qué mostrar de lo que falta/sobra al fallar el primer intento */
  okMessage?: string
  failMessage?: string
}

const MAX_PIECES = 30

/** Mesa para armar un monto tocando monedas y billetes. Dos intentos; si no sale, muestra una forma de armarlo. */
export function MoneyBuilder({
  ctx,
  target,
  denoms,
  help,
  heading,
  okMessage,
  failMessage
}: BuilderProps): React.JSX.Element {
  const [items, setItems] = useState<number[]>([])
  const [tries, setTries] = useState(0)
  const [hint, setHint] = useState('')
  const [showSum, setShowSum] = useState(help)
  const done = ctx.resolved !== null
  const sum = items.reduce((a, b) => a + b, 0)
  const palette = ALL.filter((d) => denoms.includes(d.value))

  const add = (v: number): void => {
    if (done || items.length >= MAX_PIECES) return
    sfx.pop()
    setItems([...items, v])
    setHint('')
  }
  const remove = (v: number): void => {
    if (done) return
    const i = items.lastIndexOf(v)
    if (i < 0) return
    sfx.tick()
    setItems(items.filter((_, k) => k !== i))
    setHint('')
  }
  const check = (): void => {
    if (done) return
    if (sum === target) {
      ctx.resolve(true, okMessage ?? `Son ${money(target)}`)
    } else if (tries === 0) {
      setTries(1)
      sfx.wrong()
      setHint(
        sum > target
          ? 'Te pasaste, quita algo'
          : sum === 0
            ? 'Toca el dinero para agregarlo'
            : 'Todavía falta'
      )
    } else {
      const sol = minPieces(target, denoms) ?? []
      setItems(sol)
      ctx.resolve(false, failMessage ?? `Se puede con ${describe(sol)}`)
    }
  }

  useEffect(() => {
    if (done) return
    const onKey = (e: KeyboardEvent): void => {
      const tag = e.target instanceof HTMLElement ? e.target.tagName : 'BODY'
      if (e.key === 'Enter' && !e.repeat && tag === 'BODY') {
        e.preventDefault()
        check()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const sorted = [...items].sort((a, b) => b - a)
  const scale = items.length > 14 ? 0.7 : items.length > 8 ? 0.85 : items.length > 5 ? 1 : 1.2
  const coins = palette.filter((d) => d.kind === 'coin')
  const bills = palette.filter((d) => d.kind === 'bill')
  const table = (
    <div className="cl-table" aria-label="Mesa" aria-live="polite">
      {sorted.length === 0 && (
        <span className="cl-empty">Toca el dinero de abajo para ponerlo aquí</span>
      )}
      {sorted.map((v, i) => {
        const s = pieceSize(denomOf(v), scale)
        return (
          <button
            key={`${v}-${i}`}
            className="cl-chip"
            disabled={done}
            aria-label={`Quitar ${money(v)}`}
            onClick={() => remove(v)}
          >
            <Piece value={v} width={s.w} />
          </button>
        )
      })}
    </div>
  )
  return (
    <div className="cl-builder">
      <div className="cl-head">
        <div className="cl-heading">{heading}</div>
        <div className={`cl-sum ${done ? (ctx.resolved?.ok ? 'ok' : 'bad') : ''}`}>
          <span className="cl-sum-label">Llevo</span>
          <span className="cl-sum-value">{showSum || done ? money(sum) : '₡ ?'}</span>
          {!done && (
            <button
              className="pill small"
              onClick={() => setShowSum(!showSum)}
              aria-pressed={showSum}
            >
              {showSum ? '🙈 Ocultar' : '👁 Ver suma'}
            </button>
          )}
        </div>
      </div>
      {table}
      <div className="cl-hint">{!done && (hint || ' ')}</div>
      <div className="cl-palette">
        {[coins, bills].map((group, gi) => (
          <div key={gi} className="cl-group">
            {group.map((d) => {
              const s = pieceSize(d, 0.8)
              return (
                <button
                  key={d.value}
                  className="cl-pick"
                  disabled={done}
                  aria-label={`Agregar ${d.name} de ${money(d.value)}`}
                  onClick={() => add(d.value)}
                >
                  <Piece value={d.value} width={s.w} />
                </button>
              )
            })}
          </div>
        ))}
      </div>
      <div className="row start">
        <button className="btn big" disabled={done} onClick={check}>
          Comprobar ✔
        </button>
        <button
          className="btn secondary"
          disabled={done || items.length === 0}
          onClick={() => setItems([])}
        >
          Quitar todo
        </button>
        <span className="muted cl-keys">
          Toca una pieza de la mesa para quitarla · Enter: comprobar
        </span>
      </div>
    </div>
  )
}
