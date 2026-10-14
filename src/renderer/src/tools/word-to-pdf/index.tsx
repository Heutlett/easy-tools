import { useEffect, useState } from 'react'
import FileDrop from '../../components/FileDrop'
import JobStatus from '../../components/JobStatus'
import { stepOf, useToolStep } from '../../lib/toolStep'
import wordLogo from '../../assets/icons/word.svg'
import { baseName } from '../../lib/format'
import { useJob } from '../../lib/useJob'

type Engine = Awaited<ReturnType<typeof window.api.word.engine>>

const ENGINE_TEXT: Record<'word' | 'libreoffice', string> = {
  word: 'Se usará Microsoft Word, así que el PDF queda igual al documento.',
  libreoffice: 'Se usará LibreOffice, así que el PDF queda igual al documento.'
}

export default function WordToPdf(): React.JSX.Element {
  const [file, setFile] = useState<string | null>(null)
  const [engine, setEngine] = useState<Engine | undefined>(undefined)

  useEffect(() => {
    window.api.word.engine().then(setEngine, () => setEngine(null))
  }, [])
  const job = useJob<{ output: string }>()
  useToolStep(stepOf(file !== null, job.status))

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
            <img className="file-icon" src={wordLogo} alt="" />
            <strong>{baseName(file)}</strong>
          </div>
          {engine ? (
            <p className="muted">{ENGINE_TEXT[engine]}</p>
          ) : (
            engine === null && (
              <p className="notice">
                Este equipo no tiene Microsoft Word ni LibreOffice, así que el PDF se hace con un
                método sencillo: se ve parecido, pero puede cambiar el diseño en documentos con
                tablas, columnas o cuadros de texto. Si instalas LibreOffice (es gratis), el PDF
                queda igual al documento.
              </p>
            )
          )}
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
