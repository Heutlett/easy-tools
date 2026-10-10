/** Fichas de la carrera dibujadas en SVG (se ven igual en cualquier computador). */
import type { ThemeId } from './themes'

interface TokenProps {
  theme: ThemeId
  color: string
  /** Casilla actual: las ruedas giran al avanzar */
  pos?: number
}

const spin = (deg: number, cx: number, cy: number): React.CSSProperties => ({
  transform: `rotate(${deg}deg)`,
  transformOrigin: `${cx}px ${cy}px`,
  transition: 'transform 0.6s ease-in-out'
})

function Turtle({ color }: { color: string }): React.JSX.Element {
  return (
    <g>
      <path d="M13 39 L3 43 L15 46 Z" fill="#6aa84f" />
      <ellipse className="cr-flip" cx="28" cy="48" rx="9" ry="4.5" fill="#6aa84f" />
      <path d="M17 42 C17 12 71 12 71 42 Z" fill={color} stroke="rgba(0,0,0,.28)" strokeWidth="2" />
      <path
        d="M29 40 C29 28 35 21 44 21 C53 21 59 28 59 40 M44 21 V40 M23 36 L31 29 M65 36 L57 29"
        fill="none"
        stroke="rgba(255,255,255,.6)"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path d="M15 42 H73 Q73 49 66 49 H22 Q15 49 15 42 Z" fill="#f1e0a1" />
      <ellipse cx="73" cy="38" rx="7" ry="5" fill="#6aa84f" />
      <circle cx="84" cy="31" r="9.5" fill="#7fb85a" />
      <circle cx="87.5" cy="28.5" r="2.4" fill="#fff" />
      <circle cx="88.2" cy="28.6" r="1.3" fill="#111" />
      <path
        d="M84 35.5 Q89 38 93 34.5"
        fill="none"
        stroke="#14532d"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <ellipse className="cr-flip" cx="63" cy="49" rx="9" ry="4.5" fill="#6aa84f" />
    </g>
  )
}

function Bus({ color, pos }: { color: string; pos: number }): React.JSX.Element {
  const wheel = (cx: number): React.JSX.Element => (
    <g style={spin(pos * 120, cx, 50)}>
      <circle cx={cx} cy="50" r="8.5" fill="#1f2937" />
      <circle cx={cx} cy="50" r="4" fill="#d1d5db" />
      <path d={`M${cx} 46 V54 M${cx - 4} 50 H${cx + 4}`} stroke="#6b7280" strokeWidth="1.5" />
    </g>
  )
  return (
    <g>
      <rect
        x="4"
        y="10"
        width="92"
        height="40"
        rx="9"
        fill={color}
        stroke="rgba(0,0,0,.25)"
        strokeWidth="2"
      />
      <rect x="4" y="38" width="92" height="5" fill="rgba(255,255,255,.85)" />
      {[10, 28, 46, 64].map((x) => (
        <rect
          key={x}
          x={x}
          y="16"
          width="14"
          height="14"
          rx="3"
          fill="#dff3ff"
          stroke="rgba(0,0,0,.2)"
          strokeWidth="1.2"
        />
      ))}
      <path
        d="M81 16 H90 Q93 16 93 20 V30 H81 Z"
        fill="#dff3ff"
        stroke="rgba(0,0,0,.2)"
        strokeWidth="1.2"
      />
      <circle cx="92" cy="38" r="2.6" fill="#fde047" />
      {wheel(24)}
      {wheel(72)}
    </g>
  )
}

function Carreta({ color, pos }: { color: string; pos: number }): React.JSX.Element {
  const petals = Array.from({ length: 8 }, (_, i) => i)
  const palette = ['#dc2626', '#facc15', '#2563eb', '#16a34a']
  return (
    <g>
      <path d="M72 30 L99 40" stroke="#7c4a1d" strokeWidth="3.5" strokeLinecap="round" />
      <path d="M8 10 H86 L80 32 H14 Z" fill={color} stroke="rgba(0,0,0,.28)" strokeWidth="2" />
      {[24, 38, 52, 66].map((x) => (
        <path key={x} d={`M${x} 14 l5 7 l-5 7 l-5 -7 Z`} fill="rgba(255,255,255,.85)" />
      ))}
      <g style={spin(pos * 60, 40, 40)}>
        <circle cx="40" cy="40" r="19" fill="#fef3c7" stroke="#7c2d12" strokeWidth="3" />
        {petals.map((i) => (
          <path
            key={i}
            d="M40 40 L33 23 Q40 19 47 23 Z"
            fill={palette[i % 4]}
            transform={`rotate(${i * 45} 40 40)`}
          />
        ))}
        <circle cx="40" cy="40" r="4" fill="#7c2d12" />
      </g>
    </g>
  )
}

export function Token({ theme, color, pos = 0 }: TokenProps): React.JSX.Element {
  return (
    <svg viewBox="0 0 102 60" className="cr-svg" aria-hidden>
      {theme === 'tortugas' ? (
        <Turtle color={color} />
      ) : theme === 'buses' ? (
        <Bus color={color} pos={pos} />
      ) : (
        <Carreta color={color} pos={pos} />
      )}
    </svg>
  )
}
