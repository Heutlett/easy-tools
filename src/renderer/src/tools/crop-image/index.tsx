import { useState } from 'react'
import CropBox from '../../components/CropBox'
import FileDrop from '../../components/FileDrop'
import JobStatus from '../../components/JobStatus'
import { fitRatio, type CropRect } from '../../lib/crop'
import { baseName, nameWithoutExtension } from '../../lib/format'
import { useJob } from '../../lib/useJob'

const RATIOS: { label: string; value: number | null }[] = [
  { label: 'Libre', value: null },
  { label: 'Cuadrada 1:1', value: 1 },
  { label: '4:3', value: 4 / 3 },
  { label: '3:4', value: 3 / 4 },
  { label: '16:9', value: 16 / 9 }
]

const START: CropRect = { x: 0.1, y: 0.1, w: 0.8, h: 0.8 }

export default function CropImage(): React.JSX.Element {
  const [file, setFile] = useState<string | null>(null)
  const [size, setSize] = useState<{ width: number; height: number } | null>(null)
  const [ratio, setRatio] = useState<number | null>(null)
  const [rect, setRect] = useState<CropRect>(START)
  const [error, setError] = useState('')
  const job = useJob<{ output: string }>()

  const pick = async (path: string): Promise<void> => {
    setError('')
    try {
      const bitmap = await createImageBitmap(
        await (await fetch(window.api.mediaUrl(path))).blob(),
        {
          imageOrientation: 'from-image'
        }
      )
      setSize({ width: bitmap.width, height: bitmap.height })
      bitmap.close()
      setRatio(null)
      setRect(START)
      setFile(path)
    } catch {
      setError('No se pudo abrir esa imagen. Prueba con otra.')
    }
  }

  const chooseRatio = (value: number | null): void => {
    setRatio(value)
    if (value && size) setRect(fitRatio(rect, value, size.width, size.height))
  }

  const again = (): void => {
    job.reset()
    setFile(null)
    setSize(null)
  }

  const save = (input: string, dims: { width: number; height: number }): Promise<void> =>
    job.run(async () => {
      // Se recorta de la imagen original, a su resolución completa
      const bitmap = await createImageBitmap(
        await (await fetch(window.api.mediaUrl(input))).blob(),
        {
          imageOrientation: 'from-image'
        }
      )
      const sx = Math.round(rect.x * dims.width)
      const sy = Math.round(rect.y * dims.height)
      const sw = Math.max(1, Math.min(dims.width - sx, Math.round(rect.w * dims.width)))
      const sh = Math.max(1, Math.min(dims.height - sy, Math.round(rect.h * dims.height)))
      const canvas = document.createElement('canvas')
      canvas.width = sw
      canvas.height = sh
      const png = /\.(png|webp)$/i.test(input) // se conserva la transparencia
      const ctx = canvas.getContext('2d')!
      if (!png) {
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, sw, sh)
      }
      ctx.drawImage(bitmap, sx, sy, sw, sh, 0, 0, sw, sh)
      bitmap.close()
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, png ? 'image/png' : 'image/jpeg', 0.95)
      )
      if (!blob) throw new Error('No se pudo guardar la imagen.')
      return window.api.output.saveFile({
        name: `${nameWithoutExtension(baseName(input))} (recortada)`,
        ext: png ? '.png' : '.jpg',
        data: await blob.arrayBuffer()
      })
    })

  const cropWidth = size ? Math.round(rect.w * size.width) : 0
  const cropHeight = size ? Math.round(rect.h * size.height) : 0

  return (
    <>
      {!file && (
        <>
          <FileDrop kind="image" title="Elige la imagen" onFiles={(p) => pick(p[0])} />
          {error && <p className="notice error">{error}</p>}
        </>
      )}

      {file && size && job.status !== 'done' && (
        <>
          <div className="row">
            <div className="pills" role="group" aria-label="Forma del recorte">
              {RATIOS.map((r) => (
                <button
                  key={r.label}
                  className={`pill ${ratio === r.value ? 'selected' : ''}`}
                  aria-pressed={ratio === r.value}
                  disabled={job.status === 'running'}
                  onClick={() => chooseRatio(r.value)}
                >
                  {r.label}
                </button>
              ))}
            </div>
            <span className="muted">
              {baseName(file)} · recorte de {cropWidth} × {cropHeight} px
            </span>
          </div>

          <CropBox
            src={window.api.mediaUrl(file)}
            width={size.width}
            height={size.height}
            ratio={ratio}
            rect={rect}
            onChange={setRect}
          />

          {job.status === 'idle' && (
            <div className="row start">
              <button className="btn big" onClick={() => save(file, size)}>
                Guardar recorte
              </button>
              <button className="btn secondary" onClick={again}>
                Elegir otra imagen
              </button>
            </div>
          )}
        </>
      )}

      <JobStatus
        job={job}
        working="Guardando el recorte…"
        cancellable={false}
        again="Recortar otra imagen"
        onAgain={again}
      />
    </>
  )
}
