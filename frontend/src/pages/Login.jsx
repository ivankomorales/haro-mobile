import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import FormInput from '../components/FormInput'
import { getMessage as t } from '../utils/getMessage'

export default function Login() {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState({})

  const handleSubmit = async (e) => {
    e.preventDefault()

    const newErrors = {}
    if (!email) newErrors.email = 'auth.emailRequired'
    if (!password) newErrors.password = 'auth.passwordRequired'

    if (Object.keys(newErrors).length) {
      setErrors(newErrors)
      return
    }

    try {
      await login(email, password)
    } catch (err) {
      setErrors({ form: err.message || 'auth.loginFailed' })
    }
  }

  return (
    <div className="app-shell grid min-h-[100svh] place-items-center overflow-hidden bg-white px-4 dark:bg-neutral-900">
      <form
        onSubmit={handleSubmit}
        className="flex w-full max-w-sm flex-col gap-4 rounded-xl bg-white p-6 shadow-md dark:bg-neutral-800"
      >
        <h2 className="text-center text-xl font-semibold">Login</h2>

        <FormInput
          label={t('login.email')}
          name="email"
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value)
            setErrors((prev) => ({ ...prev, email: null }))
          }}
          error={errors.email}
          errorFormatter={t}
        />

        <FormInput
          label={t('login.password')}
          name="password"
          type="password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value)
            setErrors((prev) => ({ ...prev, password: null }))
          }}
          showToggle
          error={errors.password}
          errorFormatter={t}
        />

        {/* Mensaje de error general */}
        {errors.form && (
          <div className="-mt-2 text-center text-sm text-red-500">{t(errors.form)}</div>
        )}

        <button
          type="submit"
          className="rounded-full bg-black p-3 font-medium text-white transition hover:bg-neutral-900 dark:bg-amber-500"
        >
          {t('button.login')}
        </button>
      </form>
    </div>
  )
}
