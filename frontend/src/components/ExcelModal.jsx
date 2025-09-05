// src/components/ExportModal.jsx
import {
  Dialog,
  DialogTitle,
  DialogPanel,
  Transition,
  TransitionChild,
} from '@headlessui/react'
import { Fragment, useEffect, useMemo, useState } from 'react'
import { getMessage as t } from '../utils/getMessage'
import { showSuccess, showError } from '../utils/toastUtils'

// === Helpers (puedes moverlos a utils/exportFields.js) ===
const EXPORT_FIELDS_KEY = (userId) => `exportFields:${userId}`

export const ALL_FIELDS = [
  'orderID',
  'customerName',
  'customerPhone',
  'customerEmail',
  'status',
  'isUrgent',
  'orderDate',
  'deliverDate',
  'notes',
  'productIndex',
  'productType',
  'productDescription',
  'glazeInteriorName',
  // 'glazeInteriorHex',
  'glazeExteriorName',
  // 'glazeExteriorHex',
]

export function loadExportFields(userId) {
  try {
    const raw = localStorage.getItem(EXPORT_FIELDS_KEY(userId))
    const arr = raw ? JSON.parse(raw) : null
    return Array.isArray(arr) && arr.length ? arr : ALL_FIELDS
  } catch {
    return ALL_FIELDS
  }
}

export function saveExportFields(userId, fields) {
  try {
    localStorage.setItem(EXPORT_FIELDS_KEY(userId), JSON.stringify(fields))
  } catch {
    // noop
  }
}

// === UI helper: etiquetas legibles (puedes i18n-izarlas con t(`fields.${key}`)) ===
const DEFAULT_LABELS = {
  orderID: 'Order ID',
  customerName: 'Customer name',
  customerPhone: 'Customer phone',
  customerEmail: 'Customer email',
  status: 'Status',
  isUrgent: 'Urgent?',
  orderDate: 'Order date',
  deliverDate: 'Delivery date',
  notes: 'Notes',
  productIndex: 'Product index',
  productType: 'Product type',
  productDescription: 'Product description',
  glazeInteriorName: 'Interior glaze',
  // glazeInteriorHex: 'Interior glaze (hex)',
  glazeExteriorName: 'Exterior glaze',
  // glazeExteriorHex: 'Exterior glaze (hex)',
}

