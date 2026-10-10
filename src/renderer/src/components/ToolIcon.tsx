import type { ToolMeta } from '../tools/types'

interface Props {
  tool: Pick<ToolMeta, 'icon' | 'images'>
  small?: boolean
}

/** Ícono de una herramienta: sus logos (con una flecha entre dos, en los convertidores) o, si no tiene, su emoji. */
export default function ToolIcon({ tool, small }: Props): React.JSX.Element {
  const size = small ? ' small' : ''
  if (!tool.images?.length) return <span className={`tool-icon${size}`}>{tool.icon}</span>
  return (
    <span className={`tool-icon logos${size}`}>
      {tool.images.map((src, i) => (
        <span key={src} className="logo-group">
          {i > 0 && <span className="logo-arrow">→</span>}
          <img src={src} alt="" />
        </span>
      ))}
    </span>
  )
}
