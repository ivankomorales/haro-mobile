import { useState, useRef, useEffect } from 'react'
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import { MoreVertical, FileText, FileSpreadsheet, ClockFading } from 'lucide-react'
import ExcelModal from '../components/ExcelModal'
import { exportSelectedOrdersToPDF, exportSelectedOrdersToExcel } from '../utils/exportUtils'
import { saveExportFields } from '../components/ExcelModal' // only if exported from the modal

export default function OrderActionsBar({
  userId = 'guest',
  selectedOrders = [],
  allVisibleOrders = [],
  onClearSelection,
  onSelectAll,
  onBulkStatusChange,
  t, // optional i18n function
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
    <div className="relative mt-2 -mb-3 flex items-center justify-between rounded-none border-0 bg-transparent p-1 shadow-none sm:mb-1">
      {/* Selected count + Results */}
      {/* <div className="flex items-center justify-between gap-4">
        <span className="text-sm">{selectedOrders.length} selected</span>
        <span className="text-sm text-gray-500 dark:text-gray-400">• {totalVisible} results</span>
      </div> */}

      {/* Desktop actions */}
      <div className="ml-auto hidden items-center gap-2 sm:flex">
        {/* Export to PDF button */}
        <button
          onClick={() => exportSelectedOrdersToPDF(selectedOrders)}
          disabled={!hasSelection}
          className="rounded p-2 hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent dark:hover:bg-neutral-700"
          title={hasSelection ? t('button.exportPdf') : t('messages.selectAtLeastOneOrder')}
        >
          <FileText className="h-5 w-5 text-red-800 dark:text-red-400" />
        </button>

        {/* Export to Excel button */}
        <button
          onClick={() => setExportOpen(true)}
          disabled={!hasSelection}
          className="rounded p-2 hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent dark:hover:bg-neutral-700"
          title={hasSelection ? t('button.exportExcel') : t('messages.selectAtLeastOneOrder')}
        >
          <FileSpreadsheet className="h-5 w-5 text-green-600 dark:text-green-400" />
        </button>

        {/* Bulk status change button */}
        <div className="">
          <button
            onClick={onBulkStatusChange}
            disabled={!hasSelection}
            className="ml-2 flex items-center gap-2 rounded bg-gray-600 px-3 py-1 text-sm text-white hover:bg-gray-700 disabled:cursor-not-allowed disabled:bg-gray-600 disabled:opacity-50 dark:bg-gray-500 dark:disabled:bg-gray-600"
            title={hasSelection ? t('button.changeStatus') : t('messages.selectAtLeastOneOrder')}
          >
            <ClockFading className="h-5 w-5" />
            {t('button.changeStatus')}
          </button>
        </div>
      </div>

      {/* Mobile actions (menu) */}
      <div className="ml-auto sm:hidden">
        <Menu as="div" className="relative inline-block text-left">
          <MenuButton className="rounded p-2 hover:bg-gray-200 dark:hover:bg-neutral-700">
            <MoreVertical className="h-5 w-5" />
          </MenuButton>

          <MenuItems className="absolute right-0 z-50 mt-2 w-44 overflow-hidden rounded border bg-white shadow dark:border-neutral-700 dark:bg-neutral-800">
            <MenuItem disabled={!hasSelection}>
              <button
                disabled={!hasSelection}
                onClick={() => exportSelectedOrdersToPDF(selectedOrders)}
                className="ml-1 flex w-full items-center gap-2 px-4 py-2 text-left text-sm disabled:cursor-not-allowed disabled:opacity-50 data-[headlessui-state=active]:bg-gray-100 dark:data-[headlessui-state=active]:bg-neutral-700"
              >
                <FileText className="h-5 w-5 text-red-800 dark:text-red-400" />
                {t('button.exportPdf')}
              </button>
            </MenuItem>

            <MenuItem disabled={!hasSelection}>
              <button
                disabled={!hasSelection}
                onClick={() => setExportOpen(true)}
                className="ml-1 flex w-full items-center gap-2 px-4 py-2 text-left text-sm disabled:cursor-not-allowed disabled:opacity-50 data-[headlessui-state=active]:bg-gray-100 dark:data-[headlessui-state=active]:bg-neutral-700"
              >
                <FileSpreadsheet className="h-5 w-5 text-green-600 dark:text-green-400" />
                {t('button.exportExcel')}
              </button>
            </MenuItem>

            <MenuItem disabled={!hasSelection}>
              <button
                disabled={!hasSelection}
                onClick={onBulkStatusChange}
                className="ml-1 flex w-full items-center gap-2 px-4 py-2 text-left text-sm disabled:cursor-not-allowed disabled:opacity-50 data-[headlessui-state=active]:bg-gray-100 dark:data-[headlessui-state=active]:bg-neutral-700"
              >
                <ClockFading className="h-5 w-5" />
                {t('button.changeStatus')}
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
