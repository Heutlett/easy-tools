import { createContext, useContext, useEffect } from 'react'

export type ToolStep = 1 | 2 | 3

export const ToolStepContext = createContext<(step: ToolStep) => void>(() => undefined)

/** La herramienta avisa en qué paso va: 1 elegir el archivo, 2 revisar o marcar, 3 guardar. */
export function useToolStep(step: ToolStep): void {
  const set = useContext(ToolStepContext)
  useEffect(() => set(step), [set, step])
}

/** Paso en el que va una herramienta, según lo que ya tiene: nada, un archivo, o una tarea en marcha / terminada */
export const stepOf = (hasFile: boolean, job: string): ToolStep =>
  job === 'running' || job === 'done' ? 3 : hasFile ? 2 : 1
