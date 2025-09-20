// src/components/OrderCard.jsx
import React from 'react'

import { getStatusLabel, getStatusClasses } from '../utils/orderStatusUtils'

function OrderCardBase({ order, selectable = false, isSelected = false, onSelect, onClick, t }) {
  // --- status mapping (canonical -> UI label/colors) ---
  const status = order?.status
  const label = getStatusLabel(status, t)
  const chipClasses = getStatusClasses(status)

  // --- prefer business date (orderDate) over createdAt ---
  const whenRaw = order?.orderDate ?? order?.createdAt
  const whenStr = whenRaw ? new Date(whenRaw).toLocaleDateString('es-MX') : 'Sin fecha'

  // --- safe customer full name (avoid "undefined") ---
  const customerName =
    [order?.customer?.name, order?.customer?.lastName].filter(Boolean).join(' ') ||
    'Cliente desconocido'

  // --- safe order id (UI, one-line) ---
  const orderIdStr = order?.orderID || order?._id || '—'

  return (
    <li
      className="flex cursor-pointer items-center gap-3 rounded-lg bg-white p-4 shadow transition hover:bg-gray-50 dark:bg-neutral-800 dark:hover:bg-neutral-700"
      onClick={onClick}
    >
      {selectable && (
        <label onClick={(e) => e.stopPropagation()} className="cursor-pointer p-2">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={onSelect}
            className="h-5 w-5 accent-blue-600"
          />
        </label>
      )}

      {/* Two columns: left grows and can truncate; right is shrink-locked */}
      <div className="flex w-full items-center justify-between">
        {/* LEFT: name + date (single-line each, ellipsis if needed) */}
        <div className="min-w-0 flex-1 pr-3">
          <p className="truncate text-sm font-semibold">{customerName}</p>
          <p className="text-xs whitespace-nowrap text-gray-500">{whenStr}</p>
        </div>

        {/* RIGHT: order id + status chip (no wrap) */}
        <div className="shrink-0 text-right">
          <p className="max-w-[160px] truncate text-sm font-medium whitespace-nowrap">
            {orderIdStr}
          </p>

          <span
            className={`${chipClasses} max-w-[180px] truncate`}
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
