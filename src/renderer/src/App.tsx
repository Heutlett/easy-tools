import { Suspense, useState } from 'react'
import { requestGame } from './lib/openIntent'
import type { HelpTopic } from './help/topics'
import { tools } from './tools/registry'
import ComponentsBanner from './components/ComponentsBanner'
import ToolCatalog from './components/ToolCatalog'
import logo from './assets/logo.svg'
import AboutPage from './components/AboutPage'
import HelpPage from './components/HelpPage'
import VoiceIndicator from './components/VoiceIndicator'
import { useWarmVoices } from './lib/voiceResources'
import TipCard from './components/TipCard'
import ToolLayout from './components/ToolLayout'
import RecoveredNotice from './components/RecoveredNotice'
import UpdateBanner from './components/UpdateBanner'
import WelcomeNote from './components/WelcomeNote'

function Content(): React.JSX.Element {
  const [toolId, setToolId] = useState<string | null>(null)
  const [about, setAbout] = useState(false)
  // Ayuda abierta (con la pregunta que se debe mostrar, si la hay)
  const [help, setHelp] = useState<{ topic: string | null } | null>(null)
  const tool = tools.find((t) => t.id === toolId)

  const goTo = (topic: HelpTopic): void => {
    const to = topic.target
    if (!to) return
    setHelp(null)
    if (to.kind === 'about') setAbout(true)
    else {
      if (to.kind === 'game') requestGame(to.id)
      setToolId(to.kind === 'game' ? 'games' : to.id)
    }
  }

  const renderView = (): React.JSX.Element => {
    if (about) return <AboutPage onBack={() => setAbout(false)} />

    if (help)
      return (
        <HelpPage
          key={help.topic ?? ''}
          openId={help.topic}
          onBack={() => setHelp(null)}
          onGo={goTo}
        />
      )

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
            <button className="btn secondary" onClick={() => setHelp({ topic: null })}>
              ❓ Ayuda
            </button>
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
        <TipCard onHelp={(topic) => setHelp({ topic })} />
        <ToolCatalog tools={tools} onOpen={setToolId} onHelp={(topic) => setHelp({ topic })} />
      </main>
    )
  }

  return renderView()
}

export default function App(): React.JSX.Element {
  useWarmVoices()
  return (
    <>
      <UpdateBanner />
      <RecoveredNotice />
      <Content />
      <WelcomeNote />
      <VoiceIndicator />
    </>
  )
}
