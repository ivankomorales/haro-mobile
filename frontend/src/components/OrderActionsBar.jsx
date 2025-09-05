import { useState, useRef, useEffect } from 'react'
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import { MoreVertical, FileText, FileSpreadsheet } from 'lucide-react'

import ExcelModal from '../components/ExcelModal'
import {
  exportSelectedOrdersToPDF,
  exportSelectedOrdersToExcel,
} from '../utils/exportUtils'
import { saveExportFields } from '../components/ExcelModal' // only if exported from the modal

export default function OrderActionsBar({
  userId = 'guest',
  selectedOrders = [],
  allVisibleOrders = [],
  onClearSelection,
  onSelectAll,
  onBulkStatusChange,
}) {
  const [exportOpen, setExportOpen] = useState(false)

  // === CHECKBOX STATE HANDLING ===
  const checkboxRef = useRef(null)
  const totalVisible = allVisibleOrders.length
  const hasSelection = selectedOrders.length > 0
  const allSelected = hasSelection && selectedOrders.length === totalVisible

  const isIndeterminate =
    selectedOrders.length > 0 && selectedOrders.length < allVisibleOrders.length

  // Update the "indeterminate" state based on selection count
  useEffect(() => {
    if (!checkboxRef.current) return

    checkboxRef.current.indeterminate = isIndeterminate
  }, [isIndeterminate])

  // === EXCEL EXPORT HANDLER ===
  const handleExportConfirm = async (fields) => {
    try {
      if (saveExportFields) saveExportFields(userId, fields)
    } catch (_) {}

    await exportSelectedOrdersToExcel(selectedOrders, fields)
    setExportOpen(false)
  }

  return (
    <div
      className="
        flex items-center justify-between p-3 mb-4
        bg-transparent
        border-0
        rounded-none shadow-none
        relative
      "
    >
      {/* Checkbox + counters */}
      <div className="flex items-center gap-3">
        <input
          ref={checkboxRef} // needed to control "indeterminate" state
          type="checkbox"
          checked={allSelected}
          disabled={totalVisible === 0}
          onChange={(e) => {
            if (e.target.checked) {
              const ids = allVisibleOrders.map((o) => o._id)
              onSelectAll?.(ids)
            } else {
              onClearSelection?.()
            }
          }}
          aria-checked={isIndeterminate ? 'mixed' : undefined}
          className="w-4 h-4 disabled:opacity-40 disabled:cursor-not-allowed"
          title={totalVisible === 0 ? 'No results to select' : ''}
        />

        {/* Selected count */}
        <span className="text-sm">{selectedOrders.length} selected</span>

        {/* Total visible count */}
        <span className="text-sm text-gray-500 dark:text-gray-400">
          • {totalVisible} results
        </span>
      </div>

      {/* Desktop actions */}
      <div className="hidden sm:flex items-center gap-2">
        {/* Export to PDF button */}
        <button
          onClick={() => exportSelectedOrdersToPDF(selectedOrders)}
          disabled={!hasSelection}
          className="
            p-2 rounded
            hover:bg-gray-200 dark:hover:bg-neutral-700
            disabled:opacity-50 disabled:cursor-not-allowed
            disabled:hover:bg-transparent
          "
          title={hasSelection ? 'Export to PDF' : 'Select at least 1 order'}
        >
          <FileText className="w-5 h-5" />
        </button>

        {/* Export to Excel button */}
        <button
          onClick={() => setExportOpen(true)}
          disabled={!hasSelection}
          className="
            p-2 rounded
            hover:bg-gray-200 dark:hover:bg-neutral-700
            disabled:opacity-50 disabled:cursor-not-allowed
            disabled:hover:bg-transparent
          "
          title={hasSelection ? 'Export to Excel' : 'Select at least 1 order'}
        >
          <FileSpreadsheet className="w-5 h-5" />
        </button>

        {/* Bulk status change button */}
        <button
          onClick={onBulkStatusChange}
          disabled={!hasSelection}
          className="
            ml-2 px-3 py-1 bg-emerald-600 text-white text-sm rounded
            hover:bg-emerald-700
            disabled:opacity-50 disabled:cursor-not-allowed
            disabled:bg-emerald-600
          "
          title={hasSelection ? 'Change status' : 'Select at least 1 order'}
        >
          Change status
        </button>
      </div>

      {/* Mobile actions (menu) */}
      <div className="sm:hidden">
        <Menu as="div" className="relative inline-block text-left">
          <MenuButton className="p-2 rounded hover:bg-gray-200 dark:hover:bg-neutral-700">
            <MoreVertical className="w-5 h-5" />
          </MenuButton>

          <MenuItems className="absolute right-0 mt-2 w-44 z-50 bg-white dark:bg-neutral-800 border dark:border-neutral-700 rounded shadow overflow-hidden">
            <MenuItem disabled={!hasSelection}>
              <button
                disabled={!hasSelection}
                onClick={() => exportSelectedOrdersToPDF(selectedOrders)}
                className="
                  w-full text-left px-4 py-2 text-sm
                  data-[headlessui-state=active]:bg-gray-100
                  dark:data-[headlessui-state=active]:bg-neutral-700
                  disabled:opacity-50 disabled:cursor-not-allowed
                "
              >
                Export to PDF
              </button>
            </MenuItem>

            <MenuItem disabled={!hasSelection}>
              <button
                disabled={!hasSelection}
                onClick={() => setExportOpen(true)}
                className="
                  w-full text-left px-4 py-2 text-sm
                  data-[headlessui-state=active]:bg-gray-100
                  dark:data-[headlessui-state=active]:bg-neutral-700
                  disabled:opacity-50 disabled:cursor-not-allowed
                "
              >
                Export to Excel
              </button>
            </MenuItem>

            <MenuItem disabled={!hasSelection}>
              <button
                disabled={!hasSelection}
                onClick={onBulkStatusChange}
                className="
                  w-full text-left px-4 py-2 text-sm
                  data-[headlessui-state=active]:bg-gray-100
                  dark:data-[headlessui-state=active]:bg-neutral-700
                  disabled:opacity-50 disabled:cursor-not-allowed
                "
              >
                Change status
              </button>
            </MenuItem>
          </MenuItems>
        </Menu>
      </div>

      {/* Excel fields selection modal */}
      <ExcelModal
        open={exportOpen}
        onClose={() => setExportOpen(false)}
        onConfirm={handleExportConfirm}
        userId={userId}
      />
    </div>
  )
}
