import { gridDims, type Kind, type Val, valText } from './data'

interface ShapeProps {
  kind: Kind
  /** Partes iguales de cada figura */
  parts: number
  /** Cuántas figuras (2 para fracciones mayores que 1) */
  units?: number
  /** Cuáles partes están coloreadas (índices de 0 a parts × units − 1) */
  filled: Set<number> | number
  onToggle?: (index: number) => void
  /** Ancho de cada figura en píxeles */
  size?: number
  /** Las partes que no se pueden tocar */
  locked?: boolean
}

const wedge = (cx: number, cy: number, r: number, a0: number, a1: number): string => {
  const p = (a: number): string => `${cx + r * Math.cos(a)} ${cy + r * Math.sin(a)}`
  const large = a1 - a0 > Math.PI ? 1 : 0
  return `M ${cx} ${cy} L ${p(a0)} A ${r} ${r} 0 ${large} 1 ${p(a1)} Z`
}

/** Una o más figuras divididas en partes iguales: círculo (pizza), barra o cuadrícula. */
export default function Shape({
  kind,
  parts,
  units = 1,
  filled,
  onToggle,
  size = 160,
  locked
}: ShapeProps): React.JSX.Element {
  const isOn = (i: number): boolean => (typeof filled === 'number' ? i < filled : filled.has(i))
  const interactive = !!onToggle && !locked
  const partProps = (i: number): Record<string, unknown> => ({
    className: `fr-part ${isOn(i) ? 'on' : ''} ${interactive ? 'tap' : ''}`,
    ...(interactive
      ? {
          role: 'button',
          tabIndex: 0,
          'aria-pressed': isOn(i),
          'aria-label': `Parte ${(i % parts) + 1}${units > 1 ? ` de la figura ${Math.floor(i / parts) + 1}` : ''}`,
          onClick: () => onToggle?.(i),
          onKeyDown: (e: React.KeyboardEvent) => {
            if (e.key === ' ' || e.key === 'Enter') {
              e.preventDefault()
              e.stopPropagation()
              onToggle?.(i)
            }
          }
        }
      : {})
  })

  const one = (u: number): React.JSX.Element => {
    const base = u * parts
    if (kind === 'circle') {
      return (
        <svg
          key={u}
          className="fr-shape"
          width={size}
          height={size}
          viewBox="0 0 200 200"
          aria-hidden={!interactive}
        >
          {parts === 1 ? (
            <circle cx="100" cy="100" r="92" {...partProps(base)} />
          ) : (
            Array.from({ length: parts }, (_, k) => {
              const a0 = -Math.PI / 2 + (k * 2 * Math.PI) / parts
              const a1 = -Math.PI / 2 + ((k + 1) * 2 * Math.PI) / parts
              return <path key={k} d={wedge(100, 100, 92, a0, a1)} {...partProps(base + k)} />
            })
          )}
        </svg>
      )
    }
    if (kind === 'bar') {
      const w = 300 / parts
      return (
        <svg
          key={u}
          className="fr-shape"
          width={size * 1.9}
          height={size * 0.5}
          viewBox="0 0 300 80"
          aria-hidden={!interactive}
        >
          {Array.from({ length: parts }, (_, k) => (
            <rect
              key={k}
              x={k * w + 1}
              y="4"
              width={w - 2}
              height="72"
              rx="4"
              {...partProps(base + k)}
            />
          ))}
        </svg>
      )
    }
    const { rows, cols } = gridDims(parts)
    const cell = Math.min(60, 240 / cols)
    const W = cols * cell
    const H = rows * cell
    return (
      <svg
        key={u}
        className="fr-shape"
        width={(size * 1.2 * W) / 240 + 8}
        height={(size * 1.2 * H) / 240 + 8}
        viewBox={`-2 -2 ${W + 4} ${H + 4}`}
        aria-hidden={!interactive}
      >
        {Array.from({ length: parts }, (_, k) => (
          <rect
            key={k}
            x={(k % cols) * cell + 1}
            y={Math.floor(k / cols) * cell + 1}
            width={cell - 2}
            height={cell - 2}
            rx={cell > 30 ? 5 : 2}
            {...partProps(base + k)}
          />
        ))}
      </svg>
    )
  }
  return <div className="fr-set">{Array.from({ length: units }, (_, u) => one(u))}</div>
}

/** Fracción escrita con raya: ¾; el número mixto lleva el entero a la izquierda */
export function Frac({ n, d, w }: { n: number; d: number; w?: number }): React.JSX.Element {
  return (
    <span className="fr-frac" role="text" aria-label={`${w ? `${w} y ` : ''}${n} sobre ${d}`}>
      {w !== undefined && <span className="fr-whole">{w}</span>}
      <span className="fr-stack">
        <span>{n}</span>
        <span className="fr-bar" />
        <span>{d}</span>
      </span>
    </span>
  )
}

export function ValueView({ v }: { v: Val }): React.JSX.Element {
  if (v.t === 'f') return <Frac n={v.n} d={v.d} />
  if (v.t === 'm') return <Frac w={v.w} n={v.n} d={v.d} />
  return <span className="fr-plain">{valText(v)}</span>
}
