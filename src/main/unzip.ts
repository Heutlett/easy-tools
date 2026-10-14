import { mkdirSync, readFileSync, writeFileSync } from 'fs'
import { dirname, join, resolve, sep } from 'path'
import { inflateRawSync } from 'zlib'

/**
 * Descomprime un .zip sencillo (sin cifrado ni zip64) con lo que trae Node; solo para los datos de pronunciación de las voces.
 * Rechaza cualquier entrada que intente salirse de la carpeta de destino.
 */
export function unzipTo(zipFile: string, dest: string): void {
  const zip = readFileSync(zipFile)
  // Fin del directorio central: se busca desde el final
  let end = -1
  for (let i = zip.length - 22; i >= Math.max(0, zip.length - 65557); i--) {
    if (zip.readUInt32LE(i) === 0x06054b50) {
      end = i
      break
    }
  }
  if (end < 0) throw new Error('El archivo .zip no es válido')
  const count = zip.readUInt16LE(end + 10)
  let at = zip.readUInt32LE(end + 16)
  const root = resolve(dest)
  mkdirSync(root, { recursive: true })

  for (let n = 0; n < count; n++) {
    if (zip.readUInt32LE(at) !== 0x02014b50) throw new Error('El archivo .zip está dañado')
    const method = zip.readUInt16LE(at + 10)
    const compressed = zip.readUInt32LE(at + 20)
    const nameLength = zip.readUInt16LE(at + 28)
    const extraLength = zip.readUInt16LE(at + 30)
    const commentLength = zip.readUInt16LE(at + 32)
    const local = zip.readUInt32LE(at + 42)
    const name = zip.toString('utf8', at + 46, at + 46 + nameLength)
    at += 46 + nameLength + extraLength + commentLength

    const target = resolve(join(root, name))
    if (target !== root && !target.startsWith(root + sep))
      throw new Error('El archivo .zip trae una ruta no permitida')
    if (name.endsWith('/')) {
      mkdirSync(target, { recursive: true })
      continue
    }
    // El encabezado local tiene su propio largo de nombre y de extras
    const dataStart = local + 30 + zip.readUInt16LE(local + 26) + zip.readUInt16LE(local + 28)
    const raw = zip.subarray(dataStart, dataStart + compressed)
    let data: Buffer
    if (method === 0) data = Buffer.from(raw)
    else if (method === 8) data = inflateRawSync(raw)
    else throw new Error(`Método de compresión no admitido (${method})`)
    mkdirSync(dirname(target), { recursive: true })
    writeFileSync(target, data)
  }
}
