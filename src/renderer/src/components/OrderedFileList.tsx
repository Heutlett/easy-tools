import { baseName } from '../lib/format'

interface Props {
  paths: string[]
  onChange: (paths: string[]) => void
  /** Contenido extra por archivo (miniatura, duración, etc.) */
  extra?: (path: string) => React.ReactNode
  disabled?: boolean
}

/** Lista de archivos que se puede reordenar y quitar con botones grandes. */
export default function OrderedFileList({
  paths,
  onChange,
  extra,
  disabled
}: Props): React.JSX.Element {
  const move = (from: number, to: number): void => {
    const next = [...paths]
    ;[next[from], next[to]] = [next[to], next[from]]
    onChange(next)
  }

  return (
    <ol className="file-list">
      {paths.map((path, i) => (
        <li key={`${path}-${i}`} className="file-item">
          <span className="file-number">{i + 1}</span>
          <div className="file-main">
            <span className="file-name" title={path}>
              {baseName(path)}
            </span>
            {extra?.(path)}
          </div>
          <div className="file-actions">
            <button
              className="icon-btn"
              title="Subir"
              disabled={disabled || i === 0}
              onClick={() => move(i, i - 1)}
            >
              ↑
            </button>
            <button
              className="icon-btn"
              title="Bajar"
              disabled={disabled || i === paths.length - 1}
              onClick={() => move(i, i + 1)}
            >
              ↓
            </button>
            <button
              className="icon-btn danger"
              title="Quitar"
              disabled={disabled}
              onClick={() => onChange(paths.filter((_, j) => j !== i))}
            >
              ✕
            </button>
          </div>
        </li>
      ))}
    </ol>
  )
}
