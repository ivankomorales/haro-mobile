// comments in English only
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import {
  MoreVertical,
  Search,
  XCircle,
  FileText,
  FileSpreadsheet,
  Clock,
  X,
  Trash2,
} from 'lucide-react'
import FormInput from './FormInput'
import OrdersFilters from './OrdersFilters'

export default function OrderActionsBar({
  t,
  // Search (controlled)
  searchValue = '',
  onSearchChange,
  // Filters (controlled)
  filtersValue,
  onFiltersChange,
  // Selection (to disable actions when empty)
  selectedIds = [],
  // Actions
  onExportPDFClick, // () => void
  onOpenExcelClick, // () => void
  onBulkStatusChange, // () => void
  // UI
  minimal = false, // << NEW: render as inline row (no card)
  className = '',
  // Chips (rendered here, state in parent)
  chips = [], // [{ key, label }]
  onClearChip, // (key) => void
  onClearAllChips, // () => void
  chipsBreakpoint = 'md', // 'sm' | 'md' | 'lg' …
}) {
  const hasSelection = selectedIds?.length > 0

  const containerClasses = minimal
    ? // Inline row: no background, no borders, no padding
      'mt-2 flex flex-col gap-2 bg-transparent p-0 border-0'
    : // Card look (legacy)
      'mt-2 flex flex-col gap-2 rounded-md bg-white p-2 dark:bg-neutral-900'

  const menuItemsClasses = [
    'z-50 mt-1 w-40 overflow-hidden rounded-md border border-neutral-200 p-1 shadow-lg focus:outline-none',
    'bg-white text-neutral-900',
    'dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100', // strong contrast in dark
  ].join(' ')

  const itemClass = (active, disabled) =>
    [
      'w-full justify-start rounded px-2 py-1.5 text-left text-sm inline-flex items-center gap-2',
      active ? 'bg-neutral-100 dark:bg-neutral-800' : '',
      disabled ? 'cursor-not-allowed opacity-50' : '',
      'text-neutral-900 dark:text-neutral-100', // <-- force readable text
    ].join(' ')

  return (
    <div className={[containerClasses, className].join(' ')}>
      {/* Row: Chips + Search w/Filters • Kebab */}
      <div className="flex min-w-0 flex-row flex-nowrap items-center gap-2">
        {/* Chips: same namespace as search/filters, hidden on mobile */}
        {chips?.length > 0 && (
          <div className="mt-1 hidden flex-wrap items-center gap-2 md:flex">
            {chips.map((c) => (
              <span
                key={c.key}
                className="inline-flex items-center gap-2 rounded-full bg-neutral-100 px-2.5 py-1 text-sm dark:bg-neutral-800"
              >
                {c.label}
                <button
                  type="button"
                  onClick={() => onClearChip?.(c.key)}
                  className="inline-flex h-5 w-5 items-center justify-center rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-700"
                  title={t('button.clear') || 'Clear'}
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
            <button
              type="button"
              onClick={() => onClearAllChips?.()}
              className="ml-1 rounded px-2 py-1 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              <Trash2 className="h-5 w-5" />
              {/* {t('clear') || 'Clear all'} */}
            </button>
          </div>
        )}
        {/* Search (keep it compact) */}
        <div className="relative w-full min-w-0 sm:ml-auto sm:w-auto md:w-72 lg:w-94">
          {/* Input: left prefix = Search; right padding reserves room for clear + filter */}
          <FormInput
            name="search"
            value={searchValue}
            onChange={(e) => onSearchChange?.(e.target.value)}
            floating={false}
            placeholder={t('order.search')}
            prefix={<Search className="h-4 w-4 text-neutral-500 dark:text-neutral-400" />}
            inputClassName="pr-24" // reserve right space for the controls box
          />

          {/* Right controls box (absolute, on top of the input; does not push layout) */}
          <div className="absolute inset-y-0 right-2 flex items-center gap-1">
            {/* Clear button */}
            {!!searchValue && (
              <button
                type="button"
                onClick={() => onSearchChange?.('')}
                aria-label={t('button.clear') || 'Clear'}
                className="rounded p-1 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                <XCircle className="h-5 w-5" />
              </button>
            )}

            {/* Inline compact filter trigger with non-pushing badge */}
            <OrdersFilters
              t={t}
              value={filtersValue}
              onChange={(v) => onFiltersChange?.(v)}
              compact
            />
          </div>
        </div>

        {/* Kebab */}
        <div className="sm:shrink-0">
          <Menu as="div" className="relative inline-block text-left">
            <MenuButton
              className="inline-flex items-center justify-center rounded-md border border-neutral-200 px-2 py-2 hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-800"
              aria-label={t('buttons.more') || 'More'}
              title={t('buttons.more') || 'More'}
            >
              <MoreVertical className="h-5 w-5" />
            </MenuButton>

            <MenuItems anchor="bottom end" className={menuItemsClasses}>
              {/* Export PDF */}
              <MenuItem
                as="button"
                disabled={!hasSelection}
                onClick={() => onExportPDFClick?.()}
                className={({ focus, disabled }) => itemClass(focus, disabled)}
                title={
                  hasSelection
                    ? t('button.exportPdf') || 'Export PDF'
                    : t('messages.selectAtLeastOneOrder') || 'Select at least one order'
                }
              >
                <FileText className="h-4 w-4 text-red-800 dark:text-red-400" />
                <span>{t('button.exportPdf') || 'Export PDF'}</span>
              </MenuItem>

              {/* Export Excel */}
              <MenuItem
                as="button"
                disabled={!hasSelection}
                onClick={() => onOpenExcelClick?.()}
                className={({ focus, disabled }) => itemClass(focus, disabled)}
                title={
                  hasSelection
                    ? t('button.exportExcel') || 'Export Excel'
                    : t('messages.selectAtLeastOneOrder') || 'Select at least one order'
                }
              >
                <FileSpreadsheet className="h-4 w-4 text-green-600 dark:text-green-400" />
                <span>{t('button.exportExcel') || 'Export Excel'}</span>
              </MenuItem>

              {/* Change Status */}
              <MenuItem
                as="button"
                disabled={!hasSelection}
                onClick={() => onBulkStatusChange?.()}
                className={({ focus, disabled }) => itemClass(focus, disabled)}
                title={
                  hasSelection
                    ? t('button.changeStatus') || 'Change status'
                    : t('messages.selectAtLeastOneOrder') || 'Select at least one order'
                }
              >
                <Clock className="h-4 w-4" />
                <span>{t('button.changeStatus') || 'Change status'}</span>
              </MenuItem>
            </MenuItems>
          </Menu>
        </div>
      </div>
    </div>
  )
}
