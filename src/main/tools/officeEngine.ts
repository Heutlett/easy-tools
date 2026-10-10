import { app } from 'electron'
import { spawn } from 'child_process'
import { copyFileSync, existsSync, mkdirSync, renameSync, rmSync } from 'fs'
import { join, parse } from 'path'
import { pathToFileURL } from 'url'
import { outputDir, uniquePath } from '../paths'

/**
 * Convertir un Word a PDF "igual" solo lo hace bien un programa de Office de verdad. Si el equipo tiene
 * Microsoft Word (Windows) o LibreOffice, se usa; si no, la herramienta usa un método más sencillo.
 */
export type OfficeEngine = { kind: 'word' } | { kind: 'libreoffice'; path: string }

const TIMEOUT_MS = 180_000

function libreOfficePaths(): string[] {
  if (process.platform === 'win32') {
    return [
      process.env['ProgramFiles'],
      process.env['ProgramFiles(x86)'],
      process.env['ProgramW6432']
    ]
      .filter((dir): dir is string => !!dir)
      .map((dir) => join(dir, 'LibreOffice', 'program', 'soffice.exe'))
  }
  if (process.platform === 'darwin') return ['/Applications/LibreOffice.app/Contents/MacOS/soffice']
  return [
    '/usr/bin/soffice',
    '/usr/bin/libreoffice',
    '/usr/local/bin/soffice',
    '/snap/bin/libreoffice',
    '/opt/libreoffice/program/soffice'
  ]
}

function run(command: string, args: string[], env?: NodeJS.ProcessEnv): Promise<number> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      windowsHide: true,
      env: { ...process.env, ...env },
      stdio: 'ignore'
    })
    const timer = setTimeout(() => {
      child.kill()
      reject(new Error('timeout'))
    }, TIMEOUT_MS)
    child.on('error', (err) => {
      clearTimeout(timer)
      reject(err)
    })
    child.on('close', (code) => {
      clearTimeout(timer)
      resolve(code ?? 1)
    })
  })
}

let cached: Promise<OfficeEngine | null> | undefined

/** Qué programa de Office hay en el equipo (se averigua una sola vez). */
export function findOfficeEngine(): Promise<OfficeEngine | null> {
  cached ??= (async () => {
    if (process.platform === 'win32') {
      try {
        if ((await run('reg.exe', ['query', 'HKCR\\Word.Application'])) === 0)
          return { kind: 'word' } as const
      } catch {
        // Sin Word: se sigue con LibreOffice.
      }
    }
    const path = libreOfficePaths().find((p) => existsSync(p))
    return path ? ({ kind: 'libreoffice', path } as const) : null
  })()
  return cached
}

const WORD_SCRIPT = `
$ErrorActionPreference = 'Stop'
$word = New-Object -ComObject Word.Application
try {
  $word.Visible = $false
  $word.DisplayAlerts = 0
  $doc = $word.Documents.Open($env:EASY_IN, $false, $true)
  $doc.ExportAsFixedFormat($env:EASY_OUT, 17)
  $doc.Close(0)
} finally {
  $word.Quit()
}
`

/** Convierte un documento de Word a PDF con el programa indicado y devuelve la ruta del PDF guardado. */
export async function convertWithOffice(engine: OfficeEngine, input: string): Promise<string> {
  // Carpeta de trabajo (visible) dentro de "Easy Tools": algunos programas, por ejemplo LibreOffice instalado como
  // snap, no pueden leer carpetas ocultas. Se borra al terminar.
  const work = join(outputDir(), `trabajando-${Date.now()}`)
  mkdirSync(work, { recursive: true })
  try {
    const { name, ext } = parse(input)
    const source = join(work, `documento${ext}`)
    copyFileSync(input, source)
    const produced = join(work, 'documento.pdf')

    if (engine.kind === 'word') {
      await run(
        'powershell.exe',
        ['-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass', '-Command', WORD_SCRIPT],
        { EASY_IN: source, EASY_OUT: produced }
      )
    } else {
      const convert = (profileArgs: string[]): Promise<number> =>
        run(engine.path, [
          '--headless',
          '--norestore',
          '--nolockcheck',
          ...profileArgs,
          '--convert-to',
          'pdf',
          '--outdir',
          work,
          source
        ])
      // Primero con un perfil propio de la app (no choca con un LibreOffice abierto); si el sistema no lo permite
      // (por ejemplo con LibreOffice instalado como snap) se reintenta con el perfil normal.
      const profile = join(app.getPath('userData'), 'libreoffice-profile')
      await convert([`-env:UserInstallation=${pathToFileURL(profile).href}`]).catch(() => 1)
      if (!existsSync(produced)) await convert([])
    }

    if (!existsSync(produced)) throw new Error('El programa no generó el PDF')
    const output = uniquePath(outputDir(), name, '.pdf')
    renameSync(produced, output)
    return output
  } finally {
    rmSync(work, { recursive: true, force: true })
  }
}