export default function ExcelModal({
  open,
  onClose,
  onConfirm, // (selectedFields: string[]) => void
  userId, // string | number (para guardar preferencias)
}) {
  // ⬇️ hooks deben ir dentro del componente
  const [selected, setSelected] = useState(ALL_FIELDS)
  const [search, setSearch] = useState('')
  const [lastSaved, setLastSaved] = useState(ALL_FIELDS)

  // Cargar preferencias cuando se abre
  useEffect(() => {
    if (open) {
      const fields = loadExportFields(userId)
      setSelected(fields)
      setLastSaved(fields)
      setSearch('')
    }
  }, [open, userId])

  const isDirty = useMemo(() => {
    const a = JSON.stringify(selected)
    const b = JSON.stringify(lastSaved)
    return a !== b
  }, [selected, lastSaved])

  const toggle = (field) => {
    setSelected((prev) => {
      if (prev.includes(field)) {
        return prev.filter((f) => f !== field)
      }
      // insertar en la posición que le toca según ALL_FIELDS
      const idxInAll = ALL_FIELDS.indexOf(field)
      if (idxInAll === -1) return [...prev, field] // fallback
      // busca el primer seleccionado que venga DESPUÉS en ALL_FIELDS
      const nextKey = ALL_FIELDS.slice(idxInAll + 1).find((k) =>
        prev.includes(k)
      )
      if (!nextKey) return [...prev, field] // si no hay siguiente, va al final
      // inserta antes de ese siguiente
      const copy = [...prev]
      const insertAt = copy.indexOf(nextKey)
      copy.splice(insertAt, 0, field)
      return copy
    })
  }

  const selectAll = () => setSelected(ALL_FIELDS)
  const clearAll = () => setSelected([])

  const noneChecked = selected.length === 0

  const handleSavePrefs = () => {
    if (!isDirty || noneChecked) return
    try {
      saveExportFields(userId, selected)
      setLastSaved(selected)
      showSuccess('exportModal.prefsSaved')
    } catch {
      showError('exportModal.prefsSaveError')
    }
  }

  const handleExport = () => {
    if (selected.length === 0) return
    onConfirm(selected)
    onClose()
    showSuccess('exportModal.exportStarted')
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return ALL_FIELDS
    return ALL_FIELDS.filter((k) => {
      const label = t ? t(`fields.${k}`, DEFAULT_LABELS[k]) : DEFAULT_LABELS[k]
      return k.toLowerCase().includes(q) || label.toLowerCase().includes(q)
    })
  }, [search])

  const allChecked = selected.length === ALL_FIELDS.length

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
            <DialogPanel className="w-full max-w-lg transform overflow-hidden rounded-lg bg-white dark:bg-neutral-900 p-6 text-left align-middle shadow-xl transition-all">
              <DialogTitle className="text-lg font-medium text-gray-900 dark:text-white">
                {t ? t('exportModal.title') : 'Export to Excel / CSV'}
              </DialogTitle>

              {/* Buscar campo */}
              <div className="mt-4">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={
                    t ? t('exportModal.searchPlaceholder') : 'Search fields…'
                  }
                  className="w-full rounded border dark:border-neutral-600 bg-white dark:bg-neutral-800 text-sm text-gray-900 dark:text-white px-3 py-2"
                />
              </div>

              {/* Botones rápidos */}
              <div className="mt-3 flex flex-col sm:flex-row sm:items-center gap-2">
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={selectAll}
                    className="px-2 py-1 sm:px-3 sm:py-1.5 text-xs sm:text-sm bg-gray-200 dark:bg-neutral-700 text-gray-800 dark:text-white rounded hover:bg-gray-300 dark:hover:bg-neutral-600"
                  >
                    {t ? t('exportModal.selectAll') : 'Select all'}
                  </button>
                  <button
                    onClick={clearAll}
                    className="px-2 py-1 sm:px-3 sm:py-1.5 text-xs sm:text-sm bg-gray-200 dark:bg-neutral-700 text-gray-800 dark:text-white rounded hover:bg-gray-300 dark:hover:bg-neutral-600"
                  >
                    {t ? t('exportModal.clear') : 'Clear'}
                  </button>
                </div>

                <span className="sm:ml-auto text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                  {t
                    ? `${t('exportModal.selectedCount')} ${selected.length}`
                    : `${selected.length} selected`}
                </span>
              </div>

              {/* Lista de checkboxes */}
              <div className="mt-4 max-h-72 overflow-auto border rounded dark:border-neutral-700 divide-y dark:divide-neutral-800">
                {filtered.map((key) => {
                  const label = t
                    ? t(`fields.${key}`, DEFAULT_LABELS[key])
                    : DEFAULT_LABELS[key]
                  const checked = selected.includes(key)
                  return (
                    <label
                      key={key}
                      className="flex items-center gap-3 px-3 py-2 text-sm cursor-pointer hover:bg-gray-50 dark:hover:bg-neutral-800"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggle(key)}
                        className="h-4 w-4"
                      />
                      <span className="text-gray-900 dark:text-white">
                        {label}
                      </span>
                      <span className="ml-auto text-[11px] text-gray-500 dark:text-gray-400">
                        {key}
                      </span>
                    </label>
                  )
                })}
                {filtered.length === 0 && (
                  <div className="px-3 py-6 text-sm text-gray-500 dark:text-gray-400">
                    {t
                      ? t('exportModal.noResults')
                      : 'No fields match your search.'}
                  </div>
                )}
              </div>

              {/* Acciones */}
              <div className="mt-6 flex flex-col-reverse sm:flex-row gap-2 sm:gap-3">
                <button
                  onClick={onClose}
                  className="w-full sm:w-auto px-3 py-2 sm:px-4 sm:py-2 text-sm bg-gray-200 dark:bg-neutral-700 text-gray-800 dark:text-white rounded hover:bg-gray-300 dark:hover:bg-neutral-600"
                >
                  {t ? t('button.cancel') : 'Cancel'}
                </button>

                <button
                  onClick={handleSavePrefs}
                  disabled={noneChecked || !isDirty}
                  className={`w-full sm:w-auto px-3 py-2 sm:px-4 sm:py-2 text-sm text-white rounded transition
                    ${
                      noneChecked || !isDirty
                        ? 'bg-blue-600/60 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                >
                  {t ? t('exportModal.savePrefs') : 'Save preference'}
                </button>

                <button
                  onClick={handleExport}
                  disabled={noneChecked}
                  className={`w-full sm:w-auto px-3 py-2 sm:px-4 sm:py-2 text-sm text-white rounded transition
                     ${noneChecked ? 'bg-emerald-600/60 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700'}`}
                >
                  {t ? t('exportModal.export') : 'Export'}
                </button>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </Dialog>
    </Transition>
  )
}
