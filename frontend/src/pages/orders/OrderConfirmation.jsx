// src/pages/orders/OrderConfirmation.jsx
import { useLocation, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Check, Edit2, MapPin, Mail, Phone, User, Share2 } from 'lucide-react'
import { createOrder } from '../../api/orders'

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
          isRequired: Boolean(order.shipping),
          addresses: [],
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
    <div className="min-h-screen bg-black text-white flex flex-col items-center px-4 py-6">
      <div className="bg-white text-black w-full max-w-md rounded-3xl p-5 space-y-4 shadow-md">
        {/* Order Header */}
        <div className="text-center">
          <h2 className="text-xl font-semibold">
            ORD#{order.orderID || '-----'}
          </h2>
          <p className="text-sm text-gray-500">
            {order.date || 'Jun 20, 2025'}
          </p>
        </div>

        {/* Customer Info */}
        <div className="relative bg-gray-100 rounded-lg p-4">
          <div className="absolute top-2 right-2 cursor-pointer">
            <Edit2 size={16} />
          </div>
          <p className="font-semibold text-lg flex items-center gap-2">
            <User size={16} /> {customer?.name}
          </p>
          {customer?.phone && (
            <p className="flex items-center gap-2">
              <Phone size={14} /> {customer.phone}
            </p>
          )}
          {customer?.email && (
            <p className="flex items-center gap-2">
              <Mail size={14} /> {customer.email}
            </p>
          )}
          {customer?.social && (
            <p className="flex items-center gap-2">
              <MapPin size={14} /> {customer.social}
            </p>
          )}
          {shipping?.required && (
            <p className="text-red-500 font-semibold mt-1">Requiere envío *</p>
          )}
          <div className="border-t mt-3 pt-2 text-sm space-y-1">
            <p>Subtotal: ${subtotal}</p>
            <p>Anticipo: ${deposit || 0}</p>
            <p className="font-semibold">Total: ${total}</p>
          </div>
        </div>

        {/* Product List */}
        <div className="space-y-3">
          {products.map((product, idx) => (
            <div key={idx} className="bg-gray-50 rounded-xl p-3 relative">
              <div className="absolute top-2 right-2 cursor-pointer">
                <Edit2 size={16} />
              </div>
              <h3 className="font-semibold mb-1">Taza {idx + 1}</h3>
              <p className="text-sm">{product.quantity} Figura(s)</p>

              {/* Glazes */}
              {product.glazes?.length > 0 && (
                <div className="flex items-center gap-2 mt-2">
                  <p className="text-sm font-medium">Esmalte(s):</p>
                  {product.glazes.map((glaze, i) => (
                    <div
                      key={i}
                      className="w-6 h-6 rounded-full border"
                      style={{ backgroundColor: glaze?.color || '#ccc' }}
                      title={glaze?.name}
                    ></div>
                  ))}
                </div>
              )}

              {/* Description */}
              {product.description && (
                <p className="text-sm mt-2">
                  <span className="font-medium">Descripción:</span>{' '}
                  {product.description}
                </p>
              )}

              {/* Images */}
              {product.images?.length > 0 && (
                <div className="flex items-center gap-2 mt-3 overflow-x-auto">
                  {product.images.map((src, i) => (
                    <img
                      key={i}
                      src={src}
                      alt={`Producto ${idx + 1} - img ${i + 1}`}
                      className="w-16 h-16 object-cover rounded-lg border"
                    />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Confirm Button */}
        <button
          onClick={handleConfirm}
          disabled={loading}
          className="w-full bg-black text-white py-3 rounded-full font-semibold flex items-center justify-center gap-2"
        >
          <Check size={18} />
          {loading ? 'Guardando...' : 'Confirmar'}
        </button>
      </div>

      {/* Share Option */}
      <p className="text-xs text-white mt-4 flex items-center gap-2">
        <Share2 size={12} />
        Opción de compartir el pedido
      </p>
    </div>
  )
}

export default OrderConfirmation
