import {
  STATUS_COLORS,
  STATUS_TEXT_COLORS,
  STATUS_LABELS,
} from '../utils/orderStatusUtils'

const statusKeyMap = {
  New: 'new',
  Pending: 'pending',
  'In Progress': 'inProgress',
  Completed: 'completed',
  Cancelled: 'cancelled',
}

export default function OrderCard({
  order,
  selectable = false,
  isSelected = false,
  onSelect,
  onClick,
}) {
  return (
    <li
      className="
        p-4 rounded-lg shadow
        bg-white dark:bg-neutral-800
        cursor-pointer
        hover:bg-gray-50 dark:hover:bg-neutral-700
        transition
        flex items-center gap-3
      "
      onClick={onClick}
    >
      {selectable && (
        <label
          onClick={(e) => e.stopPropagation()}
          className="p-2 cursor-pointer"
        >
          <input
            type="checkbox"
            checked={isSelected}
            onChange={onSelect}
            className="w-5 h-5 accent-blue-500"
          />
        </label>
      )}

      <div className="flex justify-between items-center w-full">
        {/* Cliente + Fecha */}
        <div>
          <p className="text-sm font-semibold">
            {order.customer?.name} {order.customer?.lastName}
          </p>
          <p className="text-xs text-gray-500">
            {new Date(order.orderDate).toLocaleDateString()}
          </p>
        </div>

        {/* ID + Status */}
        <div className="text-right">
          <p className="text-sm font-medium">{order.orderID || order._id}</p>
          <span
            className={`px-2 py-0.5 text-xs rounded font-semibold 
             ${STATUS_COLORS[order.status]} ${STATUS_TEXT_COLORS[order.status] || ''}`}
          >
            {order.statusLabel}
          </span>
        </div>
      </div>
    </li>
  )
}
