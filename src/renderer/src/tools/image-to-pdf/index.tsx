import { PDFDocument } from 'pdf-lib'
import { useState } from 'react'
import FileDrop from '../../components/FileDrop'
import JobStatus from '../../components/JobStatus'
import OrderedFileList from '../../components/OrderedFileList'
import { baseName, nameWithoutExtension } from '../../lib/format'
import { imageToJpeg } from '../../lib/image'
import { useJob } from '../../lib/useJob'
import { usePersistentState } from '../../lib/usePersistentState'

type PageSize = 'letter' | 'image'

/** Hoja carta en puntos */
const LETTER = { width: 612, height: 792 }
const MARGIN = 18

export default function ImageToPdf(): React.JSX.Element {
  const [files, setFiles] = useState<string[]>([])
  const [pageSize, setPageSize] = usePersistentState<PageSize>('image-to-pdf-size', 'letter')
  const job = useJob<{ output: string }>()

  const add = (paths: string[]): void =>
    setFiles((list) => [...list, ...paths.filter((p) => !list.includes(p))])
  const again = (): void => {
    job.reset()
    setFiles([])
  }

  const create = (): Promise<void> =>
    job.run(async () => {
      const pdf = await PDFDocument.create()
      for (const [i, path] of files.entries()) {
        job.report(i / files.length, `Preparando la imagen ${i + 1} de ${files.length}…`)
        const image = await imageToJpeg(path)
        const embedded = await pdf.embedJpg(new Uint8Array(image.data))
        if (pageSize === 'image') {
          // La página mide lo mismo que la imagen (96 píxeles por pulgada = 72 puntos)
          const w = image.width * 0.75
          const h = image.height * 0.75
          pdf.addPage([w, h]).drawImage(embedded, { x: 0, y: 0, width: w, height: h })
        } else {
          // Hoja carta: acostada si la imagen es más ancha que alta, y la imagen entra completa y centrada
          const landscape = image.width > image.height
          const page = pdf.addPage(
            landscape ? [LETTER.height, LETTER.width] : [LETTER.width, LETTER.height]
          )
          const fit = Math.min(
            (page.getWidth() - 2 * MARGIN) / image.width,
            (page.getHeight() - 2 * MARGIN) / image.height
          )
          const w = image.width * fit
          const h = image.height * fit
          page.drawImage(embedded, {
            x: (page.getWidth() - w) / 2,
            y: (page.getHeight() - h) / 2,
            width: w,
            height: h
          })
        }
      }
      const bytes = await pdf.save()
      return window.api.output.saveFile({
        name: files.length === 1 ? nameWithoutExtension(baseName(files[0])) : 'Imágenes',
        ext: '.pdf',
        data: bytes.buffer.slice(
          bytes.byteOffset,
          bytes.byteOffset + bytes.byteLength
        ) as ArrayBuffer
      })
    })

  const busy = job.status === 'running'

  return (
    <>
      {job.status !== 'done' && (
        <>
          {files.length === 0 ? (
            <FileDrop
              kind="image"
              multiple
              title="Elige las imágenes"
              hint="Puedes elegir varias a la vez"
              onFiles={add}
            />
          ) : (
            <>
              <OrderedFileList
                paths={files}
                onChange={setFiles}
                disabled={busy}
                extra={(p) => <img className="file-thumb" src={window.api.mediaUrl(p)} alt="" />}
              />
              {!busy && (
                <FileDrop
                  kind="image"
                  multiple
                  compact
                  title="Agregar más imágenes"
                  hint=""
                  onFiles={add}
                />
              )}
            </>
          )}
        </>
      )}

      {files.length > 0 && job.status === 'idle' && (
        <div className="panel">
          <div className="choices">
            <button
              className={`choice ${pageSize === 'letter' ? 'selected' : ''}`}
              aria-pressed={pageSize === 'letter'}
              onClick={() => setPageSize('letter')}
            >
              <strong>Hoja carta</strong>
              <span className="muted">Cada imagen centrada en una hoja</span>
            </button>
            <button
              className={`choice ${pageSize === 'image' ? 'selected' : ''}`}
              aria-pressed={pageSize === 'image'}
              onClick={() => setPageSize('image')}
            >
              <strong>Del tamaño de la imagen</strong>
              <span className="muted">Sin bordes blancos</span>
            </button>
          </div>
          <div>
            <button className="btn big" onClick={create}>
              Crear PDF
            </button>
          </div>
        </div>
      )}

      <JobStatus
        job={job}
        working="Creando el PDF…"
        cancellable={false}
        again="Crear otro PDF"
        onAgain={again}
      />
    </>
  )
}
