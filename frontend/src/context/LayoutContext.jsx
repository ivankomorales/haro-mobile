import { createContext, useContext, useMemo, useState, useCallback } from 'react'

/**
 * LayoutContext (React Context Provider)
 *
 * Provides shared layout-related state across the application:
 * - `title`: Page title (string)
 * - `showSplitButton`: Whether to display a split action button (boolean)
 *
 * Features:
 * - Global context to manage and update the UI title and layout actions.
 * - Useful for keeping header content dynamic depending on the page.
 *
 * Usage:
 * 1. Wrap your app with <LayoutProvider>.
 * 2. Call `useLayout()` inside any component to access or update layout state.
 *
 * Example:
 * ```js
 * const { setTitle, setShowSplitButton } = useLayout()
 * setTitle('Order Details')
 * setShowSplitButton(false)
 * ```
 */

const DEFAULT_TITLE = 'Haro Mobile' // TODO: i18n
const DEFAULT_SPLIT = true
const DEFAULT = { title: DEFAULT_TITLE, showSplitButton: DEFAULT_SPLIT }

const LayoutContext = createContext(null)
LayoutContext.displayName = 'LayoutContext'

export function LayoutProvider({ children }) {
  const [state, setState] = useState(DEFAULT)

  const setTitle = useCallback((s) => {
    setState((p) => ({ ...p, title: s }))
  }, [])

  const setShowSplitButton = useCallback((b) => {
    setState((p) => ({ ...p, showSplitButton: b }))
  }, [])

  const resetLayout = useCallback(() => {
    setState(DEFAULT)
  }, [])

  const value = useMemo(
    () => ({
      title: state.title,
      showSplitButton: state.showSplitButton,
      setTitle,
      setShowSplitButton,
      resetLayout,
      DEFAULT_TITLE,
      DEFAULT_SPLIT,
    }),
    [state, setTitle, setShowSplitButton, resetLayout]
  )

  return <LayoutContext.Provider value={value}>{children}</LayoutContext.Provider>
}

export function useLayout() {
  const ctx = useContext(LayoutContext)
  if (ctx == null) {
    throw new Error('useLayout must be used within a <LayoutProvider>.')
  }
  return ctx
}

export { DEFAULT_TITLE, DEFAULT_SPLIT }
