// Copia a resources/models solo el modelo de IA que usa "Quitar fondo" (el mediano, ~88 MB).
// La librería trae también el modelo pequeño y archivos para web que no necesitamos empaquetar.
import { copyFileSync, existsSync, mkdirSync } from 'node:fs'
import { readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const src = join(root, 'node_modules', '@imgly', 'background-removal-node', 'dist')
const dest = join(root, 'resources', 'models')
mkdirSync(dest, { recursive: true })

const resources = JSON.parse(readFileSync(join(src, 'resources.json'), 'utf8'))
copyFileSync(join(src, 'resources.json'), join(dest, 'resources.json'))
for (const chunk of resources['/models/medium'].chunks) {
  const file = join(dest, chunk.hash)
  if (!existsSync(file)) copyFileSync(join(src, chunk.hash), file)
}
console.log(`Modelos listos en ${dest}`)
