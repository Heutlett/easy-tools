import { useEffect, useRef, useState } from 'react'
import FileDrop from '../../components/FileDrop'
import JobStatus from '../../components/JobStatus'
import { stepOf, useToolStep } from '../../lib/toolStep'
import TimeField from '../../components/TimeField'
import TrimTimeline from '../../components/TrimTimeline'
import { baseName, formatDuration, formatTime } from '../../lib/format'
import { useFilmstrip } from '../../lib/useFilmstrip'
import { useJob } from '../../lib/useJob'

const FRAME_COUNT = 12
const MIN_GAP = 0.3
/** Margen para no quedar pegados al último instante del recorte */
const END_MARGIN = 0.03

export default function VideoTrim(): React.JSX.Element {
  const [file, setFile] = useState<string | null>(null)
  const [duration, setDuration] = useState(0)
  const [range, setRange] = useState<[number, number]>([0, 0])
  const [current, setCurrent] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [loop, setLoop] = useState(true)
  const [previewFailed, setPreviewFailed] = useState(false)
  const [error, setError] = useState('')
  const video = useRef<HTMLVideoElement>(null)
  const job = useJob<{ output: string }>()
  useToolStep(stepOf(file !== null, job.status))
  const frames = useFilmstrip(file, duration, FRAME_COUNT)

  const [start, end] = range

  useEffect(() => {
    if (!file) return
    let stale = false
    window.api.video.info(file).then(
      (info) => {
        if (stale) return
        setDuration(info.duration)
        setRange([0, info.duration])
        setCurrent(0)
      },
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
    setDuration(0)
    setPlaying(false)
    setPreviewFailed(false)
    setFile(path)
  }

  const seek = (t: number): void => {
    if (video.current) video.current.currentTime = t
    setCurrent(t)
  }

  // Mientras se reproduce, vigila el reloj del video para detenerse (o repetir) justo al final del recorte.
  useEffect(() => {
    if (!playing) return
    let frame = 0
    const tick = (): void => {
      const v = video.current
      if (v) {
        setCurrent(v.currentTime)
        if (v.currentTime >= end - END_MARGIN) {
          v.currentTime = start
          if (!loop) v.pause()
        }
      }
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [playing, start, end, loop])

  const togglePlay = (): void => {
    const v = video.current
    if (!v || previewFailed) return
    if (!v.paused) return v.pause()
    if (v.currentTime < start - 0.05 || v.currentTime >= end - END_MARGIN) seek(start)
    v.play()
  }

  // Barra espaciadora = reproducir / pausar el recorte
  useEffect(() => {
    const onKey = (e: KeyboardEvent): void => {
      if (e.code !== 'Space' || (e.target as HTMLElement).tagName === 'INPUT') return
      e.preventDefault()
      togglePlay()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const changeRange = (s: number, e: number): void => {
    video.current?.pause()
    setRange([s, e])
  }
  const setStart = (t: number): void => {
    changeRange(Math.min(t, end - MIN_GAP), end)
    seek(Math.min(t, end - MIN_GAP))
  }
  const setEnd = (t: number): void => {
    const next = Math.max(t, start + MIN_GAP)
    changeRange(start, next)
    seek(Math.max(start, next - 0.05))
  }

  const again = (): void => {
    job.reset()
    setFile(null)
    setError('')
  }

  const busy = job.status === 'running'
  const isFullVideo = start <= 0.05 && end >= duration - 0.05
  const clipLength = end - start
  const clipPosition = Math.min(clipLength, Math.max(0, current - start))

  return (
    <>
      {!file && (
        <>
          <FileDrop
            kind="video"
            title="Elige el video que quieres recortar"
            onFiles={(p) => pick(p[0])}
          />
          {error && <p className="notice error">{error}</p>}
        </>
      )}

      {file && duration > 0 && job.status !== 'done' && (
        <>
          <div className="selected-file">
            <span>🎬</span>
            <strong>{baseName(file)}</strong>
            <span className="muted">{formatDuration(duration)}</span>
            {!busy && (
              <button className="btn secondary small" onClick={again}>
                Elegir otro video
              </button>
            )}
          </div>

          <div className="trim-layout">
            {previewFailed ? (
              <p className="notice">
                Este video no se puede reproducir aquí, pero igual puedes recortarlo con la tira de
                fotogramas o escribiendo los tiempos.
              </p>
            ) : (
              <div className="preview">
                <div className="preview-stage" onClick={togglePlay}>
                  <video
                    ref={video}
                    className="player"
                    src={window.api.mediaUrl(file)}
                    onError={() => setPreviewFailed(true)}
                    onLoadedMetadata={(e) => (e.currentTarget.currentTime = 0)}
                    onPlay={() => setPlaying(true)}
                    onPause={() => setPlaying(false)}
                    onEnded={(e) => {
                      e.currentTarget.currentTime = start
                      if (loop) e.currentTarget.play()
                    }}
                  />
                  {!playing && <div className="play-overlay">▶</div>}
                  <span className="preview-badge">Así quedará tu video</span>
                </div>
                <div className="clip-bar">
                  <button className="btn" onClick={togglePlay}>
                    {playing ? '⏸ Pausar' : '▶ Ver el recorte'}
                  </button>
                  <span className="clip-time">
                    {formatTime(clipPosition, true)}{' '}
                    <span className="muted">/ {formatTime(clipLength, true)}</span>
                  </span>
                  <label className="check">
                    <input
                      type="checkbox"
                      checked={loop}
                      onChange={(e) => setLoop(e.target.checked)}
                    />
                    Repetir
                  </label>
                </div>
              </div>
            )}

            <aside className="trim-side">
              <div className="time-box">
                <label htmlFor="trim-start">Empieza en</label>
                <div className="time-input">
                  <TimeField
                    id="trim-start"
                    value={start}
                    min={0}
                    max={end - MIN_GAP}
                    onChange={setStart}
                  />
                  {!previewFailed && (
                    <button
                      className="btn secondary small"
                      title="Empezar donde está el video ahora"
                      disabled={busy}
                      onClick={() => setStart(current)}
                    >
                      📍 Aquí
                    </button>
                  )}
                </div>
              </div>
              <div className="time-box">
                <label htmlFor="trim-end">Termina en</label>
                <div className="time-input">
                  <TimeField
                    id="trim-end"
                    value={end}
                    min={start + MIN_GAP}
                    max={duration}
                    onChange={setEnd}
                  />
                  {!previewFailed && (
                    <button
                      className="btn secondary small"
                      title="Terminar donde está el video ahora"
                      disabled={busy}
                      onClick={() => setEnd(current)}
                    >
                      📍 Aquí
                    </button>
                  )}
                </div>
              </div>
              <p className="trim-summary">
                El recorte durará <strong>{formatDuration(clipLength)}</strong>
                {isFullVideo && <span className="muted"> — es el video completo</span>}
              </p>
              {job.status === 'idle' && (
                <button
                  className="btn big"
                  disabled={isFullVideo}
                  onClick={() =>
                    job.run((jobId) => window.api.video.trim({ jobId, input: file, start, end }))
                  }
                >
                  Guardar recorte
                </button>
              )}
            </aside>
          </div>

          <div>
            <p className="timeline-hint">
              Mueve las manijas amarillas para elegir qué parte conservar. Arrastra la parte
              resaltada para moverla completa.
            </p>
            <TrimTimeline
              duration={duration}
              start={start}
              end={end}
              current={current}
              frames={frames}
              onChange={changeRange}
              onSeek={seek}
            />
          </div>
        </>
      )}

      {file && duration === 0 && <p className="muted">Leyendo el video…</p>}

      <JobStatus
        job={job}
        working="Recortando el video…"
        again="Recortar otro video"
        onAgain={again}
      />
    </>
  )
}
