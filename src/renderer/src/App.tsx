import { Suspense, useEffect, useRef } from 'react'
import type { HelpTopic } from './help/topics'
import { useChromeState, useNav, type Place } from './lib/nav'
import { ChromeProvider, NavProvider } from './lib/NavProvider'
import AboutPage from './components/AboutPage'
import HelpPage from './components/HelpPage'
import RecoveredNotice from './components/RecoveredNotice'
import Sidebar from './components/Sidebar'
import UpdateBanner from './components/UpdateBanner'
import WelcomeNote from './components/WelcomeNote'
import AulaPage from './pages/AulaPage'
import ClassPage from './pages/ClassPage'
import FilesPage from './pages/FilesPage'
import GamesPage from './pages/GamesPage'
import Home from './pages/Home'

/** A dónde lleva el botón «Llévame ahí» de la ayuda */
function placeFor(topic: HelpTopic): (Partial<Place> & Pick<Place, 'page'>) | null {
  const to = topic.target
  if (!to) return null
  if (to.kind === 'about') return { page: 'about' }
  if (to.kind === 'game') return { page: 'games', gameId: to.id }
  switch (to.id) {
    case 'games':
      return { page: 'games' }
    case 'students':
      return { page: 'class', classTab: 'students' }
    case 'stars':
      return { page: 'class', classTab: 'points' }
    case 'wheel':
      return { page: 'aula', aulaTab: 'wheel' }
    case 'timer':
      return { page: 'aula', aulaTab: 'timer' }
    case 'random-number':
      return { page: 'aula', aulaTab: 'number' }
    default:
      return { page: 'files', fileTool: to.id }
  }
}

function Shell(): React.JSX.Element {
  const { place, go } = useNav()
  const chrome = useChromeState()
  // Un juego abierto ocupa toda la ventana (como al proyectar), salvo las pantallas que piden la barra lateral
  const fullWindow =
    (place.page === 'games' && place.gameId !== null && !chrome.sidebar) ||
    (place.page === 'aula' && place.projecting)

  // Al cambiar de pantalla se vuelve arriba (todo se desplaza dentro de la misma zona)
  const main = useRef<HTMLElement>(null)
  useEffect(() => {
    main.current?.scrollTo(0, 0)
  }, [place.page, place.gameId, place.fileTool, place.classTab, place.aulaTab])

  const toHome = (): void => go({ page: 'home' })
  const page = ((): React.JSX.Element => {
    switch (place.page) {
      case 'games':
        return <GamesPage />
      case 'aula':
        return <AulaPage />
      case 'class':
        return <ClassPage />
      case 'files':
        return <FilesPage />
      case 'about':
        return <AboutPage onBack={toHome} />
      case 'help':
        return (
          <HelpPage
            key={place.helpTopic ?? ''}
            openId={place.helpTopic}
            onBack={toHome}
            onGo={(topic) => {
              const to = placeFor(topic)
              if (to) go(to)
            }}
          />
        )
      default:
        return <Home />
    }
  })()

  return (
    <div className={`shell ${fullWindow ? 'full' : ''}`}>
      {!fullWindow && <Sidebar />}
      <main className="main" id="main" ref={main}>
        <Suspense fallback={<p className="muted page">Cargando…</p>}>{page}</Suspense>
      </main>
    </div>
  )
}

export default function App(): React.JSX.Element {
  return (
    <NavProvider>
      <ChromeProvider>
        <div className="app">
          <UpdateBanner />
          <RecoveredNotice />
          <Shell />
          <WelcomeNote />
        </div>
      </ChromeProvider>
    </NavProvider>
  )
}
