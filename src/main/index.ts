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
import { initLicense, registerLicenseHandlers } from './license'
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
    title: 'Easy Tools',
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
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('cr.easytools.app')

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
  registerLicenseHandlers()
  initLicense()
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
