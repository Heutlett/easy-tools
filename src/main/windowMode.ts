import { app, BrowserWindow, screen } from 'electron'
import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'

/**
 * La ventana tiene solo dos estados, los de siempre del sistema: el tamaño fijo de abajo y maximizada
 * (con el botón de maximizar / restaurar de la barra de título). No se puede arrastrar para cambiarle el tamaño.
 */
const DESIGN = { width: 1100, height: 724 }

const stateFile = (): string => join(app.getPath('userData'), 'window-state.json')

function wasMaximized(): boolean {
  try {
    return JSON.parse(readFileSync(stateFile(), 'utf8')).maximized === true
  } catch {
    return false
  }
}

function remember(maximized: boolean): void {
  try {
    writeFileSync(stateFile(), JSON.stringify({ maximized }))
  } catch {
    // Si no se puede recordar, la próxima vez abre con el tamaño fijo.
  }
}

/** Tamaño del área de contenido en estado normal (si la pantalla es chica, se reduce). */
export function fixedContentSize(): { width: number; height: number } {
  const area = screen.getPrimaryDisplay().workArea
  return {
    width: Math.min(DESIGN.width, area.width - 24),
    height: Math.min(DESIGN.height, area.height - 80)
  }
}

/**
 * Escala la interfaz según el tamaño de la ventana: al maximizar todo se ve más grande y aprovecha el
 * espacio, en vez de quedar un recuadro chico rodeado de márgenes vacíos.
 * Con el tamaño fijo nunca se agranda (1×), y solo se reduce si el área disponible fuera menor a la prevista.
 */
export function updateZoom(win: BrowserWindow): void {
  if (win.isDestroyed()) return
  const [width, height] = win.getContentSize()
  const fit = Math.min(width / DESIGN.width, height / DESIGN.height)
  const factor = win.isMaximized() ? fit : Math.min(1, fit)
  win.webContents.setZoomFactor(Math.round(Math.min(2.4, Math.max(0.6, factor)) * 100) / 100)
}

/** Diferencia (en píxeles) que se tolera antes de considerar que la ventana cambió de tamaño */
const TOLERANCE = 3
/** Máximo de correcciones seguidas, por si el sistema no deja dejar la ventana exactamente de ese tamaño */
const MAX_CORRECTIONS = 3

/** Fija el tamaño de la ventana y escala la interfaz. Se llama una vez al crear la ventana. */
export function setupWindowSizing(win: BrowserWindow): void {
  let pending: ReturnType<typeof setTimeout> | undefined
  /** Tamaño exterior de la ventana en estado normal */
  let baseline: [number, number] = win.getSize() as [number, number]
  let corrections = 0

  // Windows y macOS avisan antes de que alguien arrastre un borde: se cancela.
  win.on('will-resize', (event) => {
    if (!win.isMaximized()) event.preventDefault()
  })

  // En cualquier sistema, si la ventana queda con otro tamaño (por ejemplo, acomodada a un lado de la pantalla), vuelve al fijo.
  const enforce = (): void => {
    if (win.isDestroyed() || win.isMaximized() || win.isMinimized() || win.isFullScreen()) return
    const [width, height] = win.getSize()
    if (Math.abs(width - baseline[0]) <= TOLERANCE && Math.abs(height - baseline[1]) <= TOLERANCE) {
      corrections = 0
      return
    }
    if (corrections++ < MAX_CORRECTIONS) win.setSize(baseline[0], baseline[1])
  }

  // Al terminar de cambiar de estado (los sistemas lo hacen en varios pasos) se revisa todo una vez más
  const settle = (): void => {
    clearTimeout(pending)
    pending = setTimeout(() => {
      enforce()
      updateZoom(win)
    }, 250)
  }
  win.on('resize', () => {
    updateZoom(win)
    settle()
  })
  win.on('maximize', () => {
    remember(true)
    updateZoom(win)
    settle()
  })
  win.on('unmaximize', () => {
    remember(false)
    corrections = 0
    updateZoom(win)
    settle()
  })
  win.on('show', settle)
  win.on('closed', () => clearTimeout(pending))
  win.webContents.on('did-finish-load', () => updateZoom(win))

  // Se abre como se dejó la última vez
  win.once('ready-to-show', () => {
    baseline = win.getSize() as [number, number]
    if (wasMaximized()) win.maximize()
    win.show()
  })
}
