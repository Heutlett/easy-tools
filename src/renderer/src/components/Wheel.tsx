const RADIUS = 240
const COLORS = [
  '#e8644a',
  '#3b8fd9',
  '#f2b632',
  '#4fae6a',
  '#8a63d2',
  '#e46aa8',
  '#2aa3a0',
  '#e0a020'
]

interface Props {
  items: string[]
  /** Giro acumulado en grados (sentido del reloj) */
  angle: number
  /** Si es mayor que 0, el cambio de `angle` se anima durante esa cantidad de segundos */
  spinSeconds: number
  onSpinEnd: () => void
}

const point = (degrees: number, radius: number): [number, number] => {
  const rad = (degrees * Math.PI) / 180
  return [radius * Math.sin(rad), -radius * Math.cos(rad)]
}

/** Color de cada gajo; si el último queda igual al primero se cambia para que no se confundan. */
function colorFor(index: number, count: number): string {
  if (index === count - 1 && count > 1 && index % COLORS.length === 0) return COLORS[3]
  return COLORS[index % COLORS.length]
}

/** Ruleta dibujada en SVG. El gajo `i` ocupa [i·s, (i+1)·s] grados contando desde arriba hacia la derecha. */
export default function Wheel({ items, angle, spinSeconds, onSpinEnd }: Props): React.JSX.Element {
  const count = items.length
  const slice = 360 / Math.max(count, 1)
  const fontSize = Math.max(
    11,
    Math.min(26, ((2 * Math.PI * RADIUS * 0.6) / Math.max(count, 1)) * 0.5)
  )
  // Espacio disponible para el texto: desde el borde de la ruleta hasta el centro
  const available = RADIUS - 16 - 46
  const charWidth = fontSize * 0.55
  /** Un nombre largo se aprieta para que quepa; si es larguísimo, se acorta */
  const fit = (text: string): { text: string; squeeze: boolean } => {
    const maxChars = Math.floor((available / charWidth) * 1.4)
    const shown = text.length > maxChars ? `${text.slice(0, maxChars - 1)}…` : text
    return { text: shown, squeeze: shown.length * charWidth > available }
  }

  return (
    <div className="wheel-box">
      <div className="wheel-pointer" />
      <svg viewBox="-250 -250 500 500" role="img" aria-label="Ruleta">
        <circle r={248} fill="#2b2622" />
        <g
          className="wheel-spin"
          style={{
            transform: `rotate(${angle}deg)`,
            transition:
              spinSeconds > 0 ? `transform ${spinSeconds}s cubic-bezier(0.12, 0.6, 0.1, 1)` : 'none'
          }}
          onTransitionEnd={(e) => e.target === e.currentTarget && onSpinEnd()}
        >
          {count === 0 && <circle r={RADIUS} fill="#d4d4d8" />}
          {count === 1 && <circle r={RADIUS} fill={COLORS[0]} data-index={0} />}
          {items.map((item, i) => {
            const start = i * slice
            const mid = start + slice / 2
            const [x0, y0] = point(start, RADIUS)
            const [x1, y1] = point(start + slice, RADIUS)
            return (
              <g key={`${i}-${item}`}>
                {count > 1 && (
                  <path
                    d={`M0 0 L${x0} ${y0} A${RADIUS} ${RADIUS} 0 ${slice > 180 ? 1 : 0} 1 ${x1} ${y1} Z`}
                    fill={colorFor(i, count)}
                    stroke="#fff"
                    strokeWidth={2}
                    data-index={i}
                  />
                )}
                <text
                  transform={`rotate(${mid - 90})`}
                  x={RADIUS - 16}
                  textAnchor="end"
                  dominantBaseline="central"
                  fontSize={fontSize}
                  fontWeight={800}
                  fontFamily="'Baloo 2', 'Nunito', sans-serif"
                  fill="#fff"
                  stroke="rgba(0,0,0,0.3)"
                  strokeWidth={3}
                  paintOrder="stroke"
                  textLength={fit(item).squeeze ? available : undefined}
                  lengthAdjust="spacingAndGlyphs"
                  data-index={i}
                >
                  {fit(item).text}
                </text>
              </g>
            )
          })}
        </g>
        <circle r={34} fill="#fffdf8" stroke="#2b2622" strokeWidth={6} />
      </svg>
    </div>
  )
}
