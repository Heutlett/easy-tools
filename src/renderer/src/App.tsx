import { Suspense, useState } from 'react'
import { tools } from './tools/registry'
import ComponentsBanner from './components/ComponentsBanner'
import ToolCatalog from './components/ToolCatalog'
import logo from './assets/logo.svg'
import AboutPage from './components/AboutPage'
import ToolLayout from './components/ToolLayout'
import UpdateBanner from './components/UpdateBanner'
import WelcomeNote from './components/WelcomeNote'

function Content(): React.JSX.Element {
  const [toolId, setToolId] = useState<string | null>(null)
  const [about, setAbout] = useState(false)
  const tool = tools.find((t) => t.id === toolId)

  if (about) return <AboutPage onBack={() => setAbout(false)} />

  if (tool) {
    return (
      <ToolLayout tool={tool} onBack={() => setToolId(null)}>
        <Suspense fallback={<p className="muted">Cargando…</p>}>
          <tool.Component />
        </Suspense>
      </ToolLayout>
    )
  }

  return (
    <main className="home">
      <header className="home-header">
        <div className="brand">
          <img className="app-logo" src={logo} alt="" />
          <div>
            <h1>Educando</h1>
            <p className="muted">Herramientas sencillas para el día a día en el aula</p>
          </div>
        </div>
        <div className="header-actions">
          <button className="btn secondary" onClick={() => setAbout(true)}>
            💜 Acerca de
          </button>
          <button className="btn secondary" onClick={() => window.api.openOutputFolder()}>
            📁 Mis archivos
          </button>
        </div>
      </header>
      <h2 className="home-question">¿Qué quieres hacer hoy?</h2>
      <ComponentsBanner />
      <ToolCatalog tools={tools} onOpen={setToolId} />
    </main>
  )
}

export default function App(): React.JSX.Element {
  return (
    <>
      <UpdateBanner />
      <Content />
      <WelcomeNote />
    </>
  )
}
