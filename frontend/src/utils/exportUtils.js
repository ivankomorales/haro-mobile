// frontend/src/utils/exportUtils.js
import { showError, showLoading, dismissToast } from './toastUtils'

export async function exportSelectedOrdersToPDF(orderIds) {
  if (!orderIds.length) {
    return showError('order.noneSelected')
  }

  const toastId = showLoading('order.exportingPDF')

  try {
    const res = await fetch('/api/orders/export/pdf', {
      method: 'POST',
      body: JSON.stringify({ orderIds }),
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    })

    if (!res.ok) throw new Error('Export failed')

    const blob = await res.blob()
    const url = window.URL.createObjectURL(blob)

    let date_time = new Date()
    let day = String(date_time.getDate()).padStart(2, '0')
    let month = String(date_time.getMonth() + 1).padStart(2, '0') // +1 porque empieza en 0
    let year = date_time.getFullYear()

    let fecha = `${day}-${month}-${year}`

    const a = document.createElement('a')
    a.href = url
    a.download = `pedidos-${fecha}.pdf`
    a.click()
    window.URL.revokeObjectURL(url)

    dismissToast(toastId)
  } catch (err) {
    console.error(err)
    dismissToast(toastId)
    showError('order.exportError')
  }
}

export async function exportSelectedOrdersToExcel(orderIds, fields) {
  if (!orderIds?.length) {
    return showError('order.noneSelected')
  }
  const toastId = showLoading('order.exportingXLS')
  try {
    const res = await fetch('/api/orders/export/excel', {
      method: 'POST',
      body: JSON.stringify({ orderIds, fields }),
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    })
    if (!res.ok) throw new Error('Export failed')

    const blob = await res.blob()
    const url = window.URL.createObjectURL(blob)
    const dt = new Date()
    const pad = (n) => String(n).padStart(2, '0')
    const fecha = `${pad(dt.getDate())}-${pad(dt.getMonth() + 1)}-${dt.getFullYear()}`
    const a = document.createElement('a')
    a.href = url
    a.download = `pedidos-${fecha}.xlsx`
    a.click()
    window.URL.revokeObjectURL(url)
    dismissToast(toastId)
  } catch (err) {
    console.error(err)
    dismissToast(toastId)
    showError('order.exportError')
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
 * @param {Array} glazes - array of glaze objects
 */
export async function exportGlazesToCSV(glazes) {
  if (!Array.isArray(glazes) || glazes.length === 0) {
    return showError('No glazes to export')
  }

  const toastId = showLoading('Exporting CSV…')
  try {
    const headers = ['Name', 'Code', 'Hex', 'Active', 'Image URL', 'Updated At', 'Created At', 'ID']
    const rows = glazes.map((g) => [
      g.name || '',
      g.code || '',
      g.hex || '',
      g.isActive ? 'true' : 'false',
      g.image || '',
      g.updatedAt || '',
      g.createdAt || '',
      g._id || '',
    ])

    const csv = makeCSV(headers, rows)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `glazes-${todayStamp()}.csv`
    a.click()
    URL.revokeObjectURL(url)
    dismissToast(toastId)
  } catch (err) {
    console.error(err)
    dismissToast(toastId)
    showError('Export failed')
  }
}
