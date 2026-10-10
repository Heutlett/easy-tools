import { useState } from 'react'
import JobStatus from '../../components/JobStatus'
import { formatDuration } from '../../lib/format'
import { useJob } from '../../lib/useJob'

type Info = Awaited<ReturnType<typeof window.api.youtube.info>>
type Mode = 'video' | 'audio'

export default function YoutubeDownload(): React.JSX.Element {
  const [url, setUrl] = useState('')
  const [info, setInfo] = useState<Info | null>(null)
  const [searching, setSearching] = useState(false)
  const [error, setError] = useState('')
  const [mode, setMode] = useState<Mode>('video')
  const job = useJob<{ output: string }>()

  const search = async (value = url): Promise<void> => {
    setError('')
    setInfo(null)
    setSearching(true)
    try {
      setInfo(await window.api.youtube.info(value))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo revisar el enlace.')
    } finally {
      setSearching(false)
    }
  }

  const paste = async (): Promise<void> => {
    try {
      const text = (await navigator.clipboard.readText()).trim()
      if (text) {
        setUrl(text)
        search(text)
      }
    } catch {
      setError('No se pudo pegar. Haz clic en el cuadro y usa Ctrl + V.')
    }
  }

  const again = (): void => {
    job.reset()
    setUrl('')
    setInfo(null)
    setError('')
  }

  const busy = job.status === 'running'

  return (
    <>
      {job.status !== 'done' && (
        <div className="panel">
          <label className="panel-title" htmlFor="yt-url">
            Pega aquí el enlace del video
          </label>
          <div className="url-row">
            <input
              id="yt-url"
              className="field"
              placeholder="https://www.youtube.com/watch?v=…"
              value={url}
              disabled={busy}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && url.trim() && search()}
            />
            <button className="btn secondary" disabled={busy} onClick={paste}>
              📋 Pegar
            </button>
            <button
              className="btn"
              disabled={busy || searching || !url.trim()}
              onClick={() => search()}
            >
              {searching ? 'Buscando…' : 'Buscar'}
            </button>
          </div>
          {error && <p className="notice error">{error}</p>}
        </div>
      )}

      {info && job.status !== 'done' && (
        <div className="panel">
          <div className="video-card">
            {info.thumbnail && <img src={info.thumbnail} alt="" />}
            <div>
              <strong>{info.title}</strong>
              <p className="muted">
                {[info.channel, info.duration ? formatDuration(info.duration) : null]
                  .filter(Boolean)
                  .join(' · ')}
              </p>
            </div>
          </div>

          <div className="choices">
            <button
              className={`choice ${mode === 'video' ? 'selected' : ''}`}
              disabled={busy}
              onClick={() => setMode('video')}
            >
              <strong>🎬 Video</strong>
              <span className="muted">Con imagen y sonido (MP4)</span>
            </button>
            <button
              className={`choice ${mode === 'audio' ? 'selected' : ''}`}
              disabled={busy}
              onClick={() => setMode('audio')}
            >
              <strong>🎵 Solo audio</strong>
              <span className="muted">Solo el sonido (MP3)</span>
            </button>
          </div>

          {job.status === 'idle' && (
            <div>
              <button
                className="btn big"
                onClick={() =>
                  job.run((jobId) => window.api.youtube.download({ jobId, url, mode }))
                }
              >
                Descargar
              </button>
            </div>
          )}
        </div>
      )}

      <JobStatus job={job} working="Descargando…" again="Descargar otro" onAgain={again} />
    </>
  )
}
