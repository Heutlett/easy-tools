import { dialog, BrowserWindow, shell } from 'electron'
import { handle } from '../ipc'
import { cancelJob } from '../jobs'
import { outputDir } from '../paths'

const FILTERS = {
  video: {
    name: 'Videos',
    extensions: ['mp4', 'mov', 'mkv', 'avi', 'webm', 'm4v', 'wmv', '3gp', 'mpg', 'mpeg']
  },
  pdf: { name: 'PDF', extensions: ['pdf'] },
  image: { name: 'Imágenes', extensions: ['png', 'jpg', 'jpeg', 'webp'] },
  word: { name: 'Documentos de Word', extensions: ['docx', 'doc'] }
}

export function registerCommonHandlers(): void {
  handle('dialog:open', async (e, p: { kind: keyof typeof FILTERS; multiple: boolean }) => {
    const win = BrowserWindow.fromWebContents(e.sender) ?? undefined
    const result = await dialog.showOpenDialog(win!, {
      properties: ['openFile', ...(p.multiple ? (['multiSelections'] as const) : [])],
      filters: [FILTERS[p.kind], { name: 'Todos los archivos', extensions: ['*'] }]
    })
    return result.canceled ? [] : result.filePaths
  })

  handle('shell:showItem', (_e, path: string) => shell.showItemInFolder(path))
  handle('shell:openOutputFolder', async () => {
    await shell.openPath(outputDir())
  })
  handle('job:cancel', (_e, jobId: string) => cancelJob(jobId))
}
