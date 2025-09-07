// src/components/StatusModal.jsx
import { Dialog, DialogTitle, DialogPanel, Transition, TransitionChild } from '@headlessui/react'
import { Fragment, useEffect, useMemo, useState } from 'react'
import { getMessage as t } from '../utils/getMessage'

export default function StatusModal({
  open,
  onClose,
  onConfirm,
  currentStatus = '',
  // i18n TEXTS TODO
}) {
  const [newStatus, setNewStatus] = useState(currentStatus || 'pending') //(t('status.pending'))

  // Keep state in sync when modal opens or currentStatus changes
  useEffect(() => {
    if (open) setNewStatus(currentStatus || 'pending')
  }, [open, currentStatus])

  // Optional: stable order for options (avoid relying on object key order)
  const STATUS_ORDER = useMemo(() => ['new', 'pending', 'inProgress', 'completed', 'cancelled'], [])

  const handleConfirm = () => {
    onConfirm(newStatus)
    onClose()
  }

  const isUnchanged = (currentStatus || 'pending') === newStatus

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
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
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
            <DialogPanel className="w-full max-w-md transform overflow-hidden rounded-lg bg-white p-6 text-left align-middle shadow-xl transition-all dark:bg-neutral-900">
              <DialogTitle className="text-lg font-medium text-gray-900 dark:text-white">
                {t('statusModal.title')}
              </DialogTitle>

              <div className="mt-4">
                <label className="mb-1 block text-sm text-gray-700 dark:text-gray-300">
                  {t('statusModal.subtitle')}
                </label>

                {/* Keep value as canonical; display label via i18n using canonical key */}
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full rounded border bg-white px-3 py-2 text-sm text-gray-900 dark:border-neutral-600 dark:bg-neutral-800 dark:text-white"
                >
                  {STATUS_ORDER.map((status) => (
                    <option key={status} value={status}>
                      {/* If you prefer English labels from STATUS_LABELS, use STATUS_LABELS[status] instead of t(...) */}
                      {t(`status.${status}`)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={onClose}
                  className="rounded bg-gray-200 px-4 py-2 text-sm text-gray-800 hover:bg-gray-300 dark:bg-neutral-700 dark:text-white dark:hover:bg-neutral-600"
                >
                  {t('button.cancel')}
                </button>

                <button
                  onClick={handleConfirm}
                  disabled={isUnchanged}
                  className={`rounded px-4 py-2 text-sm text-white transition ${
                    isUnchanged
                      ? 'cursor-not-allowed bg-emerald-600/60'
                      : 'bg-emerald-600 hover:bg-emerald-700'
                  }`}
                >
                  {t('button.confirm')}
                </button>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </Dialog>
    </Transition>
  )
}
