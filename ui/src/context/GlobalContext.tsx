/* eslint-disable react-refresh/only-export-components */
import { createContext, useEffect, useMemo, useReducer } from 'react'
import type { Dispatch, PropsWithChildren } from 'react'
import { globalReducer, initialState } from './reducer'
import type { GlobalAction, GlobalState } from './types'

interface GlobalContextValue {
  state: GlobalState
  dispatch: Dispatch<GlobalAction>
}

export const GlobalContext = createContext<GlobalContextValue | undefined>(undefined)

export const GlobalProvider = ({ children }: PropsWithChildren) => {
  const [state, dispatch] = useReducer(globalReducer, initialState)

  useEffect(() => {
    const root = document.documentElement
    root.dataset.theme = state.ui.theme
    root.dataset.textSize = state.ui.textSize
  }, [state.ui.theme, state.ui.textSize])

  const value = useMemo(() => ({ state, dispatch }), [state])

  return <GlobalContext.Provider value={value}>{children}</GlobalContext.Provider>
}
