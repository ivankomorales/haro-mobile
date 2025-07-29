import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import FloatingInput from '../../components/FloatingInput'
import AppBar from '../../components/AppBar'
import { Switch } from '@headlessui/react'

export default function NewOrder() {
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    name: '',
    lastName: '',
    phone: '',
    countryCode: '+52',
    email: '',
    date: '',
    status: 'New',
    deposit: '',
    notes: '',
    shipping: false,
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleToggle = () => {
    setFormData((prev) => ({ ...prev, shipping: !prev.shipping }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // TODO: validate and send data
    // Validación mínima
    if (
      !formData.name ||
      !formData.lastName ||
      !formData.status ||
      !formData.date
    ) {
      alert('Por favor completa los campos obligatorios')
      return
    }

    // Limpieza/parseo si es necesario
    const cleanData = {
      ...formData,
      deposit: Number(formData.deposit || 0),
      customer: {
        name: `${formData.name} ${formData.lastName}`,
        phone: `${formData.countryCode}${formData.phone}`,
        email: formData.email,
      },
    }

    navigate('/orders/new/products', { state: cleanData })

    console.log(formData)
  }

  return (
    <div
      className="
        min-h-screen pb-24 
        bg-white dark:bg-neutral-900 
        dark:text-gray-100 
      "
    >
      <AppBar
        left={<button onClick={() => navigate(-1)}>←</button>}
        progress={0.33}
      />

      <form
        onSubmit={handleSubmit}
        className="max-w-2xl mx-auto px-4 pt-6 space-y-6"
      >
        <h1 className="mb-2 text-xl font-semibold">Nuevo Pedido</h1>

        {/* Name + Last Name */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FloatingInput
            label="Nombre"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
          <FloatingInput
            label="Apellido"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            required
          />
        </div>

        {/* Phone + Email */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="flex gap-2">
            <select
              name="countryCode"
              value={formData.countryCode}
              onChange={handleChange}
              className="
                w-20 border rounded 
                dark:bg-neutral-800 dark:border-gray-700
              "
            >
              <option value="+52">+52</option>
              <option value="+1">+1</option>
              <option value="+54">+54</option>
              {/* Add more as needed */}
            </select>
            <FloatingInput
              label="Teléfono"
              name="phone"
              type="tel"
              pattern="\d{10}"
              maxLength={10}
              value={formData.phone}
              onChange={handleChange}
              required
            />
          </div>
          <FloatingInput
            label="Correo electrónico"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
          />
        </div>

        {/* Date + Status */}
        <div className="flex flex-row gap-4">
          <div className="w-1/2">
            <label
              className="
                block mb-1
                text-sm font-medium 
                text-gray-800 dark:text-gray-200 
              "
            >
              Fecha
            </label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
              className="
                w-full h-10 px-3 py-3
                text-sm 
                border rounded  
                dark:bg-neutral-800 dark:text-white dark:border-gray-600 
              "
            />
          </div>

          <div className="w-1/2">
            <label
              className="
                block mb-1
                text-sm font-medium 
                text-gray-800 dark:text-gray-200 
              "
            >
              Estado
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="
                w-full h-10 px-3 py-3
                text-sm 
                border rounded  
                dark:bg-neutral-800 dark:text-white dark:border-gray-600
              "
              required
            >
              <option value="New">Nuevo</option>
              <option value="Pending">Pendiente</option>
              <option value="In Progress">En proceso</option>
              <option value="Completed">Completado</option>
              <option value="Cancelled">Cancelado</option>
            </select>
          </div>
        </div>

        {/* Deposit + Shipping */}
        <div className="flex flex-row gap-4 mt-4">
          <div className="w-1/2">
            <FloatingInput
              label="Anticipo"
              name="deposit"
              type="number"
              value={formData.deposit}
              onChange={handleChange}
              min={0}
              max={9999}
              prefix="$"
            />
          </div>

          <div className="md:w-1/3 flex items-center justify-between px-2 mt-2 md:mt-0">
            <label className="text-sm font-medium text-gray-800 dark:text-gray-200">
              ¿Requiere envío?
            </label>
            <Switch
              checked={formData.shipping}
              onChange={handleToggle}
              className={`${
                formData.shipping ? 'bg-green-500' : 'bg-gray-300'
              } inline-flex relative w-11 h-6 items-center rounded-full transition-colors duration-200`}
            >
              <span
                className={`${
                  formData.shipping ? 'translate-x-6' : 'translate-x-1'
                } inline-block w-4 h-4 transform rounded-full bg-white transition-transform`}
              />
            </Switch>
          </div>
        </div>

        {/* Shipping address expansion (future) */}
        {formData.shipping && (
          <div className="p-4 border rounded bg-gray-50 dark:bg-neutral-800 dark:border-neutral-700">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Aquí iría la sección de direcciones de envío.
            </p>
          </div>
        )}

        {/* Notes */}
        <FloatingInput
          label="Notas"
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          maxLength={200}
        />
        <p className="text-right text-xs text-gray-400">
          {formData.notes.length}/200
        </p>

        <button
          type="submit"
          className="w-full py-2 rounded bg-black text-white hover:bg-neutral-800"
        >
          Crear
        </button>
      </form>
    </div>
  )
}
