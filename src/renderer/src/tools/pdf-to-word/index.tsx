import { useState } from 'react'
import FileDrop from '../../components/FileDrop'
import JobStatus from '../../components/JobStatus'
import { baseName } from '../../lib/format'
import { pdfToWordModel } from '../../lib/pdfToWord'
import { useJob } from '../../lib/useJob'

export default function PdfToWord(): React.JSX.Element {
  const [file, setFile] = useState<string | null>(null)
  const job = useJob<{ output: string }>()

  const again = (): void => {
    job.reset()
    setFile(null)
  }

  const convert = (input: string): Promise<void> =>
    job.run(async () => {
      const model = await pdfToWordModel(input, (f) => job.report(f * 0.9, 'Leyendo el PDF…'))
      job.report(0.95, 'Creando el documento de Word…')
      return window.api.pdf.toWord({ input, model })
    })

  return (
    <>
      {!file && <FileDrop kind="pdf" title="Elige el PDF" onFiles={(p) => setFile(p[0])} />}

      {file && job.status === 'idle' && (
        <div className="panel">
          <div className="selected-file">
            <span>📄</span>
            <strong>{baseName(file)}</strong>
          </div>
          <p className="notice">
            Esta herramienta copia el <strong>texto</strong> del PDF a un documento de Word que
            puedes editar: negritas, tamaños, párrafos, encabezado y pie de página. Las tablas
            quedan como texto en columnas, sin sus bordes, y las imágenes no se copian. Funciona
            mejor con PDFs hechos en una computadora; un PDF escaneado (una foto de una hoja) no se
            puede convertir.
          </p>
          <div className="row start">
            <button className="btn big" onClick={() => convert(file)}>
              Convertir a Word
            </button>
            <button className="btn secondary" onClick={again}>
              Elegir otro PDF
            </button>
          </div>
        </div>
      )}

      <JobStatus
        job={job}
        working="Convirtiendo a Word…"
        cancellable={false}
        again="Convertir otro PDF"
        onAgain={again}
      />
    </>
  )
}
