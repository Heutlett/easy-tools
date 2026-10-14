import { resolve } from 'path'
import { defineConfig } from 'electron-vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  main: {
    resolve: {
      alias: { sharp: resolve('src/main/stubs/sharp.ts') }
    },
    build: {
      // Se incluye en el bundle para poder reemplazar sharp; onnxruntime-node es nativo y se queda afuera.
      externalizeDeps: { exclude: ['@imgly/background-removal-node'] },
      rollupOptions: {
        external: ['onnxruntime-node'],
        // La voz se genera en un proceso aparte (ver src/main/voices.ts)
        input: {
          index: resolve('src/main/index.ts'),
          voiceWorker: resolve('src/main/voiceWorker.ts')
        }
      }
    }
  },
  preload: {},
  renderer: {
    build: {
      rollupOptions: {
        input: {
          index: resolve('src/renderer/index.html'),
          // Página oculta que usa "Word a PDF" para dibujar el documento antes de imprimirlo
          print: resolve('src/renderer/print.html')
        }
      }
    },
    resolve: {
      alias: {
        '@renderer': resolve('src/renderer/src')
      }
    },
    plugins: [react()]
  }
})
