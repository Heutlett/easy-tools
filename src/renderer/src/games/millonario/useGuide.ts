import { usePersistentState } from '../../lib/usePersistentState'

/** Si la guía de inicio está oculta (se recuerda). `open` permite volver a mostrarla con el botón «¿Cómo se juega?». */
export function useGuide(): { hidden: boolean; open: boolean; hide: () => void; show: () => void } {
  const [hidden, setHidden] = usePersistentState('game:millonario:guide-hidden', false)
  return { hidden, open: !hidden, hide: () => setHidden(true), show: () => setHidden(false) }
}
