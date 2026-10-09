// Administración de claves de Easy Tools (solo para quien publica la app).
//
//   npm run keys -- init                          crea el par de llaves (una sola vez)
//   npm run keys -- new <código-del-equipo> "<nombre>"   emite una clave para un equipo
//   npm run keys -- list                          muestra las claves emitidas
//
// La llave PRIVADA queda en keys/private.pem (no se sube a git): quien la tenga puede emitir claves.
// Hay que guardar una copia segura: si se pierde, las claves ya emitidas siguen sirviendo, pero no se pueden
// emitir más sin cambiar la llave pública de la app (y eso invalida todas las anteriores).
import { generateKeyPairSync } from 'node:crypto'
import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  createKey,
  formatMachineCode,
  isKeyValid,
  isMachineCode
} from '../src/main/license/core.ts'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const privatePath = join(root, 'keys', 'private.pem')
const publicPath = join(root, 'src', 'main', 'license', 'public.pem')
const listPath = join(root, 'keys', 'emitidas.csv')

const [command, ...args] = process.argv.slice(2)

function fail(message) {
  console.error(`\n✖ ${message}\n`)
  process.exit(1)
}

if (command === 'init') {
  if (existsSync(privatePath) && !args.includes('--force'))
    fail(
      'Ya existe keys/private.pem. No se vuelve a crear (con --force se reemplaza e invalida TODAS las claves anteriores).'
    )
  const { publicKey, privateKey } = generateKeyPairSync('ed25519')
  mkdirSync(dirname(privatePath), { recursive: true })
  writeFileSync(privatePath, privateKey.export({ type: 'pkcs8', format: 'pem' }), { mode: 0o600 })
  writeFileSync(publicPath, publicKey.export({ type: 'spki', format: 'pem' }))
  console.log('✔ Llave privada: keys/private.pem  (GUÁRDALA EN UN LUGAR SEGURO, no se sube a git)')
  console.log(
    '✔ Llave pública:  src/main/license/public.pem (va dentro de la app; sí se sube a git)'
  )
} else if (command === 'new') {
  const [code, ...nameParts] = args
  const name = nameParts.join(' ').trim()
  if (!code || !name) fail('Uso: npm run keys -- new <código-del-equipo> "<nombre de la persona>"')
  if (!isMachineCode(code))
    fail(
      'El código del equipo debe tener 16 caracteres (letras A-F y números), por ejemplo ABCD-1234-EF56-7890.'
    )
  if (!existsSync(privatePath)) fail('Falta keys/private.pem. Corre primero: npm run keys -- init')
  const key = createKey(code, readFileSync(privatePath, 'utf8'))
  // Comprobación de seguridad: la llave pública de la app debe aceptar la clave recién emitida
  if (!isKeyValid(key, code, readFileSync(publicPath, 'utf8')))
    fail('La clave emitida no coincide con la llave pública de la app. ¿Se cambió public.pem?')
  if (!existsSync(listPath)) writeFileSync(listPath, 'fecha,nombre,codigo_equipo,clave\n')
  appendFileSync(
    listPath,
    `${new Date().toISOString().slice(0, 10)},"${name.replace(/"/g, "'")}",${formatMachineCode(code)},${key}\n`
  )
  console.log(
    `\nClave para ${name} (equipo ${formatMachineCode(code)}):\n\n${key}\n\nQuedó registrada en keys/emitidas.csv\n`
  )
} else if (command === 'list') {
  console.log(
    existsSync(listPath)
      ? readFileSync(listPath, 'utf8')
      : 'Todavía no se ha emitido ninguna clave.'
  )
} else {
  fail('Comandos: init | new <código> "<nombre>" | list')
}
