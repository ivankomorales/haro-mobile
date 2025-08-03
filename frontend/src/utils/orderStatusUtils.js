// utils/orderUtils.js

// Builds a payload array for updating the status of multiple orders
export function buildStatusUpdatePayload(orders, newStatus) {
  return orders.map((order) => ({
    _id: order._id,
    status: newStatus,
  }))
}

// TODO: Add dynamic UI coloring based on order status
export const STATUS_COLORS = {
  New: 'gray',
  Pending: 'yellow',
  Completed: 'green',
  Cancelled: 'red',
}

// TODO: Replace with localized labels if needed
export const STATUS_LABELS = {
  New: 'Nuevo',
  Pending: 'Pendiente',
  Completed: 'Completado',
  Cancelled: 'Cancelado',
}

// TODO: Implement valid status transitions if needed in the future
// export function canTransition(from, to) {
//   const allowed = {
//     New: ['Pending', 'Cancelled'],
//     Pending: ['Completed', 'Cancelled'],
//     Completed: [],
//     Cancelled: [],
//   }
//   return allowed[from]?.includes(to)
// }
