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
  // NEW (optional, default false so nothing breaks):
  submitDisabled = false,
  submitLoading = false,
}) {
  const [isCancelOpen, setIsCancelOpen] = useState(false)
  const navigate = useNavigate()

  const handleCancel = () => {
    setIsCancelOpen(false)
    navigate(cancelRedirect, { state: cancelState })
  }

  const isSubmitDisabled = Boolean(submitDisabled || submitLoading)

  return (
    <div className="flex w-full gap-4 pt-2 sm:flex-row sm:justify-end">
      <button
        type="button"
        onClick={() => setIsCancelOpen(true)}
        className="w-full rounded bg-gray-200 py-2 text-gray-700 hover:bg-gray-300 sm:w-auto sm:px-4 dark:bg-neutral-700 dark:text-gray-200 dark:hover:bg-neutral-600"
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
        disabled={isSubmitDisabled}
        aria-disabled={isSubmitDisabled}
        className={[
          'w-full rounded py-2 text-white transition sm:w-auto sm:px-4',
          isSubmitDisabled
            ? 'cursor-not-allowed bg-neutral-400 opacity-60'
            : 'bg-black hover:bg-neutral-800 dark:bg-amber-500',
        ].join(' ')}
      >
        {submitLoading ? 'Saving…' : submitButtonText}
      </button>
    </div>
  )
}
