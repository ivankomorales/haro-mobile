// components/FormActions.jsx
import ConfirmModal from './ConfirmModal'
import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

/**
 * FormActions Component
 *
 * Displays form action buttons for **Submit** and **Cancel**, with a confirmation modal
 * that prevents accidental cancellation of unsaved work.
 *
 * Features:
 * - Cancel button opens a confirmation dialog before navigating away.
 * - Fully customizable button and modal texts.
 * - Supports dynamic redirect paths and state preservation using React Router.
 */
export default function FormActions({
  onSubmit,
  cancelRedirect = '/orders', // By default sent back to orders, we can prompt to send back to where we were
  cancelState, // For the Order Dradt and being able to go back when cancel Product Add
  submitButtonText = 'Create',
  cancelButtonText = 'Cancel',
  confirmTitle = 'Cancel?',
  confirmMessage = 'You will lose unsaved changes if you exit now.',
  confirmText = 'Yes, exit',
  cancelText = 'No, stay',
}) {
  const [isCancelOpen, setIsCancelOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  const handleCancel = () => {
    setIsCancelOpen(false)
    navigate(cancelRedirect, { state: cancelState })
  }

  return (
    <div className="flex sm:flex-row sm:justify-end gap-4 pt-2 w-full">
      <button
        type="button"
        onClick={() => setIsCancelOpen(true)}
        className="w-full sm:w-auto sm:px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-neutral-700 dark:text-gray-200 dark:hover:bg-neutral-600"
      >
        {cancelButtonText}
      </button>

      <ConfirmModal
        open={isCancelOpen}
        onClose={() => setIsCancelOpen(false)}
        onConfirm={handleCancel}
        title={confirmTitle}
        message={confirmMessage}
        confirmText={confirmText}
        cancelText={cancelText}
      />

      <button
        type="button"
        onClick={onSubmit}
        className="w-full sm:w-auto sm:px-4 py-2 rounded bg-black text-white hover:bg-neutral-800"
      >
        {submitButtonText}
      </button>
    </div>
  )
}
