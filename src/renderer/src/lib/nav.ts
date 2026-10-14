import { createContext, useContext, useEffect, useId } from 'react'
import type { SubjectId } from '../content/types'

/** Las pantallas de la barra lateral, más «Ayuda» y «Acerca de» */
export type PageId = 'home' | 'games' | 'aula' | 'class' | 'files' | 'about' | 'help'

export type AulaTab = 'timer' | 'wheel' | 'number'
export type ClassTab = 'points' | 'ranking' | 'students'

/** Dónde está la persona. Todo lo que cambia de pantalla pasa por aquí (el inicio, la ayuda, los consejos…). */
export interface Place {
  page: PageId
  /** Juegos: el juego abierto (null = el catálogo) */
  gameId: string | null
  /** Juegos: abrirlo y empezar con lo de la última vez (solo lo entienden los juegos que lo recuerdan) */
  quickPlay: boolean
  /** Juegos: filtro de materia con el que se abre el catálogo */
  subject: SubjectId | 'general' | null
  aulaTab: AulaTab
  /** En el aula: modo proyección (sin barra lateral y con todo más grande) */
  projecting: boolean
  classTab: ClassTab
  /** Archivos: la herramienta abierta (null = la lista) */
  fileTool: string | null
  /** Ayuda: la pregunta que se abre al entrar */
  helpTopic: string | null
}

export const HOME: Place = {
  page: 'home',
  gameId: null,
  quickPlay: false,
  subject: null,
  aulaTab: 'timer',
  projecting: false,
  classTab: 'points',
  fileTool: null,
  helpTopic: null
}

export interface Nav {
  place: Place
  /** Va a una pantalla; lo que no se indica vuelve a su valor inicial */
  go: (to: Partial<Place> & Pick<Place, 'page'>) => void
  /** Cambia algo de la pantalla actual sin salir de ella (otra pestaña, cerrar el juego…) */
  patch: (change: Partial<Place>) => void
}

export const NavContext = createContext<Nav>({
  place: HOME,
  go: () => undefined,
  patch: () => undefined
})

export const useNav = (): Nav => useContext(NavContext)

/* ---------- Lo que un juego le pide a la ventana ---------- */

/** Cómo se ve la ventana mientras hay un juego abierto */
export interface GameChrome {
  /** Muestra la barra lateral (por omisión un juego ocupa toda la ventana, como cuando se proyecta) */
  sidebar?: boolean
  /** El juego dibuja su propio encabezado (por omisión se muestra el título del juego con «← Juegos») */
  ownHeader?: boolean
}

export type ChromeSetter = (key: string, chrome: GameChrome | null) => void

export const ChromeSetterContext = createContext<ChromeSetter>(() => undefined)
export const ChromeStateContext = createContext<Required<GameChrome>>({
  sidebar: false,
  ownHeader: false
})

/** Lo que piden en este momento el juego abierto y sus pantallas (la ventana lo lee para mostrar u ocultar la barra lateral) */
export const useChromeState = (): Required<GameChrome> => useContext(ChromeStateContext)

/** Un juego (o una de sus pantallas) pide mostrar la barra lateral y/o su propio encabezado mientras esté en pantalla. */
export function useGameChrome(chrome: GameChrome | null): void {
  const set = useContext(ChromeSetterContext)
  const key = useId()
  const signature = chrome ? `${chrome.sidebar ?? ''}|${chrome.ownHeader ?? ''}` : ''
  useEffect(() => {
    if (!chrome) return
    set(key, chrome)
    return () => set(key, null)
    // Se vuelve a pedir solo cuando cambia lo que se pide
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signature, set, key])
}
