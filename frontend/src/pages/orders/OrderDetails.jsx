import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import fetchWithAuth from '../../utils/fetchWithAuth'

export default function OrderDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadOrder = async () => {
      try {
        const res = await fetchWithAuth(`/api/orders/${id}`)
        setOrder(res)
      } catch (err) {
        console.error('Error loading order:', err)
        navigate('/login') // fallback si el token no es válido
      } finally {
        setLoading(false)
      }
    }

    loadOrder()
  }, [id])

  if (loading) return <p className="p-4">Cargando pedido...</p>
  if (!order) return <p className="p-4">Pedido no encontrado.</p>

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-xl font-bold mb-4">Detalle del Pedido</h1>

      <p>
        <strong>Folio:</strong> {order.orderID}
      </p>
      <p>
        <strong>Cliente:</strong> {order.customer?.name}
      </p>
      <p>
        <strong>Estatus:</strong> {order.status}
      </p>
      <p>
        <strong>Anticipo:</strong> ${order.deposit}
      </p>
      <p>
        <strong>Notas:</strong> {order.notes}
      </p>

      <h2 className="text-lg font-semibold mt-6">Productos:</h2>
      <ul className="list-disc ml-6 mt-2 space-y-1">
        {order.products.map((p, idx) => (
          <li key={idx}>
            {p.type} — {p.quantity} piezas — ${p.price}
          </li>
        ))}
      </ul>
    </div>
  )
}
