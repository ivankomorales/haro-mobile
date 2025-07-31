import { createContext, useContext, useState } from 'react'
import ConfirmModal from '../components/ConfirmModal'
import { en as messages } from '../locales/en'

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
