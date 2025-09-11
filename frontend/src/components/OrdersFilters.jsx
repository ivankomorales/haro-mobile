// comments in English only
import { useEffect, useMemo, useState } from 'react'
import { SlidersHorizontal } from 'lucide-react'
import FormInput from '../components/FormInput'
import { UI_DMY, fromYMD } from '../utils/date' // <-- use fromYMD (no parseFlexible)

const DEFAULT_FILTERS = {
  status: 'all', // 'all' | 'new' | 'pending' | 'inProgress' | 'completed' | 'cancelled'
  dateFrom: '', // 'YYYY-MM-DD' | ''
  dateTo: '', // 'YYYY-MM-DD' | ''
  isUrgent: '', // '' | 'true' | 'false'
  shippingRequired: '', // '' | 'true' | 'false'
}

const STORAGE_KEY = 'orders:filters'

export default function OrdersFilters({
  value,
  onChange,
  className = '',
  t, // optional i18n function
}) {
  // tiny fallback if no i18n provided
  const tt = (k) =>
    t?.(k) ??
    ({
      'filters.title': 'Filtros',
      'status.label': 'Estado',
      'status.all': 'Todos',
      'status.new': 'Nuevo',
      'status.pending': 'Pendiente',
      'status.inProgress': 'En progreso',
      'status.completed': 'Completado',
      'status.cancelled': 'Cancelado',
      'labels.from': 'Desde',
      'labels.to': 'Hasta',
      'labels.urgent': 'Urgente',
      'labels.shippingRequired': 'Envío requerido',
      'labels.ignore': 'Ignorar',
      'labels.yes': 'Sí',
      'labels.no': 'No',
      'button.clear': 'Limpiar',
      'button.cancel': 'Cancelar',
      'button.apply': 'Aplicar',
    }[k] ||
      k)

  const initial = useMemo(
    () => ({
      ...DEFAULT_FILTERS,
      ...(value ?? loadSavedFilters()),
    }),
    [value]
  )

  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState(initial)

  useEffect(() => setDraft(initial), [initial])

  const activeCount = useMemo(() => countActive(draft), [draft])

  // single onChange compatible with FormInput (input/select/date)
  function handleChange(e) {
    const { name, value } = e.target
    setDraft((d) => ({ ...d, [name]: value }))
  }

  function apply() {
    const normalized = normalize(draft)
    saveFilters(normalized)
    onChange?.(normalized)
    setOpen(false)
  }

  function clearAll() {
    saveFilters(DEFAULT_FILTERS)
    onChange?.(DEFAULT_FILTERS)
    setDraft(DEFAULT_FILTERS)
    setOpen(false)
  }

  return (
    <div className={`relative ${className}`}>
      {/* Trigger */}
      <button
        id="orders-filter-button"
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-gray-200 px-3 hover:bg-neutral-100 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-neutral-700 dark:hover:bg-neutral-800"
        aria-haspopup="menu"
        aria-expanded={open}
        title={tt('filters.title')}
      >
        <SlidersHorizontal className="h-5 w-5" />
        {activeCount > 0 && (
          <span className="ml-1 inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-blue-600 px-1.5 text-[11px] font-semibold text-white">
            {activeCount}
          </span>
        )}
      </button>

      {/* Menu */}
      {open && (
        <div
          id="orders-filter-menu"
          role="menu"
          className="absolute right-0 z-50 mt-2 w-72 max-w-[calc(100vw-2rem)] space-y-3 rounded-md border border-gray-200 bg-white p-3 shadow-lg sm:w-80 dark:border-neutral-800 dark:bg-neutral-900"
        >
          {/* Status */}
          <FormInput
            as="select"
            name="status"
            label={tt('status.label')}
            value={draft.status}
            onChange={handleChange}
            floating={false}
          >
            <option value="all">{tt('status.all')}</option>
            <option value="new">{tt('status.new')}</option>
            <option value="pending">{tt('status.pending')}</option>
            <option value="inProgress">{tt('status.inProgress')}</option>
            <option value="completed">{tt('status.completed')}</option>
            <option value="cancelled">{tt('status.cancelled')}</option>
          </FormInput>

          {/* Dates */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <FormInput
              type="date"
              name="dateFrom"
              label={tt('labels.from')}
              value={draft.dateFrom} // YYYY-MM-DD in state
              onChange={handleChange} // FormInput will emit YYYY-MM-DD
              icon="calendar"
              floating={false}
              dateFormat={UI_DMY}
              // IMPORTANT: use fromYMD to give Date objects to the picker limits
              maxDate={draft.dateTo ? fromYMD(draft.dateTo) : undefined}
            />
            <FormInput
              type="date"
              name="dateTo"
              label={tt('labels.to')}
              value={draft.dateTo}
              onChange={handleChange}
              icon="calendar"
              floating={false}
              dateFormat={UI_DMY}
              minDate={draft.dateFrom ? fromYMD(draft.dateFrom) : undefined}
            />
          </div>

          {/* Booleans */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <FormInput
              as="select"
              name="isUrgent"
              label={tt('labels.urgent')}
              value={draft.isUrgent}
              onChange={handleChange}
              floating={false}
            >
              <option value="">{tt('labels.ignore')}</option>
              <option value="true">{tt('labels.yes')}</option>
              <option value="false">{tt('labels.no')}</option>
            </FormInput>

            <FormInput
              as="select"
              name="shippingRequired"
              label={tt('labels.shippingRequired')}
              value={draft.shippingRequired}
              onChange={handleChange}
              floating={false}
            >
              <option value="">{tt('labels.ignore')}</option>
              <option value="true">{tt('labels.yes')}</option>
              <option value="false">{tt('labels.no')}</option>
            </FormInput>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-1">
            <button
              onClick={clearAll}
              className="rounded px-2 py-1 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              {tt('button.clear')}
            </button>
            <div className="space-x-2">
              <button
                onClick={() => setOpen(false)}
                className="rounded border border-gray-300 px-3 py-1.5 text-sm hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
              >
                {tt('button.cancel')}
              </button>
              <button
                onClick={apply}
                className="rounded bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700"
              >
                {tt('button.apply')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ------ helpers (module-local) ------
function normalize(f) {
  return {
    status: f.status || 'all',
    dateFrom: f.dateFrom || '',
    dateTo: f.dateTo || '',
    isUrgent: f.isUrgent ?? '',
    shippingRequired: f.shippingRequired ?? '',
  }
}

function countActive(f) {
  let n = 0
  if (f.status && f.status !== 'all') n++
  if (f.dateFrom) n++
  if (f.dateTo) n++
  if (f.isUrgent !== '') n++
  if (f.shippingRequired !== '') n++
  return n
}

function loadSavedFilters() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const v = raw ? JSON.parse(raw) : null
    return v && typeof v === 'object' ? normalize(v) : DEFAULT_FILTERS
  } catch {
    return DEFAULT_FILTERS
  }
}

function saveFilters(f) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(normalize(f)))
  } catch {}
}
