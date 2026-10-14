import { useEffect, useState } from 'react'
import FileDrop from '../../components/FileDrop'
import JobStatus from '../../components/JobStatus'
import { stepOf, useToolStep } from '../../lib/toolStep'
import { baseName, formatDuration } from '../../lib/format'
import { useJob } from '../../lib/useJob'

export default function VideoToAudio(): React.JSX.Element {
  const [file, setFile] = useState<string | null>(null)
  const [duration, setDuration] = useState<number | null>(null)
  const [error, setError] = useState('')
  const job = useJob<{ output: string }>()
  useToolStep(stepOf(file !== null, job.status))

  useEffect(() => {
    if (!file) return
    let stale = false
    window.api.video.info(file).then(
      (info) => !stale && setDuration(info.duration),
      (err: Error) => {
        if (stale) return
        setError(err.message)
        setFile(null)
      }
    )
    return () => {
      stale = true
    }
  }, [file])

  const pick = (path: string): void => {
    setError('')
    setDuration(null)
    setFile(path)
  }

  const again = (): void => {
    job.reset()
    setFile(null)
    setError('')
  }

  return (
    <>
      {!file && (
        <>
          <FileDrop kind="video" title="Elige el video" onFiles={(p) => pick(p[0])} />
          {error && <p className="notice error">{error}</p>}
        </>
      )}

      {file && job.status === 'idle' && (
        <div className="panel">
          <div className="selected-file">
            <span>🎬</span>
            <strong>{baseName(file)}</strong>
            {duration !== null && <span className="muted">{formatDuration(duration)}</span>}
          </div>
          <div className="row start">
            <button
              className="btn big"
              disabled={duration === null}
              onClick={() => job.run((jobId) => window.api.video.toAudio({ jobId, input: file }))}
            >
              Sacar el audio (MP3)
            </button>
            <button className="btn secondary" onClick={again}>
              Elegir otro video
            </button>
          </div>
        </div>
      )}

      <JobStatus
        job={job}
        working="Sacando el audio…"
        again="Convertir otro video"
        onAgain={again}
      />
    </>
  )
}
