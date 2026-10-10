interface Props {
  active: boolean
  label: string
  onToggle: () => void
}

/** Estrella para marcar o desmarcar un favorito; se coloca sobre la esquina de una tarjeta. */
export default function FavoriteButton({ active, label, onToggle }: Props): React.JSX.Element {
  return (
    <button
      className={`fav-btn ${active ? 'on' : ''}`}
      aria-pressed={active}
      aria-label={active ? `Quitar de favoritos: ${label}` : `Agregar a favoritos: ${label}`}
      title={active ? 'Quitar de favoritos' : 'Agregar a favoritos'}
      onClick={onToggle}
    >
      {active ? '★' : '☆'}
    </button>
  )
}
