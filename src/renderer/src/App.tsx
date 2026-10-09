import { Suspense, useState } from 'react'
import { categories } from './tools/categories'
import { tools } from './tools/registry'
import ToolIcon from './components/ToolIcon'
import ToolLayout from './components/ToolLayout'

export default function App(): React.JSX.Element {
  const [toolId, setToolId] = useState<string | null>(null)
  const tool = tools.find((t) => t.id === toolId)

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
        <div>
          <h1>Easy Tools</h1>
          <p className="muted">Herramientas sencillas para el día a día en el aula</p>
        </div>
        <button className="btn secondary" onClick={() => window.api.openOutputFolder()}>
          📁 Mis archivos
        </button>
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
