import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeftIcon } from '@heroicons/react/24/outline'
import FloatingInput from '../../components/FloatingInput'
import { useCreateUser } from '../../hooks/useCreateUser'

export default function AddUser() {
  const navigate = useNavigate()
  const { create } = useCreateUser(navigate)

  const [formData, setFormData] = useState({
    name: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'employee',
  })

  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    setError(null)
    setSuccess(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      await create(formData) // ✅ this handles validation and logout

      setSuccess('User created successfully!')
      setFormData({
        name: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'employee',
      })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="pt-10 px-4 pb-20 min-h-screen bg-white dark:bg-neutral-900 text-gray-800 dark:text-gray-100 font-sans">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 flex items-center text-sm text-blue-600 dark:text-blue-400 hover:underline "
      >
        <ChevronLeftIcon className="h-5 w-5 mr-1" />
        Volver
      </button>

      <h1 className="text-xl font-semibold mb-6 text-center">
        Crear nuevo usuario
      </h1>

      <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-6">
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

        <FloatingInput
          label="Correo electrónico"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          required
        />

        <FloatingInput
          label="Contraseña"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          required
          minLength={6}
          showToggle
        />

        <FloatingInput
          label="Confirmar contraseña"
          name="confirmPassword"
          type="password"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
          showToggle
        />

        <div>
          <label className="block text-sm mb-1">Rol</label>
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="w-full p-2 border rounded dark:bg-neutral-800 dark:border-gray-600"
          >
            <option value="employee">Empleado</option>
            <option value="admin">Administrador</option>
          </select>
        </div>

        {error && <div className="text-red-500 text-sm">{error}</div>}
        {success && <div className="text-green-600 text-sm">{success}</div>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Creando...' : 'Crear usuario'}
        </button>
      </form>
    </div>
  )
}
