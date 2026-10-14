import { Suspense } from 'react'
import ToolFrame from '../components/ToolFrame'
import ToolIcon from '../components/ToolIcon'
import { useNav } from '../lib/nav'
import { categories } from '../tools/categories'
import { tools } from '../tools/registry'

/** Archivos: las herramientas para preparar videos, documentos e imágenes, o la herramienta que se abrió. */
export default function FilesPage(): React.JSX.Element {
  const { place, go, patch } = useNav()
  const open = tools.find((t) => t.id === place.fileTool)

  if (open)
    return (
      <ToolFrame key={open.id} tool={open} onBack={() => patch({ fileTool: null })}>
        <Suspense fallback={<p className="muted">Cargando…</p>}>
          <open.Component />
        </Suspense>
      </ToolFrame>
    )

  return (
    <div className="page files-page">
      <header className="page-head">
        <div>
          <h1>Archivos</h1>
          <p className="page-sub">
            Todo se hace en tu computadora. Lo que guardes queda en Documentos → Educando.
          </p>
        </div>
        <button className="btn secondary small" onClick={() => window.api.openOutputFolder()}>
          📂 Abrir mis archivos
        </button>
      </header>
      {categories.map((c) => (
        <section key={c.id} className="block">
          <h2 className="group-title">
            <span className="dot" style={{ background: c.color }} aria-hidden />
            {c.title}
          </h2>
          <div className="file-grid">
            {tools
              .filter((t) => t.category === c.id)
              .map((t) => (
                <button
                  key={t.id}
                  className="file-card"
                  style={{ '--tint': c.color } as React.CSSProperties}
                  onClick={() => go({ page: 'files', fileTool: t.id })}
                >
                  <ToolIcon tool={t} />
                  <span className="file-card-title">{t.title}</span>
                  <span className="file-card-desc">{t.description}</span>
                </button>
              ))}
          </div>
        </section>
      ))}
    </div>
  )
}
