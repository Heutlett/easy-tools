import { app } from 'electron'
import { execFile } from 'child_process'
import { createHash, randomBytes } from 'crypto'
import { existsSync, readFileSync, writeFileSync } from 'fs'
import { join } from 'path'
import { handle } from '../ipc'
import { UserError } from '../jobs'
import type { LicenseState } from '../../shared/about'
import { formatKey, formatMachineCode, isKeyValid } from './core'
import publicKey from './public.pem?raw'
import { isUnlocked, licenseRequired, setUnlocked } from './state'

const licenseFile = (): string => join(app.getPath('userData'), 'license.json')

function run(command: string, args: string[]): Promise<string> {
  return new Promise((resolve, reject) =>
    execFile(command, args, { windowsHide: true, timeout: 10_000 }, (err, stdout) =>
      err ? reject(err) : resolve(stdout)
    )
  )
}

/** Identificador único de la computadora. En Windows es el MachineGuid que Windows crea al instalarse. */
async function machineId(): Promise<string> {
  try {
    if (process.platform === 'win32') {
      const out = await run('reg.exe', [
        'query',
        'HKLM\\SOFTWARE\\Microsoft\\Cryptography',
        '/v',
        'MachineGuid'
      ])
      const match = out.match(/MachineGuid\s+REG_SZ\s+(\S+)/i)
      if (match) return match[1]
    } else {
      for (const path of ['/etc/machine-id', '/var/lib/dbus/machine-id'])
        if (existsSync(path)) return readFileSync(path, 'utf8').trim()
    }
  } catch {
    // Se usa el respaldo de abajo.
  }
  // Respaldo: un número al azar guardado en la carpeta de datos de la app
  const file = join(app.getPath('userData'), 'machine-id')
  if (!existsSync(file)) writeFileSync(file, randomBytes(16).toString('hex'))
  return readFileSync(file, 'utf8').trim()
}

let machineCode: Promise<string> | undefined
/** Código de este equipo (16 caracteres): no revela el identificador de la compu, solo un resumen de él. */
const getMachineCode = (): Promise<string> =>
  (machineCode ??= machineId().then((id) =>
    createHash('sha256').update(`easy-tools:${id}`).digest('hex').slice(0, 16).toUpperCase()
  ))

let ready: Promise<void> | undefined

/** Al abrir la app: revisa si ya hay una clave guardada y válida para este equipo. */
export function initLicense(): Promise<void> {
  return (ready ??= (async () => {
    if (!licenseRequired()) return
    try {
      const { key } = JSON.parse(readFileSync(licenseFile(), 'utf8')) as { key: string }
      setUnlocked(isKeyValid(key, await getMachineCode(), publicKey))
    } catch {
      setUnlocked(false)
    }
  })())
}

export function registerLicenseHandlers(): void {
  handle('license:state', async (): Promise<LicenseState> => {
    await initLicense()
    return {
      required: licenseRequired(),
      unlocked: isUnlocked(),
      code: formatMachineCode(await getMachineCode())
    }
  })

  handle('license:activate', async (_e, key: string) => {
    const code = await getMachineCode()
    if (!isKeyValid(key, code, publicKey))
      throw new UserError(
        'Esa clave no sirve para este equipo. Revisa que la copiaste completa y sin cambios.'
      )
    writeFileSync(licenseFile(), JSON.stringify({ key: formatKey(key) }))
    setUnlocked(true)
  })
}
