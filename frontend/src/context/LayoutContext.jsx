import { createContext, useContext, useState } from 'react'

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

const LayoutContext = createContext()

const DEFAULT_TITLE = 'Haro Mobile'
const DEFAULT_SPLIT = true

export function LayoutProvider({ children }) {
  const [title, setTitle] = useState(DEFAULT_TITLE)
  const [showSplitButton, setShowSplitButton] = useState(DEFAULT_SPLIT)

  return (
    <LayoutContext.Provider
      value={{
        title,
        setTitle,
        showSplitButton,
        setShowSplitButton,
        DEFAULT_TITLE,
        DEFAULT_SPLIT,
      }}
    >
      {children}
    </LayoutContext.Provider>
  )
}

export function useLayout() {
  return useContext(LayoutContext)
}
