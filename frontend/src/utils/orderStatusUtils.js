// src/utils/orderStatusUtils.js

// Utility to map backend statuses to i18n keys
export const STATUS = {
  NEW: 'new',
  PENDING: 'pending',
  IN_PROGRESS: 'inProgress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
}

export const STATUS_LABELS = {
  [STATUS.NEW]: 'New',
  [STATUS.PENDING]: 'Pending',
  [STATUS.IN_PROGRESS]: 'In Progress',
  [STATUS.COMPLETED]: 'Completed',
  [STATUS.CANCELLED]: 'Cancelled',
}

export const STATUS_COLORS = {
  [STATUS.NEW]: 'bg-gray-200',
  [STATUS.PENDING]: 'bg-yellow-200',
  [STATUS.IN_PROGRESS]: 'bg-blue-200',
  [STATUS.COMPLETED]: 'bg-green-200',
  [STATUS.CANCELLED]: 'bg-red-200',
}

export const STATUS_TEXT_COLORS = {
  [STATUS.NEW]: 'text-gray-800',
  [STATUS.PENDING]: 'text-yellow-900',
  [STATUS.IN_PROGRESS]: 'text-blue-900',
  [STATUS.COMPLETED]: 'text-green-900',
  [STATUS.CANCELLED]: 'text-red-900',
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
