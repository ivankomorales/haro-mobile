// src/pages/Login.jsx
// comments in English only
import { useState, useEffect } from 'react'
import { Mail, LockKeyhole } from 'lucide-react'
import FormInput from '../components/FormInput'
import { useAuth } from '../hooks/useAuth'
import { getMessage as t } from '../utils/getMessage'
import { Spinner } from '../components/Spinner'

export default function Login() {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    // hard reset in case the browser persisted something odd
    try {
      // window (no scroll anyway, but benign)
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
      // if a previous dashboard was still mounted in history, nuke its scroller position
      const scroller = document.getElementById('scrollable-content')
      if (scroller) scroller.scrollTop = 0
    } catch {}
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (isSubmitting) return // avoid double submit

    const newErrors = {}
    if (!email) newErrors.email = 'auth.emailRequired'
    if (!password) newErrors.password = 'auth.passwordRequired'
    if (Object.keys(newErrors).length) {
      setErrors(newErrors)
      return
    }

    setIsSubmitting(true)
    setErrors({})
    try {
      await login(email, password)
      // If login navigates internally, no-op; otherwise you could redirect here.
    } catch (err) {
      setErrors({ form: err.message || 'auth.loginFailed' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="app-shell grid min-h-[100svh] place-items-center overflow-hidden bg-white px-4 dark:bg-neutral-900">
      <form
        onSubmit={handleSubmit}
        className="flex w-full max-w-sm flex-col gap-4 rounded-xl bg-white p-6 shadow-md dark:bg-neutral-800"
        aria-busy={isSubmitting ? 'true' : 'false'}
      >
        <h2 className="text-center text-xl font-semibold dark:text-white">Login</h2>

        <FormInput
          label={t('login.email')}
          floating={false}
          name="email"
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value)
            setErrors((prev) => ({ ...prev, email: null }))
          }}
          error={errors.email}
          errorFormatter={t}
          prefix={<Mail className="h-5 w-5" />}
          placeholder=""
          disabled={isSubmitting}
        />

        <FormInput
          label={t('login.password')}
          floating={false}
          type="password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value)
            setErrors((prev) => ({ ...prev, password: null }))
          }}
          showToggle
          error={errors.password}
          errorFormatter={t}
          prefix={<LockKeyhole className="h-5 w-5" />}
          placeholder=""
          disabled={isSubmitting}
        />

        {errors.form && (
          <div className="-mt-2 text-center text-sm text-red-500">{t(errors.form)}</div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className={`inline-flex items-center justify-center gap-2 rounded-full p-3 font-medium text-white transition ${isSubmitting ? 'bg-neutral-700 opacity-90 dark:bg-blue-600' : 'bg-black hover:bg-neutral-900 dark:bg-blue-500'}`}
        >
          {isSubmitting ? (
            <>
              <Spinner className="h-4 w-4" label={t('button.loggingIn')} />
              <span>{t('button.loggingIn')}</span>
            </>
          ) : (
            <span>{t('button.login')}</span>
          )}
        </button>
      </form>
    </div>
  )
}
