import { Suspense, useState } from 'react'
import { categories } from './tools/categories'
import { tools } from './tools/registry'
import ToolIcon from './components/ToolIcon'
import logo from './assets/logo.svg'
import AboutPage from './components/AboutPage'
import ToolLayout from './components/ToolLayout'
import UpdateBanner from './components/UpdateBanner'

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
            <h1>Easy Tools</h1>
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
      {categories.map((category) => {
        const list = tools.filter((t) => t.category === category.id)
        if (list.length === 0) return null
        return (
          <section key={category.id} className="category">
            <h3 className="category-title">
              <span aria-hidden>{category.icon}</span> {category.title}
            </h3>
            <div className="tool-grid">
              {list.map((t) => (
                <button
                  key={t.id}
                  className="tool-card"
                  style={{ '--accent': t.color } as React.CSSProperties}
                  onClick={() => setToolId(t.id)}
                >
                  <ToolIcon tool={t} />
                  <span className="tool-title">{t.title}</span>
                  <span className="tool-desc">{t.description}</span>
                </button>
              ))}
            </div>
          </section>
        )
      })}
    </main>
  )
}

export default function App(): React.JSX.Element {
  return (
    <>
      <UpdateBanner />
      <Content />
    </>
  )
}
