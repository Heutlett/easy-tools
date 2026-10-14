import { useState } from 'react'
import FileDrop from '../../components/FileDrop'
import JobStatus from '../../components/JobStatus'
import { stepOf, useToolStep } from '../../lib/toolStep'
import { baseName } from '../../lib/format'
import { decodeImage } from '../../lib/image'
import { useJob } from '../../lib/useJob'

export default function RemoveBackground(): React.JSX.Element {
  const [file, setFile] = useState<string | null>(null)
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
          kind="image"
          title="Elige la imagen"
          hint="Funciona con fotos PNG, JPG o WEBP"
          onFiles={(p) => setFile(p[0])}
        />
      )}

      {file && (
        <div className="compare">
          <figure>
            <figcaption className="muted">Antes — {baseName(file)}</figcaption>
            <img src={window.api.mediaUrl(file)} alt="Imagen original" />
          </figure>
          {job.status === 'done' && job.result && (
            <figure>
              <figcaption className="muted">Después</figcaption>
              <img
                className="checker"
                src={window.api.mediaUrl(job.result.output)}
                alt="Imagen sin fondo"
              />
            </figure>
          )}
        </div>
      )}

      {file && job.status === 'idle' && (
        <div className="row start">
          <button
            className="btn big"
            onClick={() =>
              job.run(async () =>
                window.api.image.removeBackground({ input: file, ...(await decodeImage(file)) })
              )
            }
          >
            Quitar el fondo
          </button>
          <button className="btn secondary" onClick={again}>
            Elegir otra imagen
          </button>
        </div>
      )}

      <JobStatus
        job={job}
        working="Quitando el fondo… la primera vez tarda un poco más"
        cancellable={false}
        again="Probar con otra imagen"
        onAgain={again}
        doneText={(out) => `${baseName(out)} (imagen PNG con fondo transparente)`}
      />
    </>
  )
}
