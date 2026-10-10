import { app, BrowserWindow } from 'electron'
import { autoUpdater } from 'electron-updater'
import { handle } from './ipc'
import type { UpdateState, UpdateStatus } from '../shared/update'

/**
 * Actualizaciones automáticas. En Windows funciona con el instalador de la app: se busca una versión nueva en el
 * sitio donde se publican (ver `publish` en electron-builder.yml), se descarga y, al reiniciar, se instala sola.
 *
 * Para probar sin publicar nada:
 *  - EASY_TOOLS_FAKE_UPDATE=1      simula una versión nueva (solo para ver el aviso)
 *  - EASY_TOOLS_UPDATE_URL=<url>   busca en esa dirección en vez del sitio oficial
 */
const FAKE = process.env['EASY_TOOLS_FAKE_UPDATE'] === '1'
const CUSTOM_URL = process.env['EASY_TOOLS_UPDATE_URL']
const CHECK_EVERY_MS = 6 * 60 * 60 * 1000
const CHECK_TIMEOUT_MS = 60_000

let status: UpdateStatus = { state: 'idle' }
/** El estado de ahora (cambia mientras se espera la respuesta, así que no se puede dar por sabido) */
const currentState = (): UpdateState => status.state
const enabled = (): boolean => app.isPackaged || FAKE || !!CUSTOM_URL

function set(next: UpdateStatus): void {
  status = next
  for (const win of BrowserWindow.getAllWindows())
    if (!win.isDestroyed()) win.webContents.send('update:status', status)
}

const friendly = (err: unknown): string => {
  const text = String(err instanceof Error ? err.message : err)
  if (/ENOTFOUND|ECONNREFUSED|ETIMEDOUT|ECONNRESET|net::|getaddrinfo|network/i.test(text))
    return 'No se pudo conectar. Revisa tu internet e intenta de nuevo.'
  return 'No se pudo buscar la actualización. Intenta más tarde.'
}

/** Simulación para ver cómo se ve el aviso (no descarga nada). */
async function fakeCheck(): Promise<void> {
  set({ state: 'checking' })
  await new Promise((r) => setTimeout(r, 800))
  set({ state: 'available', version: '9.9.9' })
}
async function fakeDownload(): Promise<void> {
  for (let percent = 0; percent <= 100; percent += 10) {
    set({ state: 'downloading', version: status.version, percent })
    await new Promise((r) => setTimeout(r, 250))
  }
  set({ state: 'ready', version: status.version })
}

async function check(): Promise<void> {
  if (!enabled()) {
    set({
      state: 'unavailable',
      message: 'Las actualizaciones solo funcionan en la versión instalada.'
    })
    return
  }
  if (FAKE) return fakeCheck()
  if (status.state === 'checking' || status.state === 'downloading') return
  set({ state: 'checking' })
  // Si no llega ninguna respuesta, no se queda "Buscando…" para siempre
  const watchdog = setTimeout(() => {
    if (currentState() === 'checking')
      set({ state: 'error', message: 'No se pudo buscar la actualización. Intenta más tarde.' })
  }, CHECK_TIMEOUT_MS)
  try {
    // Devuelve null cuando esta copia no puede actualizarse (no es la versión instalada)
    const result = await autoUpdater.checkForUpdates()
    if (result === null && currentState() === 'checking')
      set({
        state: 'unavailable',
        message: 'Las actualizaciones solo funcionan en la versión instalada.'
      })
  } catch (err) {
    console.error('[update]', err)
    set({ state: 'error', message: friendly(err) })
  } finally {
    clearTimeout(watchdog)
  }
}

export function setupUpdater(): void {
  if (!FAKE) {
    autoUpdater.autoDownload = false // se descarga cuando la persona lo pide
    autoUpdater.autoInstallOnAppQuit = true // si ya está descargada, se instala al cerrar la app
    autoUpdater.allowPrerelease = false
    if (CUSTOM_URL) {
      autoUpdater.setFeedURL({ provider: 'generic', url: CUSTOM_URL })
      autoUpdater.forceDevUpdateConfig = true
    }
    autoUpdater.on('update-available', (info) => set({ state: 'available', version: info.version }))
    autoUpdater.on('update-not-available', () => set({ state: 'none' }))
    autoUpdater.on('download-progress', (p) =>
      set({ state: 'downloading', version: status.version, percent: Math.round(p.percent) })
    )
    autoUpdater.on('update-downloaded', (info) => set({ state: 'ready', version: info.version }))
    autoUpdater.on('error', (err) => {
      console.error('[update]', err)
      set({ state: 'error', message: friendly(err) })
    })
  }

  handle('update:status', () => status)
  handle('update:check', () => check())
  handle('update:download', async () => {
    if (FAKE) return fakeDownload()
    set({ state: 'downloading', version: status.version, percent: 0 })
    try {
      await autoUpdater.downloadUpdate()
    } catch (err) {
      console.error('[update]', err)
      set({ state: 'error', message: friendly(err) })
    }
  })
  handle('update:install', () => {
    if (FAKE) return
    // Cierra la app, instala la versión nueva en silencio y la vuelve a abrir
    autoUpdater.quitAndInstall(true, true)
  })

  if (enabled()) {
    // Una primera búsqueda poco después de abrir (sin molestar al arrancar) y luego cada cierto tiempo
    setTimeout(() => void check(), 15_000)
    setInterval(() => void check(), CHECK_EVERY_MS)
  }
}
