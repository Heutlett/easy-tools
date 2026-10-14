import type { PDFDocumentProxy } from 'pdfjs-dist/legacy/build/pdf.mjs'
import { useEffect, useRef, useState } from 'react'
import FileDrop from '../../components/FileDrop'
import JobStatus from '../../components/JobStatus'
import { stepOf, useToolStep } from '../../lib/toolStep'
import pdfLogo from '../../assets/icons/pdf.svg'
import { baseName } from '../../lib/format'
import { openPdf, renderThumbnail } from '../../lib/pdf'
import { useJob } from '../../lib/useJob'

/** "1-3, 5" -> [1,2,3,5]. Devuelve null si no se entiende. */
function parsePages(text: string, max: number): number[] | null {
  const pages = new Set<number>()
  for (const part of text
    .split(/[,;]/)
    .map((s) => s.trim())
    .filter(Boolean)) {
    const m = part.match(/^(\d+)\s*(?:-\s*(\d+))?$/)
    if (!m) return null
    const a = Number(m[1])
    const b = m[2] ? Number(m[2]) : a
    for (let n = Math.min(a, b); n <= Math.max(a, b); n++) if (n >= 1 && n <= max) pages.add(n)
  }
  return [...pages]
}

function Thumb({
  doc,
  page,
  selected,
  onToggle
}: {
  doc: PDFDocumentProxy
  page: number
  selected: boolean
  onToggle: () => void
}): React.JSX.Element {
  const [src, setSrc] = useState<string | null>(null)
  const ref = useRef<HTMLButtonElement>(null)

  // Solo dibuja la miniatura cuando está cerca de verse (los PDFs largos no se traban).
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting) return
        observer.disconnect()
        renderThumbnail(doc, page).then(setSrc, () => {})
      },
      { rootMargin: '400px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [doc, page])

  return (
    <button
      ref={ref}
      className={`thumb ${selected ? 'selected' : ''}`}
      onClick={onToggle}
      aria-pressed={selected}
    >
      {src ? (
        <img className="thumb-img" src={src} alt={`Página ${page}`} />
      ) : (
        <div className="thumb-placeholder" />
      )}
      <span>Página {page}</span>
      {selected && <span className="thumb-check">✓</span>}
    </button>
  )
}

export default function PdfSplit(): React.JSX.Element {
  const [file, setFile] = useState<string | null>(null)
  const [doc, setDoc] = useState<PDFDocumentProxy | null>(null)
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [rangeText, setRangeText] = useState('')
  const [error, setError] = useState('')
  const job = useJob<{ output: string; count: number }>()
  useToolStep(stepOf(file !== null, job.status))

  useEffect(() => {
    if (!file) return
    let stale = false
    openPdf(file).then(
      (opened) => !stale && setDoc(opened),
      () => {
        if (stale) return
        setError('No se pudo abrir ese PDF. ¿Tiene contraseña o está dañado?')
        setFile(null)
      }
    )
    return () => {
      stale = true
    }
  }, [file])

  const pick = (path: string): void => {
    setError('')
    setDoc(null)
    setSelected(new Set())
    setRangeText('')
    setFile(path)
  }

  const total = doc?.numPages ?? 0
  const toggle = (page: number): void =>
    setSelected((s) => {
      const next = new Set(s)
      if (!next.delete(page)) next.add(page)
      return next
    })

  const applyRange = (text: string): void => {
    setRangeText(text)
    const pages = parsePages(text, total)
    if (pages) setSelected(new Set(pages))
  }

  const again = (): void => {
    job.reset()
    setFile(null)
    setError('')
  }

  const busy = job.status === 'running'

  return (
    <>
      {!file && (
        <>
          <FileDrop kind="pdf" title="Elige el PDF" onFiles={(p) => pick(p[0])} />
          {error && <p className="notice error">{error}</p>}
        </>
      )}

      {file && !doc && <p className="muted">Abriendo el PDF…</p>}

      {file && doc && job.status !== 'done' && (
        <>
          <div className="selected-file">
            <img className="file-icon" src={pdfLogo} alt="" />
            <strong>{baseName(file)}</strong>
            <span className="muted">
              {total} {total === 1 ? 'página' : 'páginas'}
            </span>
            {!busy && (
              <button className="btn secondary" onClick={again}>
                Elegir otro PDF
              </button>
            )}
          </div>

          <div className="panel">
            <p className="panel-title">1. Marca las páginas que quieres</p>
            <div className="row start">
              <button
                className="btn secondary"
                disabled={busy}
                onClick={() => (
                  setSelected(new Set(Array.from({ length: total }, (_, i) => i + 1))),
                  setRangeText('')
                )}
              >
                Todas
              </button>
              <button
                className="btn secondary"
                disabled={busy}
                onClick={() => (setSelected(new Set()), setRangeText(''))}
              >
                Ninguna
              </button>
              <input
                className="field"
                placeholder="O escribe: 1-3, 5"
                aria-label="Escribir las páginas, por ejemplo 1-3, 5"
                value={rangeText}
                disabled={busy}
                onChange={(e) => applyRange(e.target.value)}
              />
              <span className="muted">
                {selected.size} {selected.size === 1 ? 'elegida' : 'elegidas'}
              </span>
            </div>
          </div>

          <div className="thumb-grid">
            {Array.from({ length: total }, (_, i) => i + 1).map((page) => (
              <Thumb
                key={page}
                doc={doc}
                page={page}
                selected={selected.has(page)}
                onToggle={() => !busy && toggle(page)}
              />
            ))}
          </div>

          {job.status === 'idle' && (
            <div className="panel">
              <p className="panel-title">2. ¿Qué quieres hacer?</p>
              <div className="row start">
                <button
                  className="btn big"
                  disabled={selected.size === 0}
                  onClick={() =>
                    job.run(() =>
                      window.api.pdf.split({ input: file, pages: [...selected], mode: 'selected' })
                    )
                  }
                >
                  Guardar las páginas elegidas en un PDF
                </button>
                <button
                  className="btn secondary"
                  onClick={() =>
                    job.run(() => window.api.pdf.split({ input: file, pages: [], mode: 'each' }))
                  }
                >
                  Separar todas (un PDF por página)
                </button>
              </div>
            </div>
          )}
        </>
      )}

      <JobStatus
        job={job}
        working="Separando las páginas…"
        cancellable={false}
        again="Separar otro PDF"
        onAgain={again}
        doneText={(out) =>
          job.result && job.result.count > 1
            ? `${job.result.count} páginas guardadas: ${baseName(out)}`
            : baseName(out)
        }
      />
    </>
  )
}
