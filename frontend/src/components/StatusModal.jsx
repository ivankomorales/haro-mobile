import {
  Dialog,
  DialogTitle,
  DialogPanel,
  Transition,
  TransitionChild,
} from '@headlessui/react'
import { Fragment, useState } from 'react'
import { STATUS_LABELS } from '../utils/orderStatusUtils'

export default function StatusModal({
  open,
  onClose,
  onConfirm,
  currentStatus = '',
}) {
  const [newStatus, setNewStatus] = useState(currentStatus || 'Pending')

  const handleConfirm = () => {
    onConfirm(newStatus)
    onClose()
  }

  return (
    <Transition appear show={open} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25 backdrop-blur-sm" />
        </TransitionChild>

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <TransitionChild
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-150"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <DialogPanel className="w-full max-w-md transform overflow-hidden rounded-lg bg-white dark:bg-neutral-900 p-6 text-left align-middle shadow-xl transition-all">
              <DialogTitle className="text-lg font-medium text-gray-900 dark:text-white">
                Cambiar estado
              </DialogTitle>

              <div className="mt-4">
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">
                  Nuevo estado
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full rounded border dark:border-neutral-600 bg-white dark:bg-neutral-800 text-sm text-gray-900 dark:text-white px-3 py-2"
                >
                  {Object.keys(STATUS_LABELS).map((status) => (
                    <option key={status} value={status}>
                      {STATUS_LABELS[status]}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-sm bg-gray-200 dark:bg-neutral-700 text-gray-800 dark:text-white rounded hover:bg-gray-300 dark:hover:bg-neutral-600"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirm}
                  className="px-4 py-2 text-sm bg-emerald-600 text-white rounded hover:bg-emerald-700"
                >
                  Confirmar
                </button>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </Dialog>
    </Transition>
  )
}
