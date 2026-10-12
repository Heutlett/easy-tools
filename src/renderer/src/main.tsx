import './assets/main.css'

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { initDurable } from './lib/durable'

// Sin esto, soltar un archivo fuera de una zona de arrastre haría que la ventana lo abra y se pierda la app.
window.addEventListener('dragover', (e) => e.preventDefault())
window.addEventListener('drop', (e) => e.preventDefault())

// Primero se leen los datos guardados, para que cada pantalla nazca ya con lo que tenía
void initDurable().finally(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>
  )
})
