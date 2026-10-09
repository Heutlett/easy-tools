import { useState } from 'react'
import FileDrop from '../../components/FileDrop'
import JobStatus from '../../components/JobStatus'
import { baseName } from '../../lib/format'
import { useJob } from '../../lib/useJob'

export default function WordToPdf(): React.JSX.Element {
  const [file, setFile] = useState<string | null>(null)
  const job = useJob<{ output: string }>()

  const again = (): void => {
    job.reset()
    setFile(null)
  }

  return (
    <>
      {!file && (
        <FileDrop
          kind="word"
          title="Elige el documento de Word"
          hint="Arrastra el archivo aquí o haz clic para buscarlo (.docx)"
          onFiles={(p) => setFile(p[0])}
        />
      )}

      {file && job.status === 'idle' && (
        <div className="panel">
          <div className="selected-file">
            <span>📘</span>
            <strong>{baseName(file)}</strong>
          </div>
          <p className="muted">
            El PDF se ve casi igual que el documento. Si el documento usa tipos de letra poco
            comunes, puede haber pequeñas diferencias.
          </p>
          <div className="row start">
            <button
              className="btn big"
              onClick={() => job.run(() => window.api.word.toPdf({ input: file }))}
            >
              Convertir a PDF
            </button>
            <button className="btn secondary" onClick={again}>
              Elegir otro documento
            </button>
          </div>
        </div>
      )}

      <JobStatus
        job={job}
        working="Convirtiendo a PDF…"
        cancellable={false}
        again="Convertir otro documento"
        onAgain={again}
      />
    </>
  )
}
