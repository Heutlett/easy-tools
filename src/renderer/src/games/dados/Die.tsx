import { useEffect, useState } from 'react'
import { randomInt } from '../../lib/random'
import { COLOR_FACES, PIPS, type Rotation } from './data'

/** Cara de un dado normal con sus puntos */
export function Pips({ value }: { value: number }): React.JSX.Element {
  return (
    <span className="da-pips" aria-hidden>
      {Array.from({ length: 9 }, (_, i) => (
        <span key={i} className={PIPS[value].includes(i + 1) ? 'da-pip' : ''} />
      ))}
    </span>
  )
}

/** Cara de color con su nombre (para quien no distingue bien los colores) */
export function ColorFace({ index }: { index: number }): React.JSX.Element {
  const c = COLOR_FACES[index]
  return (
    <span className={`da-color ${c.dark ? 'dark' : ''}`} style={{ background: c.color }}>
      {c.name}
    </span>
  )
}

/** Cara con una palabra o frase que escribió quien usa el juego */
export function TextFace({ text }: { text: string }): React.JSX.Element {
  const size = text.length <= 3 ? 'xl' : text.length <= 7 ? 'lg' : text.length <= 11 ? 'md' : 'sm'
  return <span className={`da-text ${size}`}>{text}</span>
}

interface CubeProps {
  faces: React.ReactNode[]
  rotation: Rotation
  rolling: boolean
  size: 'l' | 'm' | 's'
  label: string
}

/** Dado en 3D con CSS: seis caras y un giro que termina con la cara elegida al frente */
export function Cube({ faces, rotation, rolling, size, label }: CubeProps): React.JSX.Element {
  const names = ['front', 'top', 'right', 'left', 'bottom', 'back']
  return (
    <div className={`da-cube-wrap ${size} ${rolling ? 'hop' : ''}`} role="img" aria-label={label}>
      <div
        className="da-cube"
        style={{ transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)` }}
      >
        {faces.map((node, i) => (
          <div key={i} className={`da-face ${names[i]}`}>
            {node}
          </div>
        ))}
      </div>
    </div>
  )
}

interface FlatProps {
  labels: string[]
  /** Cara que salió (índice); null si aún no hay */
  value: number | null
  rolling: boolean
  size: 'l' | 'm' | 's'
  label: string
}

/** Dado plano para los que no son cubos: mientras gira cambia rápido de cara */
export function FlatDie({ labels, value, rolling, size, label }: FlatProps): React.JSX.Element {
  const [ticker, setTicker] = useState(0)
  useEffect(() => {
    if (!rolling) return
    const id = setInterval(() => setTicker(randomInt(0, labels.length - 1)), 85)
    return () => clearInterval(id)
  }, [rolling, labels.length])
  const shown = rolling ? ticker : value
  return (
    <div
      className={`da-flat ${size} ${rolling ? 'rolling' : value === null ? '' : 'done'}`}
      role="img"
      aria-label={label}
    >
      {shown === null ? '?' : <TextFace text={labels[shown] ?? '?'} />}
    </div>
  )
}

interface CoinProps {
  rotation: number
  rolling: boolean
  size: 'l' | 'm' | 's'
  label: string
}

/** Moneda que gira sobre sí misma y cae mostrando cara o sello */
export function Coin({ rotation, rolling, size, label }: CoinProps): React.JSX.Element {
  return (
    <div className={`da-coin-wrap ${size} ${rolling ? 'toss' : ''}`} role="img" aria-label={label}>
      <div className="da-coin" style={{ transform: `rotateY(${rotation}deg)` }}>
        <div className="da-coin-face heads">
          <span className="da-coin-icon">🙂</span>
          <span className="da-coin-name">CARA</span>
        </div>
        <div className="da-coin-face tails">
          <span className="da-coin-icon">⭐</span>
          <span className="da-coin-name">SELLO</span>
        </div>
      </div>
    </div>
  )
}
