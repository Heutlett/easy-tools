import { useState } from 'react'
import { categories, type CategoryId } from '../tools/categories'
import type { Tool } from '../tools/registry'
import { matchesQuery } from '../lib/search'
import { useFavorites } from '../lib/useFavorites'
import FavoriteButton from './FavoriteButton'
import ToolIcon from './ToolIcon'

interface Props {
  tools: Tool[]
  onOpen: (id: string) => void
}

/** El catálogo de la pantalla de inicio: buscador, filtro por sección, favoritos arriba y el resto por secciones. */
export default function ToolCatalog({ tools, onOpen }: Props): React.JSX.Element {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<CategoryId | 'all'>('all')
  const favorites = useFavorites('favorite-tools')

  const visible = tools.filter(
    (t) =>
      (category === 'all' || t.category === category) && matchesQuery(query, t.title, t.description)
  )
  const favorite = visible.filter((t) => favorites.has(t.id))
  const filtering = query.trim() !== '' || category !== 'all'

  const card = (t: Tool): React.JSX.Element => (
    <div
      key={t.id}
      className="tool-card-wrap"
      style={{ '--accent': t.color } as React.CSSProperties}
    >
      <button className="tool-card" onClick={() => onOpen(t.id)}>
        <ToolIcon tool={t} />
        <span className="tool-title">{t.title}</span>
        <span className="tool-desc">{t.description}</span>
      </button>
      <FavoriteButton
        active={favorites.has(t.id)}
        label={t.title}
        onToggle={() => favorites.toggle(t.id)}
      />
    </div>
  )

  return (
    <>
      <div className="catalog-controls">
        <input
          className="field catalog-search"
          type="search"
          value={query}
          placeholder="🔍 Buscar una herramienta…"
          aria-label="Buscar una herramienta"
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className="pills" role="group" aria-label="Sección">
          <button
            className={`pill ${category === 'all' ? 'selected' : ''}`}
            aria-pressed={category === 'all'}
            onClick={() => setCategory('all')}
          >
            Todas
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              className={`pill ${category === c.id ? 'selected' : ''}`}
              aria-pressed={category === c.id}
              onClick={() => setCategory(c.id)}
            >
              {c.icon} {c.title}
            </button>
          ))}
        </div>
      </div>

      {favorite.length > 0 && (
        <section className="category favorites">
          <h3 className="category-title">
            <span aria-hidden>⭐</span> Favoritos
          </h3>
          <div className="tool-grid">{favorite.map(card)}</div>
        </section>
      )}

      {categories.map((c) => {
        const list = visible.filter((t) => t.category === c.id)
        if (list.length === 0) return null
        return (
          <section key={c.id} className="category">
            <h3 className="category-title">
              <span aria-hidden>{c.icon}</span> {c.title}
            </h3>
            <div className="tool-grid">{list.map(card)}</div>
          </section>
        )
      })}

      {visible.length === 0 && (
        <div className="notice catalog-empty">
          <p>No encontré ninguna herramienta{query.trim() ? ` para «${query.trim()}»` : ''}.</p>
          {filtering && (
            <button
              className="btn secondary small"
              onClick={() => (setQuery(''), setCategory('all'))}
            >
              Ver todas
            </button>
          )}
        </div>
      )}
    </>
  )
}
