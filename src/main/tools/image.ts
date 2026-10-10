import { app } from 'electron'
import { writeFileSync } from 'fs'
import { join } from 'path'
import { pathToFileURL } from 'url'
import { crc32, deflateSync } from 'zlib'
import { handle } from '../ipc'
import { UserError } from '../jobs'
import { nameOf, outputDir, uniquePath } from '../paths'

/** Carpeta con los modelos de IA (viajan dentro de la app como recurso). */
function modelsUrl(): string {
  const dir = app.isPackaged
    ? join(process.resourcesPath, 'models')
    : join(app.getAppPath(), 'node_modules', '@imgly', 'background-removal-node', 'dist')
  return pathToFileURL(dir).href + '/'
}

/** Escribe una imagen PNG con transparencia a partir de píxeles RGBA. */
function encodePng(rgba: Uint8Array, width: number, height: number): Buffer {
  const chunk = (type: string, data: Buffer): Buffer => {
    const body = Buffer.concat([Buffer.from(type, 'ascii'), data])
    const out = Buffer.alloc(body.length + 8)
    out.writeUInt32BE(data.length, 0)
    body.copy(out, 4)
    out.writeUInt32BE(crc32(body), body.length + 4)
    return out
  }
  const header = Buffer.alloc(13)
  header.writeUInt32BE(width, 0)
  header.writeUInt32BE(height, 4)
  header[8] = 8 // bits por canal
  header[9] = 6 // RGBA
  const stride = width * 4
  const raw = Buffer.alloc((stride + 1) * height) // cada fila empieza con el filtro 0
  for (let y = 0; y < height; y++) {
    Buffer.from(rgba.buffer, rgba.byteOffset + y * stride, stride).copy(raw, y * (stride + 1) + 1)
  }
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', header),
    chunk('IDAT', deflateSync(raw)),
    chunk('IEND', Buffer.alloc(0))
  ])
}

export function registerImageTools(): void {
  /** La ventana decodifica la imagen (respetando la rotación de las fotos de celular) y manda los píxeles RGBA. */
  handle(
    'image:removeBackground',
    async (_e, p: { input: string; width: number; height: number; rgba: ArrayBuffer }) => {
      if (p.rgba.byteLength !== p.width * p.height * 4)
        throw new UserError('No se pudo leer la imagen. Prueba con otra.')
      // Se carga bajo demanda: el modelo de IA pesa y no hace falta hasta que se usa.
      const { removeBackground } = await import('@imgly/background-removal-node')
      const blob = await removeBackground(
        new Blob([p.rgba], { type: `image/x-rgba8;width=${p.width};height=${p.height}` }),
        { publicPath: modelsUrl(), model: 'medium', output: { format: 'image/x-rgba8' } }
      )
      const output = uniquePath(outputDir(), `${nameOf(p.input)} (sin fondo)`, '.png')
      writeFileSync(output, encodePng(new Uint8Array(await blob.arrayBuffer()), p.width, p.height))
      return { output }
    }
  )
}
