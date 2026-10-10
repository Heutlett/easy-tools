import { useCallback, useState } from 'react'
import type { Tool } from '../tools/registry'
import { ToolHeaderContext, type HeaderOverride } from './ToolHeaderContext'
import ToolIcon from './ToolIcon'

interface Props {
  tool: Tool
  onBack: () => void
  children: React.ReactNode
}

export default function ToolLayout({ tool, onBack, children }: Props): React.JSX.Element {
  // Algunas herramientas (como Juegos) cambian el título y el botón de volver mientras muestran algo dentro
  // Pila de encabezados: manda el último que se pidió
  const [stack, setStack] = useState<[string, HeaderOverride][]>([])
  const setOverride = useCallback((key: string, value: HeaderOverride | null): void => {
    setStack((s) => {
      const at = s.findIndex(([k]) => k === key)
      if (!value) return at < 0 ? s : s.filter(([k]) => k !== key)
      if (at < 0) return [...s, [key, value]]
      return s.map((e, i) => (i === at ? [key, value] : e))
    })
  }, [])
  const override = stack.length ? stack[stack.length - 1][1] : null
  return (
    <ToolHeaderContext.Provider value={setOverride}>
      <div className="tool-page" style={{ '--accent': tool.color } as React.CSSProperties}>
        <header className="tool-header">
          <button className="btn secondary" onClick={override ? override.onBack : onBack}>
            {override ? override.backLabel : '← Volver al inicio'}
          </button>
          <div className="tool-heading">
            {override ? (
              override.icon && <span className="tool-icon small">{override.icon}</span>
            ) : (
              <ToolIcon tool={tool} small />
            )}
            <div>
              <h1>{override ? override.title : tool.title}</h1>
              {(override ? override.description : tool.description) && (
                <p className="muted">{override ? override.description : tool.description}</p>
              )}
            </div>
          </div>
        </header>
        <main className="tool-body">{children}</main>
      </div>
    </ToolHeaderContext.Provider>
  )
}
