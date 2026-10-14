import { createReadStream } from 'fs'
import { stat } from 'fs/promises'
import { extname } from 'path'
import { Readable } from 'stream'

const MIME: Record<string, string> = {
  '.mp4': 'video/mp4',
  '.m4v': 'video/mp4',
  '.mov': 'video/quicktime',
  '.webm': 'video/webm',
  '.mkv': 'video/x-matroska',
  '.avi': 'video/x-msvideo',
  '.pdf': 'application/pdf',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.opus': 'audio/ogg'
}

/**
 * Entrega un archivo local a la ventana. Soporta pedidos por rango (`Range: bytes=...`),
 * que el reproductor de video necesita para poder saltar a cualquier punto del video.
 */
export async function serveLocalFile(file: string, rangeHeader: string | null): Promise<Response> {
  let size: number
  try {
    size = (await stat(file)).size
  } catch {
    return new Response('Not found', { status: 404 })
  }

  const headers: Record<string, string> = {
    'Content-Type': MIME[extname(file).toLowerCase()] ?? 'application/octet-stream',
    'Accept-Ranges': 'bytes',
    // La ventana se carga desde file://, así que hay que permitir explícitamente que lea estos archivos.
    'Access-Control-Allow-Origin': '*'
  }

  const match = rangeHeader?.match(/^bytes=(\d*)-(\d*)$/)
  if (!match || (match[1] === '' && match[2] === '')) {
    return new Response(toWeb(createReadStream(file)), {
      status: 200,
      headers: { ...headers, 'Content-Length': String(size) }
    })
  }

  // "bytes=500-" = desde el 500 hasta el final; "bytes=-500" = los últimos 500
  let start = match[1] === '' ? Math.max(0, size - Number(match[2])) : Number(match[1])
  const end = match[1] === '' || match[2] === '' ? size - 1 : Math.min(Number(match[2]), size - 1)
  if (start > end || start >= size) {
    return new Response(null, {
      status: 416,
      headers: { ...headers, 'Content-Range': `bytes */${size}` }
    })
  }
  start = Math.max(0, start)
  return new Response(toWeb(createReadStream(file, { start, end })), {
    status: 206,
    headers: {
      ...headers,
      'Content-Range': `bytes ${start}-${end}/${size}`,
      'Content-Length': String(end - start + 1)
    }
  })
}

const toWeb = (stream: Readable): ReadableStream => Readable.toWeb(stream) as ReadableStream
