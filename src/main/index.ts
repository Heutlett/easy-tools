import { app, BrowserWindow, protocol, shell } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { serveLocalFile } from './media'
import { registerCommonHandlers } from './tools/common'
import { registerVideoTools } from './tools/video'
import { registerYoutubeTools, updateYtDlpInBackground } from './tools/youtube'
import { registerPdfTools } from './tools/pdf'
import { registerImageTools } from './tools/image'
import { registerOutputTools } from './tools/output'
import { registerPdfToWordTools } from './tools/pdfToWord'
import { registerWordTools } from './tools/word'
import { registerAppInfoHandlers } from './appInfo'
import { registerComponentHandlers } from './components'
import { registerStoreHandlers } from './store'
import { registerVoiceHandlers } from './voices'
import { setupUpdater } from './updater'
import { fixedContentSize, setupWindowSizing } from './windowMode'

// Esquema propio para mostrar en la ventana archivos locales (videos, imágenes, PDFs)
// con soporte de "saltar" a cualquier punto del video.
protocol.registerSchemesAsPrivileged([
  {
    scheme: 'easy-media',
    privileges: {
      standard: true,
      secure: true,
      supportFetchAPI: true,
      corsEnabled: true,
      stream: true,
      bypassCSP: true
    }
  }
])

function createWindow(): void {
  const { width, height } = fixedContentSize()
  const mainWindow = new BrowserWindow({
    title: 'Educando',
    width,
    height,
    useContentSize: true,
    show: false,
    autoHideMenuBar: true,
    // Sin pantalla completa: solo el tamaño fijo y maximizada (ver windowMode.ts)
    fullscreenable: false,
    backgroundColor: '#faf7f2',
    icon,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })
  setupWindowSizing(mainWindow)

  mainWindow.webContents.setWindowOpenHandler((details) => {
    if (/^https?:\/\//i.test(details.url)) shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// Solo una copia de la app a la vez: dos copias compartiendo la misma carpeta de datos pueden perder lo que se guarda.
// Si ya hay una abierta, se trae esa al frente y esta se cierra.
if (!app.requestSingleInstanceLock()) {
  app.quit()
} else {
  app.on('second-instance', () => {
    const win = BrowserWindow.getAllWindows()[0]
    if (!win) return
    if (win.isMinimized()) win.restore()
    win.show()
    win.focus()
  })
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('cr.educando.app')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  protocol.handle('easy-media', async (request) => {
    const file = new URL(request.url).searchParams.get('path')
    if (!file) return new Response('Not found', { status: 404 })
    return serveLocalFile(file, request.headers.get('range'))
  })

  registerAppInfoHandlers()
  setupUpdater()
  registerStoreHandlers()
  registerComponentHandlers()
  registerVoiceHandlers()
  registerCommonHandlers()
  registerVideoTools()
  registerYoutubeTools()
  registerPdfTools()
  registerImageTools()
  registerOutputTools()
  registerWordTools()
  registerPdfToWordTools()
  updateYtDlpInBackground()

  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
