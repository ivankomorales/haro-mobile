import { createContext, useContext, useMemo, useState } from 'react'

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

const LayoutContext = createContext(null)
LayoutContext.displayName = 'LayoutContext'

export function LayoutProvider({ children }) {
  const [title, setTitle] = useState(DEFAULT_TITLE)
  const [showSplitButton, setShowSplitButton] = useState(DEFAULT_SPLIT)

  const resetLayout = () => {
    setTitle(DEFAULT_TITLE)
    setShowSplitButton(DEFAULT_SPLIT)
  }

  // Avoid recreating object on every render
  const value = useMemo(
    () => ({
      title,
      setTitle,
      showSplitButton,
      setShowSplitButton,
      resetLayout,
      DEFAULT_TITLE,
      DEFAULT_SPLIT,
    }),
    [title, showSplitButton]
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
