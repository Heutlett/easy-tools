import { spawn } from 'child_process'
import { rmSync } from 'fs'
import { ffmpegPath } from './paths'
import type { MediaInfo } from '../shared/types'
import { CancelledError, registerJob, UserError, type Reporter } from './jobs'

function toSeconds(h: string, m: string, s: string): number {
  return Number(h) * 3600 + Number(m) * 60 + Number(s)
}

/** Lee duración, tamaño y pistas de un archivo usando `ffmpeg -i` (no necesitamos ffprobe). */
export function probe(file: string): Promise<MediaInfo> {
  return new Promise((resolve, reject) => {
    const child = spawn(ffmpegPath(), ['-hide_banner', '-i', file], { windowsHide: true })
    let text = ''
    child.stderr.on('data', (d) => (text += d))
    child.on('error', () => reject(new UserError('No se pudo iniciar el procesador de video.')))
    child.on('close', () => {
      const dur = text.match(/Duration:\s*(\d+):(\d+):(\d+(?:\.\d+)?)/)
      if (!dur) return reject(new UserError('No se pudo leer este archivo. ¿Es un video válido?'))
      const hasVideo = /Stream #[^\n]*Video:/.test(text)
      const size = text.match(/Video:[^\n]*?,\s*(\d{2,5})x(\d{2,5})/)
      let width = size ? Number(size[1]) : undefined
      let height = size ? Number(size[2]) : undefined
      // Los videos grabados con celular suelen venir "acostados" con una rotación guardada.
      const rotation = text.match(/rotation of (-?\d+(?:\.\d+)?) degrees/)
      if (rotation && Math.abs(Math.round(Number(rotation[1]))) % 180 === 90) {
        ;[width, height] = [height, width]
      }
      resolve({
        duration: toSeconds(dur[1], dur[2], dur[3]),
        width,
        height,
        hasVideo,
        hasAudio: /Stream #[^\n]*Audio:/.test(text)
      })
    })
  })
}

/** Saca un solo fotograma del video como imagen JPG (data URL), para la tira de miniaturas. */
export function extractFrame(file: string, time: number, height: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const child = spawn(
      ffmpegPath(),
      [
        ...['-hide_banner', '-loglevel', 'error', '-nostdin'],
        // -ss antes de -i salta directo a ese punto sin leer todo el video
        ...['-ss', String(Math.max(0, time)), '-i', file],
        ...['-frames:v', '1', '-vf', `scale=-2:${height}`, '-q:v', '4'],
        ...['-f', 'image2pipe', '-c:v', 'mjpeg', 'pipe:1']
      ],
      { windowsHide: true }
    )
    const chunks: Buffer[] = []
    child.stdout.on('data', (d: Buffer) => chunks.push(d))
    child.on('error', () => reject(new UserError('No se pudo iniciar el procesador de video.')))
    child.on('close', () => {
      const image = Buffer.concat(chunks)
      if (image.length === 0) return reject(new UserError('No se pudo leer ese momento del video.'))
      resolve(`data:image/jpeg;base64,${image.toString('base64')}`)
    })
  })
}

interface RunOptions {
  jobId: string
  args: string[]
  output: string
  /** Duración esperada del resultado en segundos, para calcular el progreso */
  duration: number
  report: Reporter
}

/** Ejecuta ffmpeg reportando progreso. Si se cancela o falla, borra el archivo a medias. */
export function runFfmpeg({ jobId, args, output, duration, report }: RunOptions): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn(
      ffmpegPath(),
      ['-hide_banner', '-nostdin', '-y', '-progress', 'pipe:1', '-nostats', ...args, output],
      { windowsHide: true }
    )
    let cancelled = false
    const unregister = registerJob(jobId, () => {
      cancelled = true
      child.kill()
    })
    const cleanup = (): void => rmSync(output, { force: true })

    let buffer = ''
    child.stdout.on('data', (chunk) => {
      buffer += chunk
      const lines = buffer.split('\n')
      buffer = lines.pop() ?? ''
      for (const line of lines) {
        const m = line.match(/^out_time_(?:us|ms)=(\d+)/)
        if (m && duration > 0) report(Number(m[1]) / 1e6 / duration)
      }
    })
    let errTail = ''
    child.stderr.on('data', (d) => (errTail = (errTail + d).slice(-2000)))

    child.on('error', () => {
      unregister()
      reject(new UserError('No se pudo iniciar el procesador de video.'))
    })
    child.on('close', (code) => {
      unregister()
      if (cancelled) {
        cleanup()
        return reject(new CancelledError())
      }
      if (code !== 0) {
        cleanup()
        console.error('[ffmpeg]', errTail)
        return reject(new UserError('No se pudo procesar el video. Prueba con otro archivo.'))
      }
      report(1)
      resolve()
    })
  })
}
