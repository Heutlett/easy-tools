import { useState } from 'react'
import pdfLogo from '../../assets/icons/pdf.svg'
import FileDrop from '../../components/FileDrop'
import JobStatus from '../../components/JobStatus'
import { stepOf, useToolStep } from '../../lib/toolStep'
import { baseName, nameWithoutExtension } from '../../lib/format'
import { openPdf, renderPageImage } from '../../lib/pdf'
import { useJob } from '../../lib/useJob'
import { usePersistentState } from '../../lib/usePersistentState'

type Format = 'jpg' | 'png'
type Saved = { output: string; count: number }

export default function PdfToImage(): React.JSX.Element {
  const [file, setFile] = useState<string | null>(null)
  const [format, setFormat] = usePersistentState<Format>('pdf-to-image-format', 'jpg')
  const job = useJob<Saved>()
  useToolStep(stepOf(file !== null, job.status))

  const again = (): void => {
    job.reset()
    setFile(null)
  }

  const convert = (input: string): Promise<void> =>
    job.run(async () => {
      const name = nameWithoutExtension(baseName(input))
      const doc = await openPdf(input)
      const digits = String(doc.numPages).length
      let dir: string | undefined
      for (let n = 1; n <= doc.numPages; n++) {
        job.report((n - 1) / doc.numPages, `Guardando la página ${n} de ${doc.numPages}…`)
        const data = await renderPageImage(doc, n, format)
        const saved = await window.api.output.saveInFolder({
          dir,
          folderName: `${name} (imágenes)`,
          fileName: `${name} - página ${String(n).padStart(digits, '0')}.${format}`,
          data
        })
        dir = saved.dir
      }
      return { output: dir!, count: doc.numPages }
    })

  return (
    <>
      {!file && <FileDrop kind="pdf" title="Elige el PDF" onFiles={(p) => setFile(p[0])} />}

      {file && job.status === 'idle' && (
        <div className="panel">
          <div className="selected-file">
            <img className="file-icon" src={pdfLogo} alt="" />
            <strong>{baseName(file)}</strong>
          </div>
          <div className="choices">
            <button
              className={`choice ${format === 'jpg' ? 'selected' : ''}`}
              aria-pressed={format === 'jpg'}
              onClick={() => setFormat('jpg')}
            >
              <strong>JPG</strong>
              <span className="muted">Pesa menos</span>
            </button>
            <button
              className={`choice ${format === 'png' ? 'selected' : ''}`}
              aria-pressed={format === 'png'}
              onClick={() => setFormat('png')}
            >
              <strong>PNG</strong>
              <span className="muted">Más nítida</span>
            </button>
          </div>
          <div className="row start">
            <button className="btn big" onClick={() => convert(file)}>
              Guardar imágenes
            </button>
            <button className="btn secondary" onClick={again}>
              Elegir otro PDF
            </button>
          </div>
        </div>
      )}

      <JobStatus
        job={job}
        working="Guardando las imágenes…"
        cancellable={false}
        again="Convertir otro PDF"
        onAgain={again}
        doneText={() =>
          job.result
            ? `${job.result.count} ${job.result.count === 1 ? 'imagen guardada' : 'imágenes guardadas'}`
            : ''
        }
      />
    </>
  )
}
