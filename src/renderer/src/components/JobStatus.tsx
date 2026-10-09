import { baseName } from '../lib/format'
import type { Job } from '../lib/useJob'

interface Props<T extends { output: string }> {
  job: Job<T>
  /** Texto mientras trabaja, por ejemplo "Recortando video…" */
  working: string
  /** Se puede cancelar (algunas tareas no lo permiten) */
  cancellable?: boolean
  /** Texto del botón para empezar de nuevo */
  again: string
  onAgain: () => void
  /** Qué mostrar como resultado (por defecto el nombre del archivo) */
  doneText?: (output: string) => string
}

/** Muestra progreso, error o resultado de una tarea. Devuelve null si no hay nada que mostrar. */
export default function JobStatus<T extends { output: string }>({
  job,
  working,
  cancellable = true,
  again,
  onAgain,
  doneText
}: Props<T>): React.JSX.Element | null {
  if (job.status === 'running') {
    const known = job.fraction > 0
    return (
      <div className="panel">
        <p className="panel-title">{job.label ?? working}</p>
        <div className={`bar ${known ? '' : 'indeterminate'}`}>
          <div
            className="bar-fill"
            style={{ width: known ? `${Math.round(job.fraction * 100)}%` : undefined }}
          />
        </div>
        <div className="row">
          <span className="muted">
            {known ? `${Math.round(job.fraction * 100)} %` : 'Esto puede tardar un poco…'}
          </span>
          {cancellable && (
            <button className="btn secondary" onClick={job.cancel}>
              Cancelar
            </button>
          )}
        </div>
      </div>
    )
  }

  if (job.status === 'error') {
    return (
      <div className="panel error-panel">
        <p className="panel-title">😕 No se pudo completar</p>
        <p>{job.error}</p>
        <button className="btn" onClick={job.reset}>
          Intentar de nuevo
        </button>
      </div>
    )
  }

  if (job.status === 'done' && job.result) {
    const out = job.result.output
    return (
      <div className="panel success-panel">
        <p className="panel-title">✅ ¡Listo!</p>
        <p>{doneText ? doneText(out) : baseName(out)}</p>
        <p className="muted">Se guardó en Documentos → Easy Tools</p>
        <div className="row start">
          <button className="btn" onClick={() => window.api.showItem(out)}>
            Mostrar en la carpeta
          </button>
          <button className="btn secondary" onClick={onAgain}>
            {again}
          </button>
        </div>
      </div>
    )
  }

  return null
}
