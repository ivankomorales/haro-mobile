// components/FormActions.jsx
import ConfirmModal from './ConfirmModal'
import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

export default function FormActions({
  onSubmit,
  cancelRedirect = '/orders',
  submitText = 'Create',
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
    navigate(location.state?.from || cancelRedirect)
  }

  return (
    <div className="flex gap-4 pt-2">
      <button
        type="button"
        onClick={() => setIsCancelOpen(true)}
        className="w-1/2 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-neutral-700 dark:text-gray-200 dark:hover:bg-neutral-600"
      >
        Cancel
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
        type="submit"
        onClick={onSubmit}
        className="w-1/2 py-2 rounded bg-black text-white hover:bg-neutral-800"
      >
        {submitText}
      </button>
    </div>
  )
}
