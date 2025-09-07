import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import FormInput from '../../components/FormInput'
import { useCreateUser } from '../../hooks/useCreateUser'
import FormActions from '../../components/FormActions'
import { getMessage as t } from '../../utils/getMessage'
import { showSuccess, showError } from '../../utils/toastUtils'
import { getOriginPath } from '../../utils/navigationUtils'
import { useLayout } from '../../context/LayoutContext'

export default function AddUser() {
  const navigate = useNavigate()
  const location = useLocation()
  const originPath = getOriginPath(location.state?.originPath ?? location.state?.from)
  const { create } = useCreateUser(navigate)

  // Top Bar Actions
  const { setTitle, setShowSplitButton, resetLayout } = useLayout()

  useEffect(() => {
    setTitle(t('user.title'))
    setShowSplitButton(false)

    return resetLayout
  }, [setTitle, setShowSplitButton, resetLayout])

  const [formData, setFormData] = useState({
    name: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'employee',
  })

  const [loading, setLoading] = useState(false)

  // console.log('📦 location.state:', location.state)
  // console.log('📍 originPath (raw):', location.state?.originPath)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      await create(formData) // ✅ this handles validation and logout

      showSuccess('success.user.created')
      setFormData({
        name: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'employee',
      })
    } catch (err) {
      showError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white px-4 pt-10 pb-24 font-sans text-gray-800 dark:bg-neutral-900 dark:text-gray-100">
      {/* <button
        onClick={() => navigate(-1)}
        className="mb-4 flex items-center text-sm text-blue-600 dark:text-blue-400 hover:underline "
      >
        <ChevronLeft className="h-5 w-5 mr-1" />
        {t('button.back')}
      </button> */}

      {/* <h1 className="text-xl font-semibold mb-6 text-center">
        {t('user.title')}
      </h1> */}

      <form onSubmit={handleSubmit} className="mx-auto max-w-md space-y-6">
        <FormInput
          label={t('user.name')}
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
        />

        <FormInput
          label={t('user.lastName')}
          name="lastName"
          value={formData.lastName}
          onChange={handleChange}
          required
        />

        <FormInput
          label={t('user.email')}
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          required
        />

        <FormInput
          label={t('user.password')}
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          required
          minLength={6}
          showToggle
        />

        <FormInput
          label={t('user.confirmPassword')}
          name="confirmPassword"
          type="password"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
          showToggle
        />

        <div>
          <label className="mb-1 block text-sm">Rol</label>
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="w-full rounded border p-2 dark:border-gray-600 dark:bg-neutral-800"
          >
            <option value="employee">{t('user.employee')}</option>
            <option value="admin">{t('user.admin')}</option>
          </select>
        </div>

        <FormActions onSubmit={handleSubmit} cancelRedirect={originPath} />
      </form>
    </div>
  )
}
