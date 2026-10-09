import type { Tool } from '../tools/registry'

interface Props {
  tool: Tool
  onBack: () => void
  children: React.ReactNode
}

export default function ToolLayout({ tool, onBack, children }: Props): React.JSX.Element {
  return (
    <div className="tool-page" style={{ '--accent': tool.color } as React.CSSProperties}>
      <header className="tool-header">
        <button className="btn secondary" onClick={onBack}>
          ← Volver al inicio
        </button>
        <div className="tool-heading">
          <span className="tool-icon small">{tool.icon}</span>
          <div>
            <h1>{tool.title}</h1>
            <p className="muted">{tool.description}</p>
          </div>
        </div>
      </header>
      <main className="tool-body">{children}</main>
    </div>
  )
}
