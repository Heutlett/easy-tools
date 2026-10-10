import type { InstrumentId } from './synth'

export type IconId =
  InstrumentId | 'quijongo' | 'arpa' | 'chirimia' | 'saxofon' | 'clarinete' | 'trombon' | 'tuba'

/** Emojis que se ven en cualquier computadora (Unicode 11 o anterior); el resto se dibuja en SVG */
const EMOJI: Partial<Record<IconId, string>> = {
  piano: '🎹',
  guitarra: '🎸',
  violin: '🎻',
  trompeta: '🎺',
  tambor: '🥁',
  saxofon: '🎷'
}

const WOOD = '#a16207'
const DARK = '#1f2933'
const METAL = '#94a3b8'
const BRASS = '#eab308'

function Drawing({ id }: { id: IconId }): React.JSX.Element | null {
  switch (id) {
    case 'flauta':
      return (
        <g transform="rotate(-35 50 50)">
          <rect
            x="6"
            y="43"
            width="88"
            height="14"
            rx="7"
            fill={METAL}
            stroke={DARK}
            strokeWidth="2.5"
          />
          <ellipse cx="22" cy="50" rx="4" ry="3" fill={DARK} />
          {[40, 52, 64, 76, 86].map((x) => (
            <circle key={x} cx={x} cy="50" r="3" fill={DARK} />
          ))}
        </g>
      )
    case 'marimba':
      return (
        <g stroke={DARK} strokeWidth="2.5" strokeLinejoin="round">
          {[0, 1, 2, 3, 4].map((i) => (
            <g key={i}>
              <rect x={10 + i * 16} y={62} width="9" height={26 - i * 3} rx="4.5" fill="#fde68a" />
              <rect
                x={7 + i * 16}
                y={20 + i * 5}
                width="15"
                height={34 - i * 3}
                rx="3"
                fill="#b45309"
              />
            </g>
          ))}
        </g>
      )
    case 'ocarina':
      return (
        <g stroke={DARK} strokeWidth="2.5">
          <path
            d="M14 62 C14 34 40 24 60 30 C86 38 90 60 74 72 C58 84 14 86 14 62 Z"
            fill="#c2410c"
          />
          <rect
            x="6"
            y="52"
            width="16"
            height="9"
            rx="4"
            fill="#9a3412"
            transform="rotate(-20 14 56)"
          />
          {[
            [40, 52],
            [52, 46],
            [62, 54],
            [50, 62]
          ].map(([x, y]) => (
            <circle key={`${x}-${y}`} cx={x} cy={y} r="4" fill={DARK} />
          ))}
        </g>
      )
    case 'maracas':
      return (
        <g stroke={DARK} strokeWidth="2.5">
          <g transform="rotate(-25 30 50)">
            <rect x="26" y="52" width="8" height="40" rx="4" fill="#fde68a" />
            <ellipse cx="30" cy="36" rx="18" ry="24" fill="#dc2626" />
          </g>
          <g transform="rotate(25 70 50)">
            <rect x="66" y="52" width="8" height="40" rx="4" fill="#fde68a" />
            <ellipse cx="70" cy="36" rx="18" ry="24" fill="#2563eb" />
          </g>
          <circle cx="24" cy="32" r="3" fill="#fff" stroke="none" />
          <circle cx="76" cy="32" r="3" fill="#fff" stroke="none" />
        </g>
      )
    case 'pandereta':
      return (
        <g stroke={DARK} strokeWidth="2.5">
          <circle cx="50" cy="50" r="38" fill="#d4a373" />
          <circle cx="50" cy="50" r="29" fill="#fef3c7" />
          {[0, 90, 180, 270].map((a) => (
            <g key={a} transform={`rotate(${a + 45} 50 50)`}>
              <rect x="44" y="9" width="12" height="9" rx="2" fill="#fde047" />
            </g>
          ))}
          {[0, 90, 180, 270].map((a) => (
            <circle
              key={`c${a}`}
              cx={50 + 20 * Math.cos((a * Math.PI) / 180)}
              cy={50 + 20 * Math.sin((a * Math.PI) / 180)}
              r="3"
              fill="#fde047"
            />
          ))}
        </g>
      )
    case 'triangulo':
      return (
        <g stroke={METAL} strokeWidth="6" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <path d="M50 22 L12 82 L88 82 Z" stroke={DARK} strokeWidth="10" />
          <path d="M50 22 L12 82 L88 82 Z" />
          <path d="M50 22 L50 8" stroke={DARK} strokeWidth="2.5" />
          <path d="M74 70 L96 38" stroke={WOOD} strokeWidth="5" />
        </g>
      )
    case 'claves':
      return (
        <g stroke={DARK} strokeWidth="2.5">
          <rect
            x="8"
            y="42"
            width="84"
            height="14"
            rx="7"
            fill="#b45309"
            transform="rotate(-30 50 50)"
          />
          <rect
            x="8"
            y="46"
            width="84"
            height="14"
            rx="7"
            fill="#d97706"
            transform="rotate(30 50 50)"
          />
        </g>
      )
    case 'chirimia':
      return (
        <g stroke={DARK} strokeWidth="2.5" strokeLinejoin="round" transform="rotate(-35 50 50)">
          <path d="M8 47 L64 44 L92 30 L92 70 L64 56 L8 53 Z" fill="#92400e" />
          <rect x="3" y="45" width="10" height="10" rx="2" fill="#fde68a" />
          {[26, 36, 46, 56].map((x) => (
            <circle key={x} cx={x} cy="50" r="2.6" fill="#fde68a" />
          ))}
        </g>
      )
    case 'quijongo':
      return (
        <g stroke={DARK} strokeWidth="2.5" fill="none" strokeLinecap="round">
          <path d="M20 10 C48 36 48 66 24 88" stroke={WOOD} strokeWidth="6" />
          <path d="M20 10 L24 88" strokeWidth="1.8" />
          <circle cx="66" cy="66" r="20" fill="#ea8a2f" />
          <ellipse cx="66" cy="66" rx="9" ry="9" fill={DARK} />
          <path d="M44 66 L30 66" stroke={WOOD} strokeWidth="4" />
        </g>
      )
    case 'arpa':
      return (
        <g stroke={DARK} strokeWidth="2.5" strokeLinejoin="round">
          <path d="M22 90 L22 26 C22 10 52 8 80 16 C66 40 58 66 56 90 Z" fill="#fde68a" />
          <path d="M16 90 L64 90" strokeWidth="5" strokeLinecap="round" />
          {[0, 1, 2, 3, 4].map((i) => (
            <line
              key={i}
              x1={30 + i * 6}
              y1={20 + i * 0.5}
              x2={30 + i * 6}
              y2="88"
              strokeWidth="1.6"
            />
          ))}
        </g>
      )
    case 'clarinete':
      return (
        <g stroke={DARK} strokeWidth="2.5" strokeLinejoin="round" transform="rotate(-35 50 50)">
          <path d="M6 45 L78 45 L84 40 L96 36 L96 64 L84 60 L78 55 L6 55 Z" fill="#374151" />
          {[26, 38, 50, 62].map((x) => (
            <circle key={x} cx={x} cy="50" r="2.8" fill={METAL} />
          ))}
        </g>
      )
    case 'trombon':
      return (
        <g stroke={DARK} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" fill="none">
          <path d="M10 38 L74 38 M10 52 L74 52 M10 38 L10 52" stroke={BRASS} strokeWidth="8" />
          <path d="M10 38 L74 38 M10 52 L74 52" stroke={DARK} strokeWidth="1.6" />
          <path d="M74 38 L94 20 L94 70 L74 52 Z" fill={BRASS} />
          <path d="M70 52 L70 78 M82 52 L82 78" stroke={BRASS} strokeWidth="6" />
        </g>
      )
    case 'tuba':
      return (
        <g stroke={DARK} strokeWidth="2.5" strokeLinejoin="round" fill={BRASS}>
          <circle cx="42" cy="56" r="28" />
          <circle cx="42" cy="56" r="14" fill="#fef9c3" />
          <path d="M60 36 L82 14 L98 14 L98 44 L82 44 L66 56 Z" />
          <rect x="30" y="14" width="10" height="16" rx="3" />
        </g>
      )
    default:
      return null
  }
}

/** Dibujo de un instrumento: emoji cuando es seguro, y un dibujo propio en SVG cuando no existe el emoji */
export default function InstrumentIcon({
  id,
  size = 2.4,
  className
}: {
  id: IconId
  /** Tamaño en em */
  size?: number
  className?: string
}): React.JSX.Element {
  const emoji = EMOJI[id]
  if (emoji)
    return (
      <span
        className={`mus-icon ${className ?? ''}`}
        style={{ fontSize: `${size}em`, lineHeight: 1 }}
        aria-hidden
      >
        {emoji}
      </span>
    )
  return (
    <svg
      className={`mus-icon ${className ?? ''}`}
      viewBox="0 0 100 100"
      style={{ width: `${size}em`, height: `${size}em` }}
      aria-hidden
    >
      <Drawing id={id} />
    </svg>
  )
}
