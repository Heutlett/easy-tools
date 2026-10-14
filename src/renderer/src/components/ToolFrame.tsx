import { useState } from 'react'
import { ToolStepContext, type ToolStep } from '../lib/toolStep'
import type { Tool } from '../tools/registry'
import ComponentGate from './ComponentGate'
import ToolIcon from './ToolIcon'

const DEFAULT_STEPS = ['Elige el archivo', 'Revisa', 'Guarda']

interface Props {
  tool: Tool
  onBack: () => void
  children: React.ReactNode
}

/** Una herramienta de archivos: encabezado con «← Archivos», los tres pasos y, abajo, la herramienta. */
export default function ToolFrame({ tool, onBack, children }: Props): React.JSX.Element {
  const [step, setStep] = useState<ToolStep>(1)
  const names = tool.steps ?? DEFAULT_STEPS
  return (
    <ToolStepContext.Provider value={setStep}>
      <div className="page tool-frame" style={{ '--accent': tool.color } as React.CSSProperties}>
        <header className="tool-frame-head">
          <button className="btn secondary small" onClick={onBack}>
            ← Archivos
          </button>
          <ToolIcon tool={tool} small />
          <div className="tool-frame-text">
            <h1>{tool.title}</h1>
            <p>{tool.description}</p>
          </div>
        </header>
        <ol className="steps" aria-label="Pasos">
          {names.map((name, i) => {
            const n = i + 1
            const state = step === n ? 'on' : step > n ? 'done' : ''
            return (
              <li
                key={name}
                className={`step ${state}`}
                aria-current={step === n ? 'step' : undefined}
              >
                <span className="step-dot">{step > n ? '✓' : n}</span>
                <b>{name}</b>
              </li>
            )
          })}
        </ol>
        <div className="tool-frame-body">
          <ComponentGate need={tool.requires}>{children}</ComponentGate>
        </div>
      </div>
    </ToolStepContext.Provider>
  )
}
