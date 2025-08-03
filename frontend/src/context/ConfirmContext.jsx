// src/context/ConfirmContext.jsx
import { createContext, useContext, useState } from 'react'
import ConfirmModal from '../components/ConfirmModal'
import { en as messages } from '../locales/en'

/**
 * ConfirmContext (React Context Provider)
 *
 * Provides a global function to show a reusable confirmation modal from anywhere in the app.
 * Useful for confirming user actions like exiting a form, deleting, or canceling.
 *
 * Features:
 * - Uses React Context to expose a `showConfirmModal` function.
 * - Automatically renders `ConfirmModal` with customizable props.
 * - Uses default fallback texts (i18n) if none are provided.
 *
 * How to use:
 * 1. Wrap your app with <ConfirmProvider>.
 * 2. Call `useConfirm()` inside any component to get the `showConfirmModal` function.
 *
 * Example:
 * ```js
 * const confirm = useConfirm()
 * confirm(() => doSomething(), {
 *   title: 'Are you sure?',
 *   message: 'This action is irreversible.',
 * })
 * ```
 */
const ConfirmContext = createContext()

export const useConfirm = () => useContext(ConfirmContext)

export const ConfirmProvider = ({ children }) => {
  const [modalState, setModalState] = useState({ open: false })

  const showConfirmModal = (onConfirm, config = {}) => {
    setModalState({
      open: true,
      onConfirm,
      ...config,
    })
  }

  return (
    <ConfirmContext.Provider value={showConfirmModal}>
      {children}
      <ConfirmModal
        open={modalState.open}
        title={modalState.title || messages.confirm.ExitFlowTitle}
        message={modalState.message || messages.confirm.ExitFlowMessage}
        confirmText={modalState.confirmText || messages.confirm.ExitFlowConfirm}
        cancelText={modalState.cancelText || messages.confirm.ExitFlowCancel}
        onClose={() => setModalState({ open: false })}
        onConfirm={() => {
          modalState.onConfirm?.()
          setModalState({ open: false })
        }}
      />
    </ConfirmContext.Provider>
  )
}
