// src/components/ConfirmModal.jsx
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Description,
} from '@headlessui/react'

//A reusable confirmation modal using Headless UI.

//- Displays a dialog with a title, message, and two action buttons: Confirm and Cancel.
//- Supports full customization of texts and actions via props.
//- Ideal for confirming destructive or important user actions (e.g. cancel, delete).
export default function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  message = 'This action cannot be undone.',
  confirmText = 'Yes',
  cancelText = 'No',
}) {
  return (
    <Dialog open={open} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="mx-auto min-w-[300px] max-w-sm rounded bg-white dark:bg-neutral-800 p-6 shadow-lg">
          {title && (
            <DialogTitle className="text-lg text-black dark:text-white font-semibold mb-2">
              {title}
            </DialogTitle>
          )}
          {message && (
            <Description className="text-sm text-gray-500 dark:text-gray-500 mb-4">
              {message}
            </Description>
          )}
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="flex-1 py-2 rounded bg-gray-200 dark:bg-neutral-700 dark:text-white hover:bg-gray-300 dark:hover:bg-neutral-600"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 py-2 rounded bg-red-500 text-white hover:bg-red-600"
            >
              {confirmText}
            </button>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  )
}
