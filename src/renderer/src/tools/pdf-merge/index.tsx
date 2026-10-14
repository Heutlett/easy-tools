import { useEffect, useState } from 'react'
import FileDrop from '../../components/FileDrop'
import JobStatus from '../../components/JobStatus'
import { stepOf, useToolStep } from '../../lib/toolStep'
import OrderedFileList from '../../components/OrderedFileList'
import { openPdf, renderThumbnail } from '../../lib/pdf'
import { useJob } from '../../lib/useJob'

interface PdfMeta {
  pages: number
  thumb: string
}

export default function PdfMerge(): React.JSX.Element {
  const [files, setFiles] = useState<string[]>([])
  const [meta, setMeta] = useState<Record<string, PdfMeta | 'error'>>({})
  const job = useJob<{ output: string }>()
  useToolStep(stepOf(files.length > 0, job.status))

  // Lee la cantidad de páginas y dibuja una miniatura de la primera de cada PDF.
  useEffect(() => {
    files
      .filter((f) => meta[f] === undefined)
      .forEach(async (f) => {
        setMeta((m) => ({ ...m, [f]: 'error' }))
        try {
          const doc = await openPdf(f)
          const thumb = await renderThumbnail(doc, 1, 120)
          setMeta((m) => ({ ...m, [f]: { pages: doc.numPages, thumb } }))
        } catch (err) {
          // Se queda marcado como error: el motor de unión mostrará el mensaje exacto si falla.
          console.error('miniatura', err)
        }
      })
  }, [files, meta])

  const add = (paths: string[]): void =>
    setFiles((list) => [...list, ...paths.filter((p) => !list.includes(p))])
  const again = (): void => {
    job.reset()
    setFiles([])
  }
  const busy = job.status === 'running'
  const totalPages = files.reduce(
    (sum, f) => sum + (typeof meta[f] === 'object' ? meta[f].pages : 0),
    0
  )

  return (
    <>
      {job.status !== 'done' && (
        <>
          {files.length === 0 ? (
            <FileDrop
              kind="pdf"
              multiple
              title="Elige los PDFs que quieres unir"
              hint="Puedes elegir varios a la vez"
              onFiles={add}
            />
          ) : (
            <>
              <OrderedFileList
                paths={files}
                onChange={setFiles}
                disabled={busy}
                extra={(p) => {
                  const m = meta[p]
                  if (typeof m !== 'object') return null
                  return (
                    <>
                      <img className="file-thumb" src={m.thumb} alt="" />
                      <span className="muted">
                        {m.pages} {m.pages === 1 ? 'página' : 'páginas'}
                      </span>
                    </>
                  )
                }}
              />
              {!busy && (
                <FileDrop
                  kind="pdf"
                  multiple
                  compact
                  title="Agregar más PDFs"
                  hint=""
                  onFiles={add}
                />
              )}
            </>
          )}
          {files.length === 1 && (
            <p className="notice">Agrega al menos un PDF más para poder unirlos.</p>
          )}
        </>
      )}

      {files.length >= 2 && job.status === 'idle' && (
        <div className="panel">
          <p>
            Se unirán <strong>{files.length} PDFs</strong> en el orden de la lista
            {totalPages > 0 && <> ({totalPages} páginas en total)</>}. Usa las flechas para cambiar
            el orden.
          </p>
          <div>
            <button
              className="btn big"
              onClick={() => job.run(() => window.api.pdf.merge({ inputs: files }))}
            >
              Unir PDFs
            </button>
          </div>
        </div>
      )}

      <JobStatus
        job={job}
        working="Uniendo los PDFs…"
        cancellable={false}
        again="Unir otros PDFs"
        onAgain={again}
      />
    </>
  )
}
