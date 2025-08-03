// utils/orderUtils.js
export function buildStatusUpdatePayload(orders, newStatus) {
  return orders.map((order) => ({
    _id: order._id,
    status: newStatus,
  }))
}

// TODO in the Future
export const STATUS_COLORS = {
  New: 'gray',
  Pending: 'yellow',
  Completed: 'green',
  Cancelled: 'red',
}

export const STATUS_LABELS = {
  New: 'Nuevo',
  Pending: 'Pendiente',
  Completed: 'Completado',
  Cancelled: 'Cancelado',
}

// TODO Valid transitions:
//export function canTransition(from, to) {
//  const allowed = {
//    /New: ['Pending', 'Cancelled'],
//    Pending: ['Completed', 'Cancelled'],
//    Completed: [],
//    Cancelled: [],
//  }
//  return allowed[from]?.includes(to)
//}