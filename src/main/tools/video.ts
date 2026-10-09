import { handle } from '../ipc'
import { extractFrame, probe, runFfmpeg } from '../ffmpeg'
import { reporter } from '../jobs'
import { UserError } from '../jobs'
import { nameOf, outputDir, uniquePath } from '../paths'

const VIDEO_ENCODE = ['-c:v', 'libx264', '-preset', 'veryfast', '-crf', '20', '-pix_fmt', 'yuv420p']
const AUDIO_ENCODE = ['-c:a', 'aac', '-b:a', '160k']

export function registerVideoTools(): void {
  handle('video:info', (_e, file: string) => probe(file))
  handle('video:frame', (_e, p: { input: string; time: number; height: number }) =>
    extractFrame(p.input, p.time, p.height)
  )

  handle(
    'video:trim',
    async (e, p: { jobId: string; input: string; start: number; end: number }) => {
      const info = await probe(p.input)
      const end = Math.min(p.end, info.duration)
      if (!(end > p.start)) throw new UserError('El final tiene que ir después del inicio.')
      const output = uniquePath(outputDir(), `${nameOf(p.input)} (recorte)`, '.mp4')
      await runFfmpeg({
        jobId: p.jobId,
        // -ss antes de -i busca rápido y, como se vuelve a codificar, el corte es exacto.
        args: [
          '-ss',
          String(p.start),
          '-i',
          p.input,
          '-t',
          String(end - p.start),
          ...VIDEO_ENCODE,
          ...AUDIO_ENCODE,
          '-movflags',
          '+faststart'
        ],
        output,
        duration: end - p.start,
        report: reporter(e.sender, p.jobId)
      })
      return { output }
    }
  )

  handle('video:toAudio', async (e, p: { jobId: string; input: string }) => {
    const info = await probe(p.input)
    if (!info.hasAudio) throw new UserError('Este video no tiene sonido.')
    const output = uniquePath(outputDir(), nameOf(p.input), '.mp3')
    await runFfmpeg({
      jobId: p.jobId,
      args: ['-i', p.input, '-vn', '-c:a', 'libmp3lame', '-q:a', '2'],
      output,
      duration: info.duration,
      report: reporter(e.sender, p.jobId)
    })
    return { output }
  })

  handle('video:join', async (e, p: { jobId: string; inputs: string[] }) => {
    if (p.inputs.length < 2) throw new UserError('Elige al menos dos videos para unir.')
    const infos = await Promise.all(p.inputs.map(probe))
    if (infos.some((i) => !i.hasVideo)) throw new UserError('Uno de los archivos no es un video.')

    // Todos los videos se ajustan al tamaño del primero (con franjas negras si hace falta).
    const even = (n: number): number => Math.max(2, Math.floor(n / 2) * 2)
    const W = even(infos[0].width ?? 1280)
    const H = even(infos[0].height ?? 720)

    const args: string[] = []
    p.inputs.forEach((file) => args.push('-i', file))
    // Los videos sin sonido reciben un silencio de su misma duración para poder unirse.
    const silenceIndex = new Map<number, number>()
    let next = p.inputs.length
    infos.forEach((info, i) => {
      if (info.hasAudio) return
      args.push('-f', 'lavfi', '-t', String(info.duration), '-i', 'anullsrc=r=44100:cl=stereo')
      silenceIndex.set(i, next++)
    })

    const parts: string[] = []
    const labels: string[] = []
    infos.forEach((_info, i) => {
      parts.push(
        `[${i}:v]scale=${W}:${H}:force_original_aspect_ratio=decrease,pad=${W}:${H}:(ow-iw)/2:(oh-ih)/2,setsar=1,fps=30,format=yuv420p[v${i}]`
      )
      const audioIn = silenceIndex.has(i) ? silenceIndex.get(i) : i
      parts.push(`[${audioIn}:a]aresample=44100,aformat=channel_layouts=stereo[a${i}]`)
      labels.push(`[v${i}][a${i}]`)
    })
    parts.push(`${labels.join('')}concat=n=${p.inputs.length}:v=1:a=1[v][a]`)

    const output = uniquePath(outputDir(), 'Video unido', '.mp4')
    await runFfmpeg({
      jobId: p.jobId,
      args: [
        ...args,
        '-filter_complex',
        parts.join(';'),
        '-map',
        '[v]',
        '-map',
        '[a]',
        ...VIDEO_ENCODE,
        ...AUDIO_ENCODE,
        '-movflags',
        '+faststart'
      ],
      output,
      duration: infos.reduce((sum, i) => sum + i.duration, 0),
      report: reporter(e.sender, p.jobId)
    })
    return { output }
  })
}
