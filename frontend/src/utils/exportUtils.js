// src/utils/exportUtils.js
import { showError, showLoading, dismissToast } from './toastUtils'
import { fetchWithAuthResponse } from './fetchWithAuth'

export async function exportSelectedOrdersToPDF(orderIds) {
  if (!orderIds.length) return showError('order.noneSelected')

  const toastId = showLoading('order.exportingPDF')
  try {
    const res = await fetchWithAuthResponse('/api/orders/export/pdf', {
      method: 'POST',
      body: { orderIds }, // body can be plain object; helper JSON-stringifies it
    })
    const blob = await res.blob()
    const url = window.URL.createObjectURL(blob)

    const d = new Date()
    const pad = (n) => String(n).padStart(2, '0')
    const fecha = `${pad(d.getDate())}-${pad(d.getMonth() + 1)}-${d.getFullYear()}`
    const a = document.createElement('a')
    a.href = url
    a.download = `pedidos-${fecha}.pdf`
    a.click()
    window.URL.revokeObjectURL(url)
  } catch (err) {
    console.error(err)
    showError('order.exportError')
  } finally {
    dismissToast(toastId)
  }
}

export async function exportSelectedOrdersToExcel(orderIds, fields) {
  if (!orderIds?.length) return showError('order.noneSelected')

  const toastId = showLoading('order.exportingXLS')
  try {
    const res = await fetchWithAuthResponse('/api/orders/export/excel', {
      method: 'POST',
      body: { orderIds, fields },
    })
    const blob = await res.blob()
    const url = window.URL.createObjectURL(blob)

    const d = new Date()
    const pad = (n) => String(n).padStart(2, '0')
    const fecha = `${pad(d.getDate())}-${pad(d.getMonth() + 1)}-${d.getFullYear()}`
    const a = document.createElement('a')
    a.href = url
    a.download = `pedidos-${fecha}.xlsx`
    a.click()
    window.URL.revokeObjectURL(url)
  } catch (err) {
    console.error(err)
    showError('order.exportError')
  } finally {
    dismissToast(toastId)
  }
}
// TODO
export async function exportSelectedOrdersToWord(orderIds) {
  showError('order.exportWordPending')
}

// Export Glazes to CSV
function pad2(n) {
  return String(n).padStart(2, '0')
}
function todayStamp() {
  const d = new Date()
  return `${pad2(d.getDate())}-${pad2(d.getMonth() + 1)}-${d.getFullYear()}`
}

function csvCell(val) {
  if (val == null) return ''
  const s = String(val)
  // escape quotes; wrap in quotes if contains comma/quote/newline
  const needsQuotes = /[",\n]/.test(s)
  const escaped = s.replace(/"/g, '""')
  return needsQuotes ? `"${escaped}"` : escaped
}

function makeCSV(headers, rows) {
  const head = headers.map(csvCell).join(',')
  const body = rows.map((r) => r.map(csvCell).join(',')).join('\n')
  return `${head}\n${body}`
}

/**
 * Export an array of glazes (visible rows) to CSV on the client.
 * @param {Map} glazes - Map of glaze objects
 */
export async function exportGlazesToCSV(glazesOrMap) {
  // Normalize input to a plain array
  const list = Array.isArray(glazesOrMap)
    ? glazesOrMap
    : glazesOrMap instanceof Map
      ? Array.from(glazesOrMap.values())
      : []

  if (list.length === 0) {
    return showError('No glazes to export')
  }

  const toastId = showLoading('Exporting CSV…')
  try {
    const headers = ['Name', 'Code', 'Hex', 'Active', 'Image URL', 'Updated At', 'Created At', 'ID']

    const toISO = (v) => (v ? new Date(v).toISOString() : '')
    const rows = list.map((g) => [
      g?.name ?? '',
      g?.code ?? '',
      // prefer `hex`, fallback to `colorHex`
      g?.hex ?? g?.colorHex ?? '',
      g?.isActive ? 'true' : 'false',
      g?.image ?? '',
      toISO(g?.updatedAt),
      toISO(g?.createdAt),
      String(g?._id ?? ''),
    ])

    const csv = makeCSV(headers, rows)

    // Add BOM so Excel opens UTF-8 accents correctly
    const blob = new Blob(['\ufeff', csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)

    const a = document.createElement('a')
    a.href = url
    a.download = `glazes-${todayStamp()}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)

    // Revoke after click (Safari quirk)
    setTimeout(() => URL.revokeObjectURL(url), 0)
    dismissToast(toastId)
  } catch (err) {
    console.error(err)
    dismissToast(toastId)
    showError('Export failed')
  }
}
