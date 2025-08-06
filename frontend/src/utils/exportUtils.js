import fetchWithAuth from './fetchWithAuth'
import { showError, showLoading, dismissToast } from './toastUtils'

export async function exportSelectedOrdersToPDF(orderIds) {
  if (!orderIds.length) {
    return showError('order.noneSelected')
  }

  const toastId = showLoading('order.exporting')

  try {
    const res = await fetchWithAuth('/api/orders/export/pdf', {
      method: 'POST',
      body: JSON.stringify({ orderIds }),
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!res.ok) throw new Error('Export failed')

    const blob = await res.blob()
    const url = window.URL.createObjectURL(blob)

    const a = document.createElement('a')
    a.href = url
    a.download = 'pedidos.pdf'
    a.click()
    window.URL.revokeObjectURL(url)

    dismissToast(toastId)
  } catch (err) {
    console.error(err)
    dismissToast(toastId)
    showError('order.exportError')
  }
}

// TODO: Implementar exportación real
export async function exportSelectedOrdersToExcel(orderIds) {
  showError('order.exportExcelPending')
}

export async function exportSelectedOrdersToWord(orderIds) {
  showError('order.exportWordPending')
}
