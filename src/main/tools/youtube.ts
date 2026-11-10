import { spawn } from 'child_process'
import { handle } from '../ipc'
import { CancelledError, registerJob, reporter, UserError } from '../jobs'
import { requireYtDlp } from '../components'
import { ffmpegPath, outputDir } from '../paths'

/** yt-dlp es un componente que se descarga la primera vez (ver components.ts) y se actualiza solo. */
const ytDlpPath = requireYtDlp

/** La actualización de yt-dlp que se lanzó al abrir la app (mientras corre, el archivo se está reemplazando) */
let updating: Promise<void> = Promise.resolve()

/** Se llama al iniciar la app: intenta actualizar yt-dlp en segundo plano (si hay internet). */
export function updateYtDlpInBackground(): void {
  updating = new Promise<void>((resolve) => {
    try {
      const child = spawn(ytDlpPath(), ['-U'], { windowsHide: true, stdio: 'ignore' })
      child.on('error', () => resolve())
      child.on('close', () => resolve())
    } catch {
      // Si no se puede actualizar seguimos con la versión que tengamos.
      resolve()
    }
  })
}

/** Antes de usar yt-dlp se espera a que termine de actualizarse (como mucho medio minuto): si no, falla al estar cambiando el archivo */
const updated = (): Promise<void> =>
  Promise.race([updating, new Promise<void>((r) => setTimeout(r, 30_000))])

function friendlyError(stderr: string): UserError {
  if (
    /getaddrinfo|Temporary failure|Network is unreachable|timed out|Unable to download (webpage|API)|Failed to resolve|Connection (reset|refused)/i.test(
      stderr
    )
  )
    return new UserError('No se pudo conectar. Revisa tu conexión a internet.')
  if (/confirm you.re not a bot/i.test(stderr))
    return new UserError(
      'YouTube pidió confirmar que no eres un robot. Espera un rato e intenta de nuevo.'
    )
  if (/private video|members-only|Sign in to confirm your age|age-restricted/i.test(stderr))
    return new UserError('Este video es privado o tiene restricciones, no se puede descargar.')
  if (/unavailable|removed|does not exist|not available/i.test(stderr))
    return new UserError('Este video no está disponible. Revisa que el enlace sea correcto.')
  if (/Unsupported URL|is not a valid URL/i.test(stderr))
    return new UserError('Ese enlace no parece ser de un video. Revisa que esté completo.')
  console.error('[yt-dlp]', stderr)
  return new UserError('No se pudo descargar el video. Intenta de nuevo en unos minutos.')
}

function checkUrl(url: string): void {
  if (!/^https?:\/\/\S+$/i.test(url.trim()))
    throw new UserError('Pega un enlace completo, que empiece con https://')
}

interface RunOptions {
  jobId?: string
  args: string[]
  onLine?: (line: string) => void
}

/**
 * YouTube pide resolver unos retos en JavaScript para entregar los videos. Sin un intérprete, yt-dlp solo prueba un cliente
 * de respaldo que YouTube rechaza para muchos videos («This video is not available» aunque el video exista).
 * Se usa el Node que ya trae la app: el mismo ejecutable de Electron con ELECTRON_RUN_AS_NODE=1, así no hay que bajar nada más.
 */
const JS_RUNTIME = ['--js-runtimes', `node:${process.execPath}`]

async function runYtDlp({ jobId, args, onLine }: RunOptions): Promise<string> {
  await updated()
  return new Promise((resolve, reject) => {
    const child = spawn(ytDlpPath(), [...JS_RUNTIME, ...args], {
      windowsHide: true,
      env: { ...process.env, ELECTRON_RUN_AS_NODE: '1' }
    })
    let cancelled = false
    const unregister = jobId
      ? registerJob(jobId, () => {
          cancelled = true
          child.kill()
        })
      : () => {}
    let stdout = ''
    let pending = ''
    let stderr = ''
    child.stdout.setEncoding('utf8')
    child.stderr.setEncoding('utf8')
    child.stdout.on('data', (chunk: string) => {
      stdout += chunk
      pending += chunk
      const lines = pending.split(/\r?\n|\r/)
      pending = lines.pop() ?? ''
      lines.forEach((l) => onLine?.(l))
    })
    child.stderr.on('data', (d: string) => (stderr = (stderr + d).slice(-4000)))
    child.on('error', () => {
      unregister()
      reject(new UserError('No se pudo iniciar el descargador.'))
    })
    child.on('close', (code) => {
      unregister()
      if (cancelled) return reject(new CancelledError())
      if (code !== 0) return reject(friendlyError(stderr))
      resolve(stdout)
    })
  })
}

export function registerYoutubeTools(): void {
  handle('youtube:info', async (_e, url: string) => {
    checkUrl(url)
    const out = await runYtDlp({
      args: ['--dump-single-json', '--no-playlist', '--no-warnings', '--', url.trim()]
    })
    const json = JSON.parse(out)
    return {
      title: String(json.title ?? 'Video'),
      thumbnail: typeof json.thumbnail === 'string' ? json.thumbnail : null,
      duration: typeof json.duration === 'number' ? json.duration : null,
      channel: typeof json.uploader === 'string' ? json.uploader : null
    }
  })

  handle(
    'youtube:download',
    async (e, p: { jobId: string; url: string; mode: 'video' | 'audio' }) => {
      checkUrl(p.url)
      const report = reporter(e.sender, p.jobId)
      const modeArgs =
        p.mode === 'audio'
          ? ['-x', '--audio-format', 'mp3', '--audio-quality', '0']
          : [
              '-S',
              'res:1080,vcodec:h264,acodec:aac',
              '-f',
              'bv*+ba/b',
              '--merge-output-format',
              'mp4'
            ]

      let output = ''
      let phase = 0
      let last = 0
      await runYtDlp({
        jobId: p.jobId,
        args: [
          '--no-playlist',
          '--no-warnings',
          '--no-simulate',
          '--newline',
          '--progress',
          '--windows-filenames',
          '--ffmpeg-location',
          ffmpegPath(),
          '--paths',
          outputDir(),
          '-o',
          '%(title).120B.%(ext)s',
          '--progress-template',
          'download:PCT %(progress._percent_str)s',
          '--print',
          'after_move:FILE %(filepath)s',
          ...modeArgs,
          '--',
          p.url.trim()
        ],
        onLine: (line) => {
          const pct = line.match(/^PCT\s+([\d.]+)%/)
          if (pct) {
            const value = Number(pct[1])
            // El video y el audio se bajan por separado: cada uno cuenta como una fase.
            if (value + 20 < last) phase++
            last = value
            const base = phase === 0 ? 0 : 0.9
            const span = phase === 0 ? 0.9 : 0.07
            report(base + (value / 100) * span, 'Descargando…')
          } else if (line.startsWith('FILE ')) {
            output = line.slice(5).trim()
          } else if (/^\[(Merger|ExtractAudio|VideoConvertor)\]/.test(line)) {
            report(0.97, 'Terminando…')
          }
        }
      })
      if (!output) throw new UserError('La descarga terminó pero no se encontró el archivo.')
      return { output }
    }
  )
}
