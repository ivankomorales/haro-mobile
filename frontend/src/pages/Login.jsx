import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import FormInput from '../components/FormInput'
import { showError } from '../utils/toastUtils'

export default function Login() {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState({})

  const handleSubmit = async (e) => {
    e.preventDefault()

    const newErrors = {}
    if (!email) newErrors.email = 'auth.EmailRequired'
    if (!password) newErrors.password = 'auth.PasswordRequired'

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    try {
      await login(email, password)
    } catch (err) {
      setErrors({ form: 'auth.LoginFailed' })
    }
  }

  return (
    <div className="flex items-center justify-center h-screen bg-white dark:bg-neutral-900 text-gray-900 dark:text-gray-100 px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-neutral-800 p-6 rounded-xl shadow-md w-full max-w-sm flex flex-col gap-4"
      >
        <h2 className="text-xl font-semibold text-center">Login</h2>

        <FormInput
          label="Correo electrónico"
          name="email"
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value)
            setErrors((prev) => ({ ...prev, email: null }))
          }}
          error={errors.email}
        />

        <FormInput
          label="Contraseña"
          name="password"
          type="password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value)
            setErrors((prev) => ({ ...prev, password: null }))
          }}
          showToggle
          error={errors.password}
        />

        {/* Mensaje de error general */}
        {errors.form && (
          <div className="text-red-500 text-sm text-center -mt-2">
            {getMessage(errors.form)}
          </div>
        )}

        <button
          type="submit"
          className="p-3 font-medium text-white bg-black rounded-full dark:bg-amber-500 hover:bg-neutral-900 transition"
        >
          Ingresar
        </button>
      </form>
    </div>
  )
}
