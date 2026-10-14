import { useCallback, useMemo, useState } from 'react'
import {
  ChromeSetterContext,
  ChromeStateContext,
  HOME,
  NavContext,
  type ChromeSetter,
  type GameChrome,
  type Nav,
  type Place
} from './nav'

export function NavProvider({
  children,
  initial
}: {
  children: React.ReactNode
  initial?: Partial<Place>
}): React.JSX.Element {
  const [place, setPlace] = useState<Place>({ ...HOME, ...initial })
  const go = useCallback<Nav['go']>((to) => setPlace({ ...HOME, ...to }), [])
  const patch = useCallback<Nav['patch']>((change) => setPlace((p) => ({ ...p, ...change })), [])
  const value = useMemo(() => ({ place, go, patch }), [place, go, patch])
  return <NavContext.Provider value={value}>{children}</NavContext.Provider>
}

export function ChromeProvider({ children }: { children: React.ReactNode }): React.JSX.Element {
  const [asked, setAsked] = useState<Record<string, GameChrome>>({})
  const set = useCallback<ChromeSetter>((key, chrome) => {
    setAsked((a) => {
      if (!chrome) {
        if (!(key in a)) return a
        return Object.fromEntries(Object.entries(a).filter(([k]) => k !== key))
      }
      return { ...a, [key]: chrome }
    })
  }, [])
  const state = useMemo(() => {
    const list = Object.values(asked)
    return {
      sidebar: list.some((c) => c.sidebar),
      ownHeader: list.some((c) => c.ownHeader)
    }
  }, [asked])
  return (
    <ChromeSetterContext.Provider value={set}>
      <ChromeStateContext.Provider value={state}>{children}</ChromeStateContext.Provider>
    </ChromeSetterContext.Provider>
  )
}
