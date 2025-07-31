// src/pages/orders/OrderConfirmation.jsx
import { useLocation, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import {
  Check,
  Edit2,
  MapPin,
  Mail,
  Phone,
  UserRound,
  Share2,
} from 'lucide-react'
import { createOrder } from '../../api/orders'
import OrderDetailsCard from '../../components/OrderDetailsCard'

const OrderConfirmation = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { state } = location
  const [order, setOrder] = useState(state || null)

  useEffect(() => {
    if (!state) navigate('/orders')
  }, [state])

  if (!order) return null

  const { customer, products = [], deposit, shipping } = order
  const subtotal = products.reduce((sum, p) => sum + (p.price || 0), 0)
  const total = subtotal - (deposit || 0)

  const [loading, setLoading] = useState(false)

  const handleConfirm = async () => {
    setLoading(true)

    try {
      const cleanProducts = order.products.map((p) => ({
        type: p.type,
        quantity: Number(p.quantity),
        price: Number(p.price),
        description: p.description || '',
        glazes: {
          interior: p.glazeInterior || null,
          exterior: p.glazeExterior || null,
        },
        decorations: p.decorations || {},
        images: p.images.map((img) =>
          typeof img === 'string' ? img : URL.createObjectURL(img)
        ),
      }))

      const payload = {
        customer: order.customer,
        status: order.status,
        date: order.date,
        deposit: Number(order.deposit || 0),
        notes: order.notes || '',
        shipping: {
          isRequired: order.shipping?.isRequired || false,
          addresses: order.shipping?.addresses || [],
        },
        products: cleanProducts,
      }

      console.log('Payload to backend:', payload)
      const saved = await createOrder(payload)

      navigate(`/orders/${saved._id}/details`)
    } catch (err) {
      console.error('Failed to confirm order:', err)
      alert('Error al guardar el pedido')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white text-white dark:bg-neutral-900 flex flex-col items-center px-4 py-6">
      <OrderDetailsCard order={order} />

      <button
        onClick={handleConfirm}
        disabled={loading}
        className="w-64 bg-black text-white mt-4 py-3 rounded-full font-semibold flex items-center justify-center gap-2"
      >
        <Check size={18} />
        {loading ? 'Guardando...' : 'Confirmar'}
      </button>

      <p className="text-xs text-white mt-4 flex items-center gap-2">
        <Share2 size={12} />
        Opción de compartir el pedido
      </p>
    </div>
  )
}

export default OrderConfirmation
