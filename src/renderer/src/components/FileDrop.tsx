import { useState } from 'react'
import type { FileKind } from '../../../shared/types'
import { matchesKind } from '../lib/fileKinds'

interface Props {
  kind: FileKind
  multiple?: boolean
  title: string
  hint?: string
  compact?: boolean
  onFiles: (paths: string[]) => void
}

const KIND_LABEL: Record<FileKind, string> = {
  video: 'un video',
  pdf: 'un PDF',
  image: 'una imagen',
  word: 'un documento de Word'
}

/** Zona grande para arrastrar archivos o hacer clic y elegirlos. */
export default function FileDrop({
  kind,
  multiple,
  title,
  hint,
  compact,
  onFiles
}: Props): React.JSX.Element {
  const [over, setOver] = useState(false)
  const [warning, setWarning] = useState('')

  const accept = (paths: string[]): void => {
    const valid = paths.filter((p) => matchesKind(p, kind))
    if (valid.length === 0) {
      setWarning(`Ese archivo no es ${KIND_LABEL[kind]}. Prueba con otro.`)
      return
    }
    setWarning('')
    onFiles(multiple ? valid : valid.slice(0, 1))
  }

  const choose = async (): Promise<void> => {
    const paths = await window.api.pickFiles(kind, multiple)
    if (paths.length > 0) accept(paths)
  }

  return (
    <div>
      <button
        type="button"
        className={`dropzone ${over ? 'over' : ''} ${compact ? 'compact' : ''}`}
        onClick={choose}
        onDragOver={(e) => {
          e.preventDefault()
          setOver(true)
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault()
          setOver(false)
          accept(Array.from(e.dataTransfer.files).map((f) => window.api.pathForFile(f)))
        }}
      >
        <span className="dropzone-icon" aria-hidden>
          {compact ? '＋' : '📂'}
        </span>
        <span className="dropzone-title">{title}</span>
        <span className="muted">{hint ?? 'Arrastra el archivo aquí o haz clic para buscarlo'}</span>
        {!compact && <span className="btn dropzone-btn">Buscar en mi computadora</span>}
      </button>
      {warning && <p className="notice error">{warning}</p>}
    </div>
  )
}
