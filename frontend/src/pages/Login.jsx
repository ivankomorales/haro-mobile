import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import FloatingInput from '../components/FloatingInput'

export default function Login() {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email || !password) return alert('Please fill in all fields')
    await login(email, password)
  }

  return (
    <div className="flex items-center justify-center h-screen bg-white dark:bg-neutral-900 text-gray-900 dark:text-gray-100 px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-neutral-800 p-6 rounded-xl shadow-md w-full max-w-sm flex flex-col gap-4"
      >
        <h2 className="text-xl font-semibold text-center">Login</h2>

        <FloatingInput
          label="Correo electrónico"
          name="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <FloatingInput
          label="Contraseña"
          name="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          
        />

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
