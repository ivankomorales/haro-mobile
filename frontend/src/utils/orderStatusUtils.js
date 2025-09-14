// src/utils/orderStatusUtils.js

/**
 * Canonical order statuses.
 * These values must stay consistent with the backend API.
 */
export const STATUS = {
  NEW: 'new',
  PENDING: 'pending',
  IN_PROGRESS: 'inProgress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
}

/**
 * i18n keys for each status.
 * Example: locales/en.js should contain entries like `status.new`, `status.pending`, etc.
 */
export const STATUS_I18N_KEYS = {
  [STATUS.NEW]: 'status.new',
  [STATUS.PENDING]: 'status.pending',
  [STATUS.IN_PROGRESS]: 'status.inProgress',
  [STATUS.COMPLETED]: 'status.completed',
  [STATUS.CANCELLED]: 'status.cancelled',
}

/**
 * Unified chip styles (light & dark mode).
 * Uses the same color palette defined in `StatusPill` (blue/amber/indigo/emerald/rose).
 */
const BASE_CHIP =
  'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold whitespace-nowrap ' +
  'ring-1 ring-inset' // subtle outline to improve visibility in both themes

export const STATUS_CLASSMAP = {
  [STATUS.NEW]:
    `${BASE_CHIP} bg-blue-100 text-blue-900 ring-blue-200/60 ` +
    `dark:bg-blue-900/40 dark:text-blue-200 dark:ring-blue-800/50`,
  [STATUS.PENDING]:
    `${BASE_CHIP} bg-amber-100 text-amber-900 ring-amber-200/60 ` +
    `dark:bg-amber-900/40 dark:text-amber-200 dark:ring-amber-800/50`,
  [STATUS.IN_PROGRESS]:
    `${BASE_CHIP} bg-indigo-100 text-indigo-900 ring-indigo-200/60 ` +
    `dark:bg-indigo-900/40 dark:text-indigo-200 dark:ring-indigo-800/50`,
  [STATUS.COMPLETED]:
    `${BASE_CHIP} bg-emerald-100 text-emerald-900 ring-emerald-200/60 ` +
    `dark:bg-emerald-900/40 dark:text-emerald-200 dark:ring-emerald-800/50`,
  [STATUS.CANCELLED]:
    `${BASE_CHIP} bg-rose-100 text-rose-900 ring-rose-200/60 ` +
    `dark:bg-rose-900/40 dark:text-rose-200 dark:ring-rose-800/50`,
}

/**
 * Fallback chip style for unknown/unmapped statuses.
 */
export const FALLBACK_CHIP =
  `${BASE_CHIP} bg-neutral-100 text-neutral-900 ring-neutral-200/60 ` +
  `dark:bg-neutral-800 dark:text-neutral-100 dark:ring-neutral-700`

/**
 * Returns the localized or human-readable label for a given status.
 *
 * @param {string} status - Canonical status value.
 * @param {function} [t] - Optional translation function (e.g. i18n.t).
 * @returns {string} Localized status label or a default English label.
 */
export function getStatusLabel(status, t) {
  const key = STATUS_I18N_KEYS[status]
  if (t && key) return t(key)

  switch (status) {
    case STATUS.NEW:
      return 'New'
    case STATUS.PENDING:
      return 'Pending'
    case STATUS.IN_PROGRESS:
      return 'In Progress'
    case STATUS.COMPLETED:
      return 'Completed'
    case STATUS.CANCELLED:
      return 'Cancelled'
    default:
      return 'Unknown'
  }
}

/**
 * Returns the CSS class string to style a status chip.
 *
 * @param {string} status - Canonical status value.
 * @returns {string} TailwindCSS classes for the given status.
 */
export function getStatusClasses(status) {
  return STATUS_CLASSMAP[status] || FALLBACK_CHIP
}

// Optional: valid transitions
// export function canTransition(from, to) {
//   const allowed = {
//     New: ['Pending', 'Cancelled'],
//     Pending: ['In Progress', 'Completed', 'Cancelled'],
//     'In Progress': ['Completed', 'Cancelled'],
//     Completed: [],
//     Cancelled: [],
//   }
//   return allowed[from]?.includes(to)
// }

/**
 * Utility for building a bulk status update payload.
 * Each order is mapped into `{ _id, status }`.
 *
 * @param {Array<{_id: string}>} orders - List of order objects.
 * @param {string} newStatus - New status to assign.
 * @returns {Array<{_id: string, status: string}>} Payload for API update.
 */
export function buildStatusUpdatePayload(orders, newStatus) {
  return orders.map((o) => ({ _id: o._id, status: newStatus }))
}
