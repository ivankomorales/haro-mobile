import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import { MoreVertical, FileText, FileSpreadsheet, File } from 'lucide-react'
import {
  exportSelectedOrdersToPDF,
  exportSelectedOrdersToExcel,
  exportSelectedOrdersToWord,
} from '../utils/exportUtils'

export default function OrderActionsBar({
  selectedOrders = [],
  allVisibleOrders = [],
  onClearSelection,
  onSelectAll,
  onBulkStatusChange,
}) {
  const allSelected = selectedOrders.length === allVisibleOrders.length

  return (
    <div className="flex items-center justify-between p-3 mb-4 bg-gray-100 dark:bg-neutral-800 border dark:border-neutral-700 rounded shadow">
      {/* Checkbox + contador */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={allSelected}
          onChange={(e) => {
            if (e.target.checked) {
              const ids = allVisibleOrders.map((o) => o._id)
              onSelectAll(ids)
            } else {
              onClearSelection()
            }
          }}
          className="w-4 h-4"
        />
        <span className="text-sm">{selectedOrders.length} seleccionados</span>
      </div>

      {/* Acciones en desktop */}
      <div className="hidden sm:flex items-center gap-2">
        <button
          onClick={() => exportSelectedOrdersToPDF(selectedOrders)}
          className="p-2 hover:bg-gray-200 dark:hover:bg-neutral-700 rounded"
          title="Exportar a PDF"
        >
          <FileText className="w-5 h-5" />
        </button>
        <button
          onClick={() => exportSelectedOrdersToExcel(selectedOrders)}
          className="p-2 hover:bg-gray-200 dark:hover:bg-neutral-700 rounded"
          title="Exportar a Excel"
        >
          <FileSpreadsheet className="w-5 h-5" />
        </button>
        <button
          onClick={() => exportSelectedOrdersToWord(selectedOrders)}
          className="p-2 hover:bg-gray-200 dark:hover:bg-neutral-700 rounded"
          title="Exportar a Word"
        >
          <File className="w-5 h-5" />
        </button>
        <button
          onClick={onBulkStatusChange}
          className="ml-2 px-3 py-1 bg-emerald-600 text-white text-sm rounded hover:bg-emerald-700"
        >
          Cambiar estado
        </button>
      </div>

      {/* Mobile: Menú contextual */}
      <div className="sm:hidden">
        <Menu as="div" className="relative inline-block text-left">
          <MenuButton className="p-2 hover:bg-gray-200 dark:hover:bg-neutral-700 rounded">
            <MoreVertical className="w-5 h-5" />
          </MenuButton>
          <MenuItems className="absolute right-0 mt-2 w-40 z-50 bg-white dark:bg-neutral-800 border dark:border-neutral-700 rounded shadow">
            <MenuItem>
              {({ active }) => (
                <button
                  onClick={() => exportSelectedOrdersToPDF(selectedOrders)}
                  className={`w-full text-left px-4 py-2 text-sm ${active ? 'bg-gray-100 dark:bg-neutral-700' : ''}`}
                >
                  Exportar a PDF
                </button>
              )}
            </MenuItem>
            <MenuItem>
              {({ active }) => (
                <button
                  onClick={() => onBulkStatusChange()}
                  className={`w-full text-left px-4 py-2 text-sm ${active ? 'bg-gray-100 dark:bg-neutral-700' : ''}`}
                >
                  Cambiar estado
                </button>
              )}
            </MenuItem>
          </MenuItems>
        </Menu>
      </div>
    </div>
  )
}
