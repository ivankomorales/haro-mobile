// src/components/OrderCard.jsx
import React from 'react'
import {
  STATUS_LABELS,
  STATUS_COLORS,
  STATUS_TEXT_COLORS,
} from '../utils/orderStatusUtils'

function OrderCardBase({
  order,
  selectable = false,
  isSelected = false,
  onSelect,
  onClick,
}) {
  // --- status mapping (canonical -> UI label/colors) ---
  const status = order?.status
  const label = STATUS_LABELS[status] ?? 'Unknown'
  const bg = STATUS_COLORS[status] ?? 'bg-neutral-300'
  const textColor = STATUS_TEXT_COLORS[status] ?? 'text-neutral-900'

  // --- prefer business date (orderDate) over createdAt ---
  const whenRaw = order?.orderDate ?? order?.createdAt
  const whenStr = whenRaw
    ? new Date(whenRaw).toLocaleDateString('es-MX')
    : 'Sin fecha'

  // --- safe customer full name (avoid "undefined") ---
  const customerName =
    [order?.customer?.name, order?.customer?.lastName]
      .filter(Boolean)
      .join(' ') || 'Cliente desconocido'

  // --- safe order id (UI, one-line) ---
  const orderIdStr = order?.orderID || order?._id || '—'

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
            className="w-5 h-5 accent-blue-600"
          />
        </label>
      )}

      {/* Two columns: left grows and can truncate; right is shrink-locked */}
      <div className="flex justify-between items-center w-full">
        {/* LEFT: name + date (single-line each, ellipsis if needed) */}
        <div className="min-w-0 flex-1 pr-3">
          <p className="text-sm font-semibold truncate">{customerName}</p>
          <p className="text-xs text-gray-500 whitespace-nowrap">{whenStr}</p>
        </div>

        {/* RIGHT: order id + status chip (no wrap) */}
        <div className="shrink-0 text-right">
          <p className="text-sm font-medium whitespace-nowrap truncate max-w-[160px]">
            {orderIdStr}
          </p>

          <span
            className={`
              inline-flex items-center whitespace-nowrap
              px-2 py-0.5 text-xs rounded font-semibold
              ${bg} ${textColor}
              max-w-[180px] truncate
            `}
            title={label} // full label on hover if truncated
          >
            {label}
          </span>
        </div>
      </div>
    </li>
  )
}

// Memoized version to avoid re-renders if props don’t change
export const OrderCard = React.memo(OrderCardBase)
