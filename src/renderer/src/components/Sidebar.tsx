import logo from '../assets/logo.svg'
import { useNav, type PageId } from '../lib/nav'
import TipCard from './TipCard'

/** Los cinco lugares de la app, con el color de su sección */
const ITEMS: { page: PageId; label: string; icon: string; color: string }[] = [
  { page: 'home', label: 'Inicio', icon: '🏠', color: '#e8644a' },
  { page: 'games', label: 'Juegos', icon: '🎮', color: '#8a63d2' },
  { page: 'aula', label: 'En el aula', icon: '⏱️', color: '#f2b632' },
  { page: 'class', label: 'Mi clase', icon: '👥', color: '#4fae6a' },
  { page: 'files', label: 'Archivos', icon: '📁', color: '#3b8fd9' }
]

/** Barra lateral fija: a dónde ir, un consejo y los enlaces de siempre (ayuda, mis archivos, acerca de). */
export default function Sidebar(): React.JSX.Element {
  const { place, go } = useNav()
  return (
    <aside className="sidebar" aria-label="Menú principal">
      <div className="sidebar-brand">
        <img className="sidebar-logo" src={logo} alt="" />
        <span>Educando</span>
      </div>
      <nav className="sidebar-nav">
        {ITEMS.map((item) => (
          <button
            key={item.page}
            className={`sidebar-item ${place.page === item.page ? 'on' : ''}`}
            style={{ '--nav-color': item.color } as React.CSSProperties}
            aria-current={place.page === item.page ? 'page' : undefined}
            onClick={() => go({ page: item.page })}
          >
            <span className="sidebar-icon" aria-hidden>
              {item.icon}
            </span>
            {item.label}
          </button>
        ))}
      </nav>
      <div className="sidebar-grow" />
      <TipCard onHelp={(topic) => go({ page: 'help', helpTopic: topic })} />
      <div className="sidebar-links">
        <button onClick={() => go({ page: 'help' })}>❓ Ayuda</button>
        <button onClick={() => window.api.openOutputFolder()}>📂 Mis archivos</button>
        <button onClick={() => go({ page: 'about' })}>💜 Acerca de</button>
      </div>
    </aside>
  )
}
