// src/utils/orderStatusUtils.js

// Utility to map backend statuses to i18n keys
export const STATUS_LABELS = {
  New: 'new',
  Pending: 'pending',
  'In Progress': 'inProgress',
  Completed: 'completed',
  Cancelled: 'cancelled',
}

// Tailwind-compatible color classes (just background)
export const STATUS_COLORS = {
  New: 'bg-gray-300',
  Pending: 'bg-yellow-300',
  'In Progress': 'bg-blue-300',
  Completed: 'bg-green-300',
  Cancelled: 'bg-red-300',
}

// Optional: Text color variant (for dark mode tweaks)
export const STATUS_TEXT_COLORS = {
  New: 'text-gray-800',
  Pending: 'text-yellow-800',
  'In Progress': 'text-blue-800',
  Completed: 'text-green-800',
  Cancelled: 'text-red-800',
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

// Used when building bulk update payloads
export function buildStatusUpdatePayload(orders, newStatus) {
  return orders.map((order) => ({
    _id: order._id,
    status: newStatus,
  }))
}
