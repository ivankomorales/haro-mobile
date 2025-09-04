import { showError, showLoading, dismissToast } from './toastUtils'

export async function exportSelectedOrdersToPDF(orderIds) {
  if (!orderIds.length) {
    return showError('order.noneSelected')
  }

  const toastId = showLoading('order.exporting')

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

// TODO: Implementar exportación real
export async function exportSelectedOrdersToExcel(orderIds) {
  showError('order.exportExcelPending')
}

export async function exportSelectedOrdersToWord(orderIds) {
  showError('order.exportWordPending')
}
