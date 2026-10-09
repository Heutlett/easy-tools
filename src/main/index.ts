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
import { registerPdfToWordTools } from './tools/pdfToWord'
import { registerWordTools } from './tools/word'

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
  const mainWindow = new BrowserWindow({
    title: 'Easy Tools',
    width: 1100,
    height: 760,
    minWidth: 900,
    minHeight: 640,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => mainWindow.show())

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

  registerCommonHandlers()
  registerVideoTools()
  registerYoutubeTools()
  registerPdfTools()
  registerImageTools()
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
