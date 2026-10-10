import { useEffect, useState } from 'react'
import FileDrop from '../../components/FileDrop'
import JobStatus from '../../components/JobStatus'
import OrderedFileList from '../../components/OrderedFileList'
import { formatDuration } from '../../lib/format'
import { useJob } from '../../lib/useJob'

export default function VideoJoin(): React.JSX.Element {
  const [files, setFiles] = useState<string[]>([])
  const [durations, setDurations] = useState<Record<string, number>>({})
  const [error, setError] = useState('')
  const job = useJob<{ output: string }>()

  // Pide la duración de cada video que se agrega (y avisa si alguno no sirve).
  useEffect(() => {
    files
      .filter((f) => durations[f] === undefined)
      .forEach((f) => {
        window.api.video.info(f).then(
          (info) => setDurations((d) => ({ ...d, [f]: info.duration })),
          (err: Error) => {
            setError(`${err.message} (${f.split(/[\\/]/).pop()})`)
            setFiles((list) => list.filter((x) => x !== f))
          }
        )
      })
  }, [files, durations])

  const add = (paths: string[]): void => {
    setError('')
    setFiles((list) => [...list, ...paths.filter((p) => !list.includes(p))])
  }

  const again = (): void => {
    job.reset()
    setFiles([])
  }

  const total = files.reduce((sum, f) => sum + (durations[f] ?? 0), 0)
  const ready = files.length >= 2 && files.every((f) => durations[f] !== undefined)
  const busy = job.status === 'running'

  return (
    <>
      {job.status !== 'done' && (
        <>
          {files.length === 0 ? (
            <FileDrop
              kind="video"
              multiple
              title="Elige los videos que quieres unir"
              hint="Puedes elegir varios a la vez"
              onFiles={add}
            />
          ) : (
            <>
              <OrderedFileList
                paths={files}
                onChange={setFiles}
                disabled={busy}
                extra={(p) => (
                  <span className="muted">
                    {durations[p] !== undefined ? formatDuration(durations[p]) : 'leyendo…'}
                  </span>
                )}
              />
              {!busy && (
                <FileDrop
                  kind="video"
                  multiple
                  compact
                  title="Agregar más videos"
                  hint=""
                  onFiles={add}
                />
              )}
            </>
          )}
          {error && <p className="notice error">{error}</p>}
          {files.length === 1 && (
            <p className="notice">Agrega al menos un video más para poder unirlos.</p>
          )}
        </>
      )}

      {files.length > 0 && job.status === 'idle' && (
        <div className="panel">
          <p>
            Se unirán <strong>{files.length} videos</strong> en el orden de la lista
            {ready && (
              <>
                {' '}
                — duración total: <strong>{formatDuration(total)}</strong>
              </>
            )}
            . Usa las flechas para cambiar el orden.
          </p>
          <p className="muted">
            Si los videos tienen distinto tamaño, se ajustan al del primero. Puede tardar unos
            minutos.
          </p>
          <div>
            <button
              className="btn big"
              disabled={!ready}
              onClick={() => job.run((jobId) => window.api.video.join({ jobId, inputs: files }))}
            >
              Unir videos
            </button>
          </div>
        </div>
      )}

      <JobStatus
        job={job}
        working="Uniendo los videos…"
        again="Unir otros videos"
        onAgain={again}
      />
    </>
  )
}
