// Arma manifest.json: la lista de TODO lo que los juegos dicen en voz alta, leída de los mismos datos que usan los juegos.
//   node tools/tts-lab/collect.mjs        (o `npm run tts:manifest`)
import { build } from 'esbuild'
import { createRequire } from 'node:module'
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const require = createRequire(import.meta.url)

// Los datos de los juegos son TypeScript: se empaquetan al vuelo y se ejecutan aquí
const result = await build({
  entryPoints: [join(here, 'collectors', 'index.ts')],
  bundle: true,
  platform: 'node',
  format: 'cjs',
  write: false,
  logLevel: 'error'
})
const mod = { exports: {} }
new Function('module', 'exports', 'require', result.outputFiles[0].text)(mod, mod.exports, require)
const items = mod.exports.collectAll()

writeFileSync(join(here, 'manifest.json'), JSON.stringify(items, null, 1))

const byGame = {}
for (const item of items) {
  const game = item.id.split('/')[1]
  byGame[game] ??= { audios: 0, caracteres: 0, 'versiones lenta/rápida': 0 }
  byGame[game].audios++
  byGame[game].caracteres += item.text.length
  byGame[game]['versiones lenta/rápida'] += item.variants?.length ?? 0
}
console.table(byGame)
const chars = items.reduce((n, i) => n + i.text.length, 0)
console.log(
  `${items.length} audios, ${chars} caracteres (≈ ${Math.round(chars / 14 / 60)} min de audio). manifest.json escrito en tools/tts-lab/.`
)
