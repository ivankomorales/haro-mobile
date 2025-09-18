// components/FormActions.jsx
import ConfirmModal from './ConfirmModal'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

/**
 * FormActions Component
 *
 * Displays form action buttons for Submit and Cancel, with a confirmation modal
 * that prevents accidental navigation away with unsaved work.
 *
 * Props:
 * - onSubmit: () => void
 * - cancelRedirect: string (where to navigate on confirmed cancel)
 * - cancelState: any (state to preserve when navigating away)
 * - submitButtonText: string (default label)
 * - submittingButtonText: string (label while loading)
 * - cancelButtonText: string
 * - confirmTitle, confirmMessage, confirmText, cancelText: modal texts
 * - submitDisabled: boolean (external disable flag)
 * - submitLoading: boolean (external loading flag)
 * - lockCancelWhileSubmitting: boolean (disable Cancel while submitting)
 */
export default function FormActions({
  onSubmit,
  cancelRedirect = '/orders',
  cancelState,
  submitButtonText = 'Create',
  submittingButtonText = 'Saving…',
  cancelButtonText = 'Cancel',
  confirmTitle = 'Cancel?',
  confirmMessage = 'You will lose unsaved changes if you exit now.',
  confirmText = 'Yes, exit',
  cancelText = 'No, stay',
  submitDisabled = false,
  submitLoading = false,
  lockCancelWhileSubmitting = true,
}) {
  const [isCancelOpen, setIsCancelOpen] = useState(false)
  const navigate = useNavigate()

  const isSubmitDisabled = Boolean(submitDisabled || submitLoading)
  const isCancelDisabled = Boolean(lockCancelWhileSubmitting && submitLoading)

  const handleCancel = () => {
    setIsCancelOpen(false)
    navigate(cancelRedirect, { state: cancelState })
  }

  return (
    <div className="flex w-full gap-4 pt-2 sm:flex-row sm:justify-end">
      {/* Cancel */}
      <button
        type="button"
        onClick={() => setIsCancelOpen(true)}
        disabled={isCancelDisabled}
        aria-disabled={isCancelDisabled}
        className={[
          'w-full rounded py-2 text-gray-700 transition sm:w-auto sm:px-4',
          'bg-gray-200 hover:bg-gray-300',
          'disabled:cursor-not-allowed disabled:opacity-60',
          'dark:bg-neutral-600 dark:text-gray-200 dark:hover:bg-neutral-700',
        ].join(' ')}
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

      {/* Submit */}
      <button
        type="button"
        onClick={onSubmit}
        disabled={isSubmitDisabled}
        aria-disabled={isSubmitDisabled}
        aria-busy={submitLoading}
        className={[
          'w-full rounded py-2 text-white transition sm:w-auto sm:px-4',
          isSubmitDisabled
            ? 'cursor-not-allowed bg-blue-800 opacity-60' // fixed "bluee"
            : 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-600',
        ].join(' ')}
      >
        {submitLoading ? submittingButtonText : submitButtonText}
      </button>
    </div>
  )
}
