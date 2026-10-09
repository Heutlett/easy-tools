// Descarga ffmpeg y yt-dlp para la plataforma indicada en resources/bin/.
// Uso: node scripts/fetch-binaries.mjs [win32|linux|darwin] [x64|arm64]
import { createWriteStream, existsSync, mkdirSync, chmodSync } from 'node:fs'
import { pipeline } from 'node:stream/promises'
import { Readable } from 'node:stream'
import { createGunzip } from 'node:zlib'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const FFMPEG_TAG = 'b6.1.1'
const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const platform = process.argv[2] ?? process.platform
const arch = process.argv[3] ?? process.arch

const exe = platform === 'win32' ? '.exe' : ''
const ytdlpAsset = { win32: 'yt-dlp.exe', linux: 'yt-dlp_linux', darwin: 'yt-dlp_macos' }[platform]
if (!ytdlpAsset) throw new Error(`Plataforma no soportada: ${platform}`)

// Nombres de carpeta iguales a ${os} de electron-builder
const osDir = { win32: 'win', darwin: 'mac', linux: 'linux' }[platform]
const outDir = join(root, 'resources', 'bin', osDir)
mkdirSync(outDir, { recursive: true })

async function download(url, dest, gunzip = false) {
  if (existsSync(dest) && !process.env.FORCE) {
    console.log(`ya existe: ${dest}`)
    return
  }
  console.log(`descargando ${url}`)
  const res = await fetch(url, { redirect: 'follow' })
  if (!res.ok || !res.body) throw new Error(`Error ${res.status} al descargar ${url}`)
  const body = Readable.fromWeb(res.body)
  await pipeline(body, ...(gunzip ? [createGunzip()] : []), createWriteStream(dest))
  if (platform !== 'win32') chmodSync(dest, 0o755)
}

await download(
  `https://github.com/eugeneware/ffmpeg-static/releases/download/${FFMPEG_TAG}/ffmpeg-${platform}-${arch}.gz`,
  join(outDir, `ffmpeg${exe}`),
  true
)
await download(
  `https://github.com/yt-dlp/yt-dlp/releases/latest/download/${ytdlpAsset}`,
  join(outDir, `yt-dlp${exe}`)
)
console.log('Listo.')
